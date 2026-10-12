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

(async () => {
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

    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const pageWs = new WebSocket(`ws://127.0.0.1:${PORT}/devtools/page/${targetId}`);
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

    const requests = [];
    pageWs.on('message', data => {
      const msg = JSON.parse(data);
      if (msg.method === 'Network.requestWillBeSent') {
        requests.push({
          url: msg.params.request.url,
          method: msg.params.request.method,
          postData: msg.params.request.postData
        });
      }
    });

    await sendPage('Network.enable');
    await sendPage('Page.enable');
    await sendPage('Runtime.enable');

    await sendPage('Page.navigate', { url: 'https://aitycoon.in/advanced_masterclass/' });
    await sleep(8000);

    console.log('--- ALL REQUESTS ---');
    requests.forEach(r => console.log(r.method, r.url));

    pageWs.close();
    ws.close();
  } finally {
    chrome.kill();
  }
})();
