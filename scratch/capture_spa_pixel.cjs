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
      const json = JSON.parse(data);
      return json.webSocketDebuggerUrl;
    } catch (e) {
      await sleep(500);
    }
  }
  throw new Error('Could not connect to Chrome debugging port');
}

async function capturePixelForUrl(urlToTest) {
  console.log(`\n=======================================================`);
  console.log(`STARTING CAPTURE FOR: ${urlToTest}`);
  console.log(`=======================================================`);

  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-blink-features=AutomationControlled',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    '--user-data-dir=' + require('os').tmpdir() + '\\chrome_cap_spa_' + Date.now(),
    'about:blank'
  ]);

  try {
    const wsUrl = await getWsUrl();
    const ws = new WebSocket(wsUrl);
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

    const pixelEvents = [];

    pageWs.on('message', data => {
      const msg = JSON.parse(data);
      if (msg.method === 'Network.requestWillBeSent') {
        const req = msg.params.request;
        const u = req.url;
        if (u.includes('facebook.com/tr/') || u.includes('/tr/?') || (u.includes('facebook') && u.includes('ev='))) {
          pixelEvents.push({
            url: u,
            method: req.method,
            postData: req.postData
          });
        }
      }
    });

    await sendPage('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
        window.navigator.chrome = { runtime: {} };
      `
    });

    await sendPage('Network.enable');
    await sendPage('Page.enable');

    console.log(`Navigating to ${urlToTest}...`);
    await sendPage('Page.navigate', { url: urlToTest });

    for (let s = 0; s < 10; s++) {
      await sleep(1000);
      if (pixelEvents.length > 0) {
        console.log(`Captured ${pixelEvents.length} Pixel event(s) at ${s + 1}s!`);
        break;
      }
    }

    console.log(`\nCaptured Pixel Events Count: ${pixelEvents.length}`);
    pixelEvents.forEach((ev, i) => {
      console.log(`\n================ EVENT #${i + 1} ================`);
      try {
        const u = new URL(ev.url);
        console.log('  ev (event):', u.searchParams.get('ev'));
        console.log('  id (pixelId):', u.searchParams.get('id'));
        console.log('  dl (doc location):', u.searchParams.get('dl'));
        console.log('  rl (referrer):', u.searchParams.get('rl'));
      } catch (e) {
        console.log('Raw URL:', ev.url);
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
    await capturePixelForUrl('https://aitycoon.in/bootcamp/');
    await sleep(2000);
    await capturePixelForUrl('https://aitycoon.in/');
  } catch (e) {
    console.error('Test error:', e);
  }
})();
