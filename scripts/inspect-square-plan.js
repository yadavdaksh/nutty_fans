const https = require('https');

const token = process.env.SQUARE_ACCESS_TOKEN;

const options = {
  hostname: 'connect.squareupsandbox.com',
  path: '/v2/catalog/object/4DTAQ3UOMRFE4CWMX5M4CMPS?include_related_objects=true',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Square-Version': '2024-12-18'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('--- RETRIEVE RESULT ---');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.end();
