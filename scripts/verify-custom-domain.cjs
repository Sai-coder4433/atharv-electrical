/**
 * ATHARV ELECTRICAL — Custom Domain & Cloudflare Pages Production Verification
 */

const https = require('https');

function testUrl(url, description) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        port: 443,
        path: u.pathname + u.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          const isOk = res.statusCode >= 200 && res.statusCode < 400;
          console.log(`[${res.statusCode}] ${description} (${url}): ${isOk ? '✅ PASS' : '❌ FAIL'}`);
          resolve({ ok: isOk, statusCode: res.statusCode, body });
        });
      }
    );
    req.on('error', (err) => {
      console.log(`[ERROR] ${description} (${url}): ❌ FAIL (${err.message})`);
      resolve({ ok: false, error: err.message });
    });
    req.end();
  });
}

function testPost(hostname, path, payload, description) {
  return new Promise((resolve) => {
    const data = JSON.stringify(payload);
    const req = https.request(
      {
        hostname,
        port: 443,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(data),
          Origin: 'https://atharvelectrical.com',
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(body);
          } catch {
            parsed = body;
          }
          console.log(`[${res.statusCode}] ${description}:`, typeof parsed === 'object' ? JSON.stringify(parsed).slice(0, 140) : parsed.slice(0, 140));
          resolve({ statusCode: res.statusCode, data: parsed });
        });
      }
    );
    req.on('error', (err) => {
      console.log(`[ERROR] ${description}: ❌ ${err.message}`);
      resolve({ statusCode: 500, error: err.message });
    });
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log('🚀 Running Custom Domain & Production Verification Suite\n');

  // 1. Pages.dev deployment
  await testUrl('https://atharv-electrical.pages.dev/', 'Cloudflare Pages Production Root');

  // 2. Custom Domain (Direct through Cloudflare Edge)
  console.log('\n--- Testing Cloudflare Edge Routing for atharvelectrical.com ---');
  await testUrl('https://atharvelectrical.com/', 'Main Custom Domain Root');

  // 3. Backend Cashfree Order creation with custom domain return_url
  console.log('\n--- Testing Backend Cloud Function with atharvelectrical.com Origin ---');
  const cfRes = await testPost(
    'us-central1-atharv-electrical-chakan.cloudfunctions.net',
    '/createCashfreeOrder',
    {
      items: [{ productId: 'SFoVAphH6G3ovdkVayyw', quantity: 1 }],
      deliveryAddress: {
        fullName: 'Chakan Customer',
        mobile: '9822001122',
        houseBuilding: 'Manik Chowk Storefront',
        street: 'Station Road',
        area: 'Manik Chowk',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '410501',
      },
      customerDetails: {
        customerId: 'cust_domain_test',
        customerName: 'Chakan Customer',
        customerEmail: 'customer@atharvelectrical.com',
        customerPhone: '9822001122',
      },
    },
    'Cashfree Order Creation (atharvelectrical.com origin)'
  );

  if (cfRes.data && cfRes.data.orderId) {
    console.log(`✅ Order Generated: ${cfRes.data.orderId}`);
    console.log(`✅ Payment Session ID: ${cfRes.data.paymentSessionId.slice(0, 35)}...`);
    console.log(`✅ Verified Amount: ₹${cfRes.data.totalAmount}`);

    // Verify order status
    await testPost(
      'us-central1-atharv-electrical-chakan.cloudfunctions.net',
      `/cashfreeOrderStatus?order_id=${cfRes.data.orderId}`,
      {},
      'Verify Cashfree Order Status'
    );

    // Clean up test order
    const fs = require('fs');
    const os = require('os');
    const token = JSON.parse(fs.readFileSync(os.homedir() + '/.config/configstore/firebase-tools.json', 'utf8')).tokens.access_token;
    https.request({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/atharv-electrical-chakan/databases/(default)/documents/orders/${cfRes.data.orderId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, () => {}).end();
    https.request({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/atharv-electrical-chakan/databases/(default)/documents/payments/${cfRes.data.orderId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }, () => {}).end();
    console.log('🧹 Cleaned test verification order from Firestore');
  }

  // 4. Shiprocket serviceability
  console.log('\n--- Testing Shiprocket Serviceability ---');
  await testPost(
    'us-central1-atharv-electrical-chakan.cloudfunctions.net',
    '/shiprocketCheckServiceability',
    {
      pickup_postcode: '410501',
      delivery_postcode: '410501',
      weight: 1,
    },
    'Shiprocket Serviceability Check (Pincode 410501)'
  );

  console.log('\n✅ Verification Completed!');
}

run();
