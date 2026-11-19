/**
 * ATHARV ELECTRICAL — Admin Account & Custom Claims Setup Script
 * 
 * Usage:
 *   node scripts/setup-admin.cjs [optional_new_password]
 * 
 * This script runs in a secure administrator environment using Firebase CLI credentials.
 * It ensures the account atharvporade@gmail.com exists, has the custom claim { admin: true, role: 'admin' },
 * and updates the password if provided or triggers a password reset email.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const ADMIN_EMAIL = 'atharvporade@gmail.com';
const ADMIN_NAME = 'Atharv Porade';
const PROJECT_ID = 'atharv-electrical-chakan';
const API_KEY = 'AIzaSyCBpC_pJ-c63n6pJUTL9my4fjr1DE1-9i8';

function getFirebaseCliToken() {
  const configPath = path.join(os.homedir(), '.config/configstore/firebase-tools.json');
  if (!fs.existsSync(configPath)) {
    throw new Error('Firebase CLI credentials not found at ' + configPath + '. Please run `firebase login`.');
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  if (!config.tokens || !config.tokens.access_token) {
    throw new Error('No access token in firebase-tools.json. Please run `firebase login`.');
  }
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

async function main() {
  console.log('⚡ ATHARV ELECTRICAL — Provisioning Administrator Account');
  console.log(`Target: ${ADMIN_NAME} <${ADMIN_EMAIL}> on ${PROJECT_ID}`);

  const token = getFirebaseCliToken();
  const newPassword = process.argv[2] || process.env.ADMIN_PASSWORD;

  // 1. Look up user by email
  let uid = null;
  try {
    const lookupRes = await httpsRequest(
      {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/accounts:lookup`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      { email: [ADMIN_EMAIL] }
    );
    if (lookupRes.users && lookupRes.users.length > 0) {
      uid = lookupRes.users[0].localId;
      console.log(`✅ Existing user found with UID: ${uid}`);
    }
  } catch (err) {
    console.log('User lookup note:', err.message);
  }

  // 2. Create user if not present
  if (!uid) {
    console.log('Creating new administrator account...');
    const createPayload = {
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      emailVerified: true,
      customAttributes: JSON.stringify({ admin: true, role: 'admin' }),
    };
    if (newPassword) {
      createPayload.password = newPassword;
    }
    const createRes = await httpsRequest(
      {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/projects/${PROJECT_ID}/accounts`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
      createPayload
    );
    uid = createRes.localId;
    console.log(`✅ Created administrator account with UID: ${uid}`);
  }

  // 3. Set custom user claims & update password if provided
  const updatePayload = {
    localId: uid,
    displayName: ADMIN_NAME,
    customAttributes: JSON.stringify({ admin: true, role: 'admin' }),
  };
  if (newPassword) {
    updatePayload.password = newPassword;
    console.log('Updating administrator password from argument...');
  }

  await httpsRequest(
    {
      hostname: 'identitytoolkit.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/accounts:update`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
    updatePayload
  );
  console.log('✅ Custom Claims set: { admin: true, role: "admin" }');

  if (!newPassword) {
    // Send password reset email
    console.log('Sending secure Password Reset email to', ADMIN_EMAIL);
    await httpsRequest(
      {
        hostname: 'identitytoolkit.googleapis.com',
        path: `/v1/accounts:sendOobCode?key=${API_KEY}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      {
        requestType: 'PASSWORD_RESET',
        email: ADMIN_EMAIL,
      }
    );
    console.log(`✉️ Password reset email delivered to ${ADMIN_EMAIL}`);
  } else {
    console.log('🔒 New administrator password has been set securely.');
  }

  console.log('\n🎉 Administrator account is ready for https://YOUR-DOMAIN.com/#/admin');
}

main().catch((err) => {
  console.error('❌ Failed to provision admin:', err.message);
  process.exit(1);
});
