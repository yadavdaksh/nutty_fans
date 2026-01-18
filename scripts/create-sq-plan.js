const https = require('https');

const token = process.env.SQUARE_ACCESS_TOKEN;
const uniqueName = `Test Plan ${Date.now()}`;

const postData = JSON.stringify({
  idempotency_key: crypto.randomUUID(),
  batches: [{
    objects: [
      {
        type: 'SUBSCRIPTION_PLAN',
        id: '#new_plan',
        subscription_plan_data: {
          name: uniqueName
        }
      },
      {
        type: 'SUBSCRIPTION_PLAN_VARIATION',
        id: '#new_var',
        present_at_all_locations: true,
        subscription_plan_variation_data: {
          name: uniqueName + ' Monthly',
          subscription_plan_id: '#new_plan', // Link to plan
          phases: [{
            cadence: 'MONTHLY',
            pricing: {
              type: 'STATIC',
              price_money: {
                amount: 1000,
                currency: 'USD'
              }
            }
          }]
        }
      }
    ]
  }]
});

const options = {
  hostname: 'connect.squareupsandbox.com',
  path: '/v2/catalog/batch-upsert',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Square-Version': '2024-12-18' // Recent version
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('--- CREATE PLAN RESPONSE ---');
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.write(postData);
req.end();
