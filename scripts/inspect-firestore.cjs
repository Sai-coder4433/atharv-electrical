const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const PROJECT_ID = 'atharv-electrical-chakan';

function getFirebaseCliToken() {
  const configPath = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config.tokens.access_token;
}

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.error ? parsed.error.message : data}`));
          }
        } catch {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function listCollection(coll) {
  const token = getFirebaseCliToken();
  try {
    const res = await httpsRequest({
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents/${coll}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`Collection "${coll}": ${(res.documents || []).length} document(s)`);
    if (res.documents && res.documents.length > 0) {
      res.documents.slice(0, 3).forEach((d) => {
        console.log(`  - ID: ${d.name.split('/').pop()}`);
      });
    }
  } catch (err) {
    console.error(`Error querying ${coll}:`, err.message);
  }
}

async function main() {
  console.log(`Checking Firestore collections for ${PROJECT_ID}...`);
  await listCollection('products');
  await listCollection('categories');
  await listCollection('subcategories');
  await listCollection('brands');
  await listCollection('orders');
}

main();
