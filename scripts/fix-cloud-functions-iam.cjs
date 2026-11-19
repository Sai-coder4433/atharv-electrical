const fs = require('fs');
const https = require('https');
const os = require('os');
const path = require('path');

const PROJECT_ID = 'atharv-electrical-chakan';
const REGION = 'us-central1';

function getFirebaseCliToken() {
  const configPath = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  return config.tokens.access_token;
}

const PUBLIC_FUNCTIONS = [
  'createCashfreeOrder',
  'verifyCashfreePayment',
  'cashfreeWebhook',
  'cashfreeOrderStatus',
  'cashfreeRefund',
  'createRazorpayOrder',
  'verifyRazorpayPayment',
  'shiprocketCheckServiceability',
  'shiprocketCreateShipment',
  'shiprocketGenerateAwb',
  'shiprocketSchedulePickup',
  'shiprocketGenerateLabel',
  'shiprocketCancelShipment',
  'shiprocketTrackShipment',
  'shiprocketWebhook',
];

function setFunctionInvokerPolicy(functionName, token) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      policy: {
        bindings: [
          {
            role: 'roles/cloudfunctions.invoker',
            members: ['allUsers'],
          },
        ],
      },
    });

    const req = https.request(
      {
        hostname: 'cloudfunctions.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/locations/${REGION}/functions/${functionName}:setIamPolicy`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ Granted public invoker to ${functionName}`);
            resolve(true);
          } else {
            console.error(`❌ Failed on ${functionName} (HTTP ${res.statusCode}):`, data);
            resolve(false);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const token = getFirebaseCliToken();
  console.log('🔓 Setting public invoker IAM policy for Cloud Functions...');
  for (const fn of PUBLIC_FUNCTIONS) {
    await setFunctionInvokerPolicy(fn, token);
  }
  console.log('🎉 Done updating IAM policies!');
}

main().catch(console.error);
