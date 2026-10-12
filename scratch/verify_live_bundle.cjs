const https = require('https');

function check(url) {
  return new Promise(resolve => {
    https.get(url, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', e => resolve({ error: e.message }));
  });
}

(async () => {
  const homeRes = await check('https://aitycoon.in/?nocache=' + Date.now());
  console.log('Homepage HTTP status:', homeRes.status);
  const hasMetaTag = homeRes.body.includes('facebook-domain-verification') && homeRes.body.includes('wh4l566mbzl7j9m0lgehz1l1996ous');
  console.log('Homepage contains facebook-domain-verification meta tag:', hasMetaTag);
  const tagMatch = homeRes.body.match(/<meta\s+name=["']facebook-domain-verification["'][^>]+>/i);
  console.log('Matched tag:', tagMatch ? tagMatch[0] : 'Not found in edge cache yet');
})();
