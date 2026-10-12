const https = require('https');

const postData = JSON.stringify({
  userType: 'Trainer / Coach',
  pageUrl: 'https://aitycoon.in/ai_masterclass/',
  name: 'Selvanayagam',
  email: 'ambroseselva001@gmail.com',
  phone: '+917639323618',
  countryCode: '+91',
  language: 'Tamil',
  batch: 'Masterclass 2026',
  amount: 1,
  sessionDate: '18th September 2026',
  sessionTime: '6:00 PM IST',
  companyName: '',
  gstin: '',
  seats: 1
});

console.log('Sending request to Google Apps Script...');

function sendPost(url) {
  const parsed = new URL(url);
  const options = {
    hostname: parsed.hostname,
    path: parsed.pathname + parsed.search,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, res => {
    console.log('HTTP Status:', res.statusCode);
    console.log('Location:', res.headers.location);

    if (res.statusCode === 302 || res.statusCode === 301) {
      console.log('Following redirect to:', res.headers.location);
      https.get(res.headers.location, r2 => {
        let body = '';
        r2.on('data', c => body += c);
        r2.on('end', () => {
          console.log('Final Status:', r2.statusCode);
          console.log('Body Length:', body.length);
          console.log('Body Content:\n', body);
          try {
            const parsed = JSON.parse(body);
            console.log('Parsed JSON successfully:', parsed);
          } catch(e) {
            console.error('JSON Parse Error:', e.message);
          }
        });
      });
    } else {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        console.log('Body:\n', body);
      });
    }
  });

  req.on('error', err => console.error('Req error:', err));
  req.write(postData);
  req.end();
}

sendPost('https://script.google.com/macros/s/AKfycby0fX7tjbOciJbg0Mw1SRMhlazBe4FG1Ko-f5mIFCW6Y7zGKHGZjdUZQKXclfye1FzegA/exec');
