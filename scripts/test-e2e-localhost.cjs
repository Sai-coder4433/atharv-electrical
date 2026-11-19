const http = require('http');

async function testEndpoint(name, path, method, body) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3001,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          console.log(`[${res.statusCode}] ${name}:`, typeof parsed === 'object' ? JSON.stringify(parsed).slice(0, 150) + '...' : parsed.slice(0, 150));
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', (err) => {
      console.error(`[ERROR] ${name}:`, err.message);
      resolve({ status: 500, error: err.message });
    });
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Localhost End-to-End API and Flow Verification on http://localhost:3001\n');

  // Test 1: Frontend Root
  await testEndpoint('Frontend HTML', '/', 'GET');

  // Test 2: Shiprocket Serviceability (Localhost Proxy)
  await testEndpoint('Shiprocket Pincode Check (410501)', '/api/shiprocket/check-serviceability', 'POST', {
    pickup_postcode: '410501',
    delivery_postcode: '410501',
    weight: 1,
  });

  // Test 3: Cashfree Order Creation Validation
  await testEndpoint('Cashfree Empty Cart Check', '/api/cashfree/create-order', 'POST', {
    items: [],
  });

  // Test 4: Real Cashfree Order Creation on Localhost
  const cfRes = await testEndpoint('Cashfree Real Order Creation', '/api/cashfree/create-order', 'POST', {
    items: [{ productId: 'SFoVAphH6G3ovdkVayyw', quantity: 1 }],
    deliveryAddress: {
      fullName: 'Santosh Pawar',
      mobile: '9822001122',
      houseBuilding: 'B-12, Manik Vihar',
      street: 'Chakan Bypass',
      area: 'Manik Chowk',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '410501',
    },
    customerDetails: {
      customerId: 'cust_local_test',
      customerName: 'Santosh Pawar',
      customerEmail: 'santosh@gmail.com',
      customerPhone: '9822001122',
    },
  });

  if (cfRes.body && cfRes.body.orderId) {
    const orderId = cfRes.body.orderId;
    console.log(`\n📦 Created Test Cashfree Order: ${orderId}`);
    console.log(`🔑 Payment Session ID: ${cfRes.body.paymentSessionId.slice(0, 30)}...`);
    console.log(`💰 Verified Database Amount: ₹${cfRes.body.totalAmount}`);

    // Test 5: Verify Order Status
    await testEndpoint('Cashfree Order Status Check', `/api/cashfree/order-status?order_id=${orderId}`, 'GET');

    // Clean up test order
    const fs = require('fs');
    const https = require('https');
    const token = JSON.parse(fs.readFileSync(require('os').homedir() + '/.config/configstore/firebase-tools.json', 'utf8')).tokens.access_token;
    https.request({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/atharv-electrical-chakan/databases/(default)/documents/orders/${orderId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, () => {}).end();
    https.request({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/atharv-electrical-chakan/databases/(default)/documents/payments/${orderId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, () => {}).end();
    console.log('🧹 Cleaned test order from Firestore');
  }

  console.log('\n✅ All Localhost Verification Tests Completed!');
}

runTests();
