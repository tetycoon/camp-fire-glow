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
  const urlToTest = 'https://aitycoon.in/advanced_masterclass'; // NO trailing slash
  console.log(`Testing no-trailing-slash: ${urlToTest}`);

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--disable-blink-features=AutomationControlled',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_no_slash_' + Date.now(),
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

    const pixelEvents = [];
    pageWs.on('message', d => {
      const msg = JSON.parse(d);
      if (msg.method === 'Network.requestWillBeSent') {
        const u = msg.params.request.url;
        if (u.includes('facebook.com/tr/')) {
          pixelEvents.push(u);
        }
      }
    });

    await sendPage('Page.addScriptToEvaluateOnNewDocument', {
      source: `Object.defineProperty(navigator, 'webdriver', { get: () => undefined });`
    });
    await sendPage('Network.enable');
    await sendPage('Page.enable');

    await sendPage('Page.navigate', { url: urlToTest });
    await sleep(6000);

    console.log(`Captured Pixel Events: ${pixelEvents.length}`);
    pixelEvents.forEach((u, i) => {
      const parsed = new URL(u);
      console.log(`[Event ${i+1}] dl:`, parsed.searchParams.get('dl'));
      console.log(`[Event ${i+1}] rl:`, parsed.searchParams.get('rl'));
    });

    pageWs.close();
    ws.close();
  } finally {
    chrome.kill();
  }
})();
