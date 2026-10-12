const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getWsUrl() {
  for (let i = 0; i < 20; i++) {
    try {
      const data = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${PORT}/json/version`, res => {
          let body = '';
          res.on('data', c => body += c);
          res.on('end', () => resolve(body));
        }).on('error', reject);
      });
      return JSON.parse(data).webSocketDebuggerUrl;
    } catch (e) {
      await sleep(500);
    }
  }
  throw new Error('Could not connect');
}

(async () => {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--disable-blink-features=AutomationControlled',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_reg_err_' + Date.now(),
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
    await new Promise(r => ws.on('open', r));

    let id = 1;
    const send = (m, p = {}) => new Promise(r => {
      const msgId = id++;
      const h = d => {
        const msg = JSON.parse(d);
        if (msg.id === msgId) { ws.off('message', h); r(msg.result); }
      };
      ws.on('message', h);
      ws.send(JSON.stringify({ id: msgId, method: m, params: p }));
    });

    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const pageWs = new WebSocket(`ws://127.0.0.1:${PORT}/devtools/page/${targetId}`);
    await new Promise(r => pageWs.on('open', r));

    let pid = 1;
    const sendPage = (m, p = {}) => new Promise(r => {
      const msgId = pid++;
      const h = d => {
        const msg = JSON.parse(d);
        if (msg.id === msgId) { pageWs.off('message', h); r(msg.result); }
      };
      pageWs.on('message', h);
      pageWs.send(JSON.stringify({ id: msgId, method: m, params: p }));
    });

    const consoleLogs = [];
    const dialogs = [];
    const pixelEvents = [];
    const networkLogs = [];

    pageWs.on('message', d => {
      const msg = JSON.parse(d);
      if (msg.method === 'Runtime.consoleAPICalled') {
        const line = msg.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        console.log('PAGE LOG [' + msg.params.type + ']:', line);
        consoleLogs.push({ type: msg.params.type, line });
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('PAGE EXCEPTION:', JSON.stringify(msg.params.exceptionDetails));
        consoleLogs.push({ type: 'EXCEPTION', details: msg.params.exceptionDetails });
      }
      if (msg.method === 'Page.javascriptDialogOpening') {
        console.log('>>> DIALOG OPENED:', msg.params.message, msg.params.type);
        dialogs.push(msg.params.message);
        sendPage('Page.handleJavaScriptDialog', { accept: true });
      }
      if (msg.method === 'Network.requestWillBeSent') {
        const u = msg.params.request.url;
        if (u.includes('facebook.com/tr/')) {
          const parsed = new URL(u);
          console.log('PIXEL EVENT FIRED:', parsed.searchParams.get('ev'));
          pixelEvents.push({ ev: parsed.searchParams.get('ev'), id: parsed.searchParams.get('id') });
        }
        if (u.includes('script.google.com') || u.includes('googleusercontent') || u.includes('razorpay')) {
          console.log('NET REQ:', msg.params.request.method, u.substring(0, 100));
          networkLogs.push({ dir: 'REQ', method: msg.params.request.method, url: u });
        }
      }
      if (msg.method === 'Network.responseReceived') {
        const u = msg.params.response.url;
        if (u.includes('script.google.com') || u.includes('googleusercontent') || u.includes('razorpay')) {
          console.log('NET RES:', msg.params.response.status, u.substring(0, 100));
          networkLogs.push({ dir: 'RES', status: msg.params.response.status, url: u });
        }
      }
      if (msg.method === 'Network.loadingFailed') {
        console.log('NET FAIL:', msg.params.errorText, msg.params.type);
        networkLogs.push({ dir: 'FAIL', error: msg.params.errorText });
      }
    });

    await sendPage('Page.addScriptToEvaluateOnNewDocument', {
      source: `Object.defineProperty(navigator, 'webdriver', { get: () => undefined });`
    });
    await sendPage('Network.enable');
    await sendPage('Page.enable');
    await sendPage('Runtime.enable');

    console.log('Navigating to https://aitycoon.in/ai_masterclass/ ...');
    await sendPage('Page.navigate', { url: 'https://aitycoon.in/ai_masterclass/' });
    await sleep(4000);

    // Open the register modal by clicking GET MY DISCOUNTED SEAT
    console.log('Opening register modal...');
    const openModalResult = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => 
          b.innerText.includes('GET MY DISCOUNTED SEAT') || 
          b.innerText.includes('Reserve Seat') || 
          b.innerText.includes('Register')
        );
        if (btn) {
          btn.click();
          return 'Clicked button: ' + btn.innerText.trim();
        }
        return 'No button found. Available buttons: ' + Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).join(' | ');
      })()`,
      returnByValue: true
    });
    console.log('Open modal result:', openModalResult.result.value);
    await sleep(1500);

    // Fill form and submit
    console.log('Filling form and submitting...');
    const submitResult = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        const modal = document.querySelector('form');
        if (!modal) return 'No form found';

        const nameInput = modal.querySelector('input[placeholder*="name" i]') || modal.querySelectorAll('input')[0];
        const emailInput = modal.querySelector('input[type="email"]') || modal.querySelectorAll('input')[1];
        const phoneInput = modal.querySelector('input[type="tel"]') || modal.querySelectorAll('input')[2];
        const select = modal.querySelector('select');

        const setVal = (input, val) => {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        if (nameInput) setVal(nameInput, 'John Doe');
        if (emailInput) setVal(emailInput, 'johndoe998877@gmail.com');
        if (phoneInput) setVal(phoneInput, '9876543210');

        if (select) {
          const selectSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set;
          selectSetter.call(select, 'Trainer / Coach');
          select.dispatchEvent(new Event('input', { bubbles: true }));
          select.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const submitBtn = modal.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.click();
          return 'Submit clicked: ' + submitBtn.innerText.trim();
        }
        return 'Submit button not found';
      })()`,
      returnByValue: true
    });
    console.log('Submit trigger result:', submitResult.result.value);

    // Wait up to 45s for order creation / alert / Razorpay
    console.log('Waiting for response...');
    for (let i = 0; i < 45; i++) {
      await sleep(1000);
      if (dialogs.length > 0 || pixelEvents.some(e => e.ev === 'Lead')) {
        console.log(`Finished waiting at ${i + 1}s`);
        break;
      }
    }

    console.log('\n--- DIALOGS (ALERTS) ---', dialogs);
    console.log('\n--- PIXEL EVENTS CAPTURED ---', pixelEvents);
    console.log('\n--- NETWORK LOGS ---', JSON.stringify(networkLogs, null, 2));
    console.log('\n--- CONSOLE LOGS & EXCEPTIONS ---', JSON.stringify(consoleLogs, null, 2));

    pageWs.close();
    ws.close();
  } finally {
    chrome.kill();
  }
})();
