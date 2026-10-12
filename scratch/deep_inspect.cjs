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
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_tr_' + Date.now(),
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

    // Instrument before page loads
    await sendPage('Page.enable');
    await sendPage('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        window.__intercepted = [];
        // Intercept sendBeacon
        const origBeacon = navigator.sendBeacon;
        navigator.sendBeacon = function(url, data) {
          window.__intercepted.push({ type: 'beacon', url, data: data?.toString() });
          return origBeacon.apply(this, arguments);
        };
        // Intercept fetch
        const origFetch = window.fetch;
        window.fetch = function(input, init) {
          const url = typeof input === 'string' ? input : input.url;
          window.__intercepted.push({ type: 'fetch', url, body: init?.body?.toString() });
          return origFetch.apply(this, arguments);
        };
        // Intercept Image
        const origImage = window.Image;
        window.Image = function() {
          const img = new origImage(...arguments);
          const origSet = img.__proto__.__lookupSetter__('src');
          Object.defineProperty(img, 'src', {
            set: function(val) {
              window.__intercepted.push({ type: 'image', url: val });
              return origSet.call(this, val);
            }
          });
          return img;
        };
      `
    });

    console.log('Navigating to https://aitycoon.in/advanced_masterclass/ ...');
    await sendPage('Page.navigate', { url: 'https://aitycoon.in/advanced_masterclass/' });

    await sleep(7000);

    const intercepted = await sendPage('Runtime.evaluate', {
      expression: 'JSON.stringify(window.__intercepted)',
      returnByValue: true
    });

    console.log('--- ALL INTERCEPTED DISPATCHES ---');
    const items = JSON.parse(intercepted.result.value || '[]');
    console.log('Count:', items.length);
    items.forEach((item, idx) => {
      console.log(`\n[#${idx + 1}] Type: ${item.type}`);
      console.log(`URL: ${item.url}`);
      if (item.data) console.log(`Data: ${item.data}`);
      if (item.body) console.log(`Body: ${item.body}`);
    });

    pageWs.close();
    ws.close();
  } finally {
    chrome.kill();
  }
})();
