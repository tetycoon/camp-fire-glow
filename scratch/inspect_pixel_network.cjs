const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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
      const json = JSON.parse(data);
      return json.webSocketDebuggerUrl;
    } catch (e) {
      await sleep(500);
    }
  }
  throw new Error('Could not connect to Chrome debugging port');
}

async function inspectUrl(targetUrl) {
  console.log(`\n==================================================`);
  console.log(`Testing: ${targetUrl}`);
  console.log(`==================================================`);

  // Launch Chrome
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_test_prof_' + Date.now(),
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);

    await new Promise(resolve => ws.on('open', resolve));

    let msgId = 1;
    const send = (method, params = {}) => {
      const id = msgId++;
      return new Promise(resolve => {
        const handler = (data) => {
          const msg = JSON.parse(data);
          if (msg.id === id) {
            ws.off('message', handler);
            resolve(msg.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    };

    // Create a new target page
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const pageWsUrl = `ws://127.0.0.1:${PORT}/devtools/page/${targetId}`;
    const pageWs = new WebSocket(pageWsUrl);
    await new Promise(resolve => pageWs.on('open', resolve));

    let pageMsgId = 1;
    const sendPage = (method, params = {}) => {
      const id = pageMsgId++;
      return new Promise(resolve => {
        const handler = (data) => {
          const msg = JSON.parse(data);
          if (msg.id === id) {
            pageWs.off('message', handler);
            resolve(msg.result);
          }
        };
        pageWs.on('message', handler);
        pageWs.send(JSON.stringify({ id, method, params }));
      });
    };

    const allRequests = [];
    const pixelRequests = [];
    const consoleLogs = [];

    pageWs.on('message', data => {
      const msg = JSON.parse(data);
      if (msg.method === 'Network.requestWillBeSent') {
        const reqUrl = msg.params.request.url;
        allRequests.push(reqUrl);
        if (reqUrl.includes('facebook') || reqUrl.includes('fbq')) {
          pixelRequests.push({
            url: reqUrl,
            postData: msg.params.request.postData
          });
        }
      }
      if (msg.method === 'Runtime.consoleAPICalled') {
        consoleLogs.push(msg.params.args.map(a => a.value || a.description).join(' '));
      }
    });

    await sendPage('Network.enable');
    await sendPage('Page.enable');
    await sendPage('Runtime.enable');

    console.log(`Navigating to ${targetUrl}...`);
    await sendPage('Page.navigate', { url: targetUrl });

    // Wait for network requests to settle
    await sleep(6000);

    const evalResult = await sendPage('Runtime.evaluate', {
      expression: `JSON.stringify({
        href: window.location.href,
        title: document.title,
        hasFbq: typeof window.fbq === 'function',
        fbqLoaded: window.fbq?.loaded,
        fbqVersion: window.fbq?.version,
        queueLength: window.fbq?.queue?.length,
        fbqQueue: window.fbq?.queue,
        scripts: Array.from(document.querySelectorAll('script')).map(s => s.src || s.id || s.innerText.slice(0, 40))
      })`
    });

    console.log('Browser DOM state:', evalResult?.result?.value);
    console.log(`Total network requests: ${allRequests.length}`);
    console.log(`Meta / Facebook requests intercepted: ${pixelRequests.length}`);
    if (consoleLogs.length > 0) {
      console.log('Console logs:', consoleLogs);
    }

    pixelRequests.forEach((req, idx) => {
      console.log(`\n--- Request #${idx + 1} ---`);
      try {
        const parsed = new URL(req.url);
        console.log('Event (ev):', parsed.searchParams.get('ev'));
        console.log('Pixel ID (id):', parsed.searchParams.get('id'));
        console.log('Document Location (dl):', parsed.searchParams.get('dl'));
        console.log('Referrer Location (rl):', parsed.searchParams.get('rl'));
        console.log('Full Query Params:');
        for (const [k, v] of parsed.searchParams.entries()) {
          console.log(`   ${k}: ${v}`);
        }
        if (req.postData) {
          console.log('Post Data:', req.postData);
        }
      } catch (e) {
        console.log('Raw URL:', req.url);
      }
    });

    pageWs.close();
    ws.close();
  } finally {
    chrome.kill();
  }
}

(async () => {
  try {
    await inspectUrl('https://aitycoon.in/advanced_masterclass/');
    await sleep(2000);
    await inspectUrl('https://aitycoon.in/');
  } catch (err) {
    console.error('Error running inspector:', err);
  }
})();
