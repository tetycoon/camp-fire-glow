const { spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

(async () => {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_dbg_' + Date.now(),
    'about:blank'
  ]);

  try {
    await sleep(1500);
    const versionData = await new Promise((res, rej) => {
      http.get(`http://127.0.0.1:${PORT}/json/version`, r => {
        let b = '';
        r.on('data', c => b += c);
        r.on('end', () => res(b));
      }).on('error', rej);
    });

    const ws = new WebSocket(JSON.parse(versionData).webSocketDebuggerUrl);
    await new Promise(r => ws.on('open', r));

    let id = 1;
    const send = (method, params = {}) => new Promise(r => {
      const msgId = id++;
      const h = (data) => {
        const msg = JSON.parse(data);
        if (msg.id === msgId) {
          ws.off('message', h);
          r(msg.result);
        }
      };
      ws.on('message', h);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const pageWs = new WebSocket(`ws://127.0.0.1:${PORT}/devtools/page/${targetId}`);
    await new Promise(r => pageWs.on('open', r));

    let pid = 1;
    const sendPage = (method, params = {}) => new Promise(r => {
      const msgId = pid++;
      const h = (data) => {
        const msg = JSON.parse(data);
        if (msg.id === msgId) {
          pageWs.off('message', h);
          r(msg.result);
        }
      };
      pageWs.on('message', h);
      pageWs.send(JSON.stringify({ id: msgId, method, params }));
    });

    pageWs.on('message', data => {
      const msg = JSON.parse(data);
      if (msg.method === 'Log.entryAdded') {
        console.log('[BROWSER LOG]', msg.params.entry);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        console.log('[EXCEPTION]', msg.params.exceptionDetails);
      }
      if (msg.method === 'Network.loadingFailed') {
        console.log('[NET FAIL]', msg.params.errorText, msg.params.canceled, msg.params.type);
      }
    });

    await sendPage('Log.enable');
    await sendPage('Runtime.enable');
    await sendPage('Network.enable');
    await sendPage('Page.enable');

    console.log('Navigating to https://aitycoon.in/advanced_masterclass/ ...');
    await sendPage('Page.navigate', { url: 'https://aitycoon.in/advanced_masterclass/' });

    await sleep(6000);

    const testEval = await sendPage('Runtime.evaluate', {
      expression: `(() => {
        return {
          fbqExists: typeof window.fbq === 'function',
          fbqVersion: window.fbq?.version,
          fbqLoaded: window.fbq?.loaded,
          fbqState: window.fbq?.getState ? window.fbq.getState() : null,
          locationHref: window.location.href,
          locationPath: window.location.pathname,
          referrer: document.referrer
        };
      })()`,
      returnByValue: true
    });

    console.log('Result:', JSON.stringify(testEval.result.value, null, 2));

    pageWs.close();
    ws.close();
  } finally {
    chrome.kill();
  }
})();
