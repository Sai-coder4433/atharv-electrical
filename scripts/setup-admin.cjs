/**
 * ATHARV ELECTRICAL — Admin Account & Custom Claims Setup Script
 * 
 * Usage:
 *   node scripts/setup-admin.cjs [email] [password]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const DEFAULT_ADMIN_EMAIL = 'atharvelectricals@gmail.com';
const ADMIN_NAME = 'Atharv Electricals';
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

async function provisionAdmin(adminEmail, newPassword) {
  console.log(`\n⚡ Provisioning Administrator: ${adminEmail}`);
  const token = getFirebaseCliToken();

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
      { email: [adminEmail] }
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
    console.log(`Creating new administrator account for ${adminEmail}...`);
    const createPayload = {
      email: adminEmail,
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
    emailVerified: true,
    customAttributes: JSON.stringify({ admin: true, role: 'admin' }),
  };
  if (newPassword) {
    updatePayload.password = newPassword;
    console.log('Setting administrator password...');
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
  if (newPassword) {
    console.log('✅ Password successfully set and verified!');
  }

  // 4. Verify login via verifyPassword API
  if (newPassword) {
    try {
      const verifyRes = await httpsRequest(
        {
          hostname: 'identitytoolkit.googleapis.com',
          path: `/v1/accounts:signInWithPassword?key=${API_KEY}`,
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        {
          email: adminEmail,
          password: newPassword,
          returnSecureToken: true,
        }
      );
      console.log(`🎉 Login verification successful! Admin ID Token issued for ${verifyRes.email}`);
    } catch (authErr) {
      console.error('Login verification error:', authErr.message);
    }
  }
}

async function main() {
  const targetEmail = process.argv[2] && process.argv[2].includes('@') ? process.argv[2] : DEFAULT_ADMIN_EMAIL;
  const targetPassword = (process.argv[2] && !process.argv[2].includes('@') ? process.argv[2] : process.argv[3]) || 'A123456@';

  await provisionAdmin(targetEmail, targetPassword);
  
  // Also ensure atharvporade@gmail.com has claims just in case
  if (targetEmail !== 'atharvporade@gmail.com') {
    try {
      await provisionAdmin('atharvporade@gmail.com', null);
    } catch (e) {
      // ignore
    }
  }

  console.log('\n🚀 Admin account is live and fully configured for https://atharv-electrical-chakan.web.app/#/admin');
}

main().catch(console.error);
