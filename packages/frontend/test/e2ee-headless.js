const axios = require('axios');
const io = require('socket.io-client');
const { Buffer } = require('buffer');

const API_BASE = process.env.API_BASE || 'http://localhost:5001/api';

function toBase64(buffer) {
  return Buffer.from(buffer).toString('base64');
}
function fromBase64(b64) {
  return Buffer.from(b64, 'base64');
}

async function generateKeyPair() {
  const keyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
    'deriveKey',
    'deriveBits',
  ]);
  return keyPair;
}

async function exportPublicRaw(publicKey) {
  const raw = await crypto.subtle.exportKey('raw', publicKey);
  return toBase64(new Uint8Array(raw));
}

async function importPublicRaw(b64) {
  const arr = fromBase64(b64);
  return await crypto.subtle.importKey('raw', arr, { name: 'ECDH', namedCurve: 'P-256' }, true, []);
}

async function deriveAesKey(privKey, pubKey) {
  const key = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: pubKey },
    privKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
  return key;
}

async function encryptText(aesKey, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(text);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, enc);
  return { ciphertext: toBase64(new Uint8Array(ct)), iv: toBase64(iv) };
}

async function decryptText(aesKey, b64Cipher, b64Iv) {
  const ct = fromBase64(b64Cipher);
  const iv = fromBase64(b64Iv);
  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      aesKey,
      ct
    );
    return new TextDecoder().decode(new Uint8Array(plain));
  } catch (e) {
    return null;
  }
}

async function run() {
  console.log('HEADLESS E2EE TEST START');
  // 1) register two users
  const ts = Date.now();
  const emailA = `headlessA+${ts}@example.com`;
  const emailB = `headlessB+${ts}@example.com`;
  const pass = 'Password123!';

  const register = async (email) => {
    const res = await axios.post(`${API_BASE}/auth/register`, {
      email,
      password: pass,
      role: 'client',
    });
    return res.data;
  };

  const aRes = await register(emailA);
  console.log('A registered', aRes.user.id);
  const tokenA = aRes.token;
  const userAId = aRes.user.id;

  const bRes = await register(emailB);
  console.log('B registered', bRes.user.id);
  const tokenB = bRes.token;
  const userBId = bRes.user.id;

  // 2) create a case by A
  const caseRes = await axios.post(
    `${API_BASE}/cases`,
    { title: 'Headless E2E Test Case' },
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );
  const caseId = caseRes.data.id;
  console.log('Case created', caseId);

  // 3) generate keypairs and register public keys
  const kpA = await generateKeyPair();
  const kpB = await generateKeyPair();
  const pubA = await exportPublicRaw(kpA.publicKey);
  const pubB = await exportPublicRaw(kpB.publicKey);

  await axios.post(
    `${API_BASE}/e2ee/keys`,
    { publicKey: pubA },
    { headers: { Authorization: `Bearer ${tokenA}` } }
  );
  console.log('A public key registered');

  await axios.post(
    `${API_BASE}/e2ee/keys`,
    { publicKey: pubB },
    { headers: { Authorization: `Bearer ${tokenB}` } }
  );
  console.log('B public key registered');

  // 4) start socket.io client for B
  const socketB = io.connect('http://localhost:5001', {
    auth: { token: `Bearer ${tokenB}` },
    transports: ['websocket'],
  });

  await new Promise((resolve, reject) => {
    socketB.on('connect', () => {
      console.log('socketB connected', socketB.id);
      socketB.emit('join', caseId);
      resolve();
    });
    socketB.on('connect_error', (err) => reject(err));
    setTimeout(() => reject(new Error('socket connect timeout')), 5000);
  });

  // 5) prepare per-recipient ciphertexts (A -> B)
  const importedPubB = await importPublicRaw(pubB);
  const aesForB = await deriveAesKey(kpA.privateKey, importedPubB);
  const plainText = 'Hello from A to B - headless test';
  const encB = await encryptText(aesForB, plainText);

  const recipients = [{ userId: userBId, ciphertext: encB.ciphertext, iv: encB.iv }];

  // 6) set up listener on B
  let received = null;
  socketB.on('chat:message', async (msg) => {
    console.log('socketB received chat:message', msg._id || msg.id || msg);
    // find recipient entry for B
    const rec = (msg.recipients || []).find((r) => r.userId === userBId);
    if (rec) {
      // derive AES key using B priv and A pub
      const importedPubA = await importPublicRaw(pubA);
      const aes = await deriveAesKey(kpB.privateKey, importedPubA);
      const dec = await decryptText(aes, rec.ciphertext, rec.iv);
      console.log('decrypted payload for B:', dec);
      received = dec;
    } else if (msg.message && msg.encrypted && msg.message.length > 0) {
      // legacy single-ciphertext path
      console.log('legacy ciphertext in msg.message');
    }
  });

  // 7) send encrypted message from A
  let postRes;
  try {
    postRes = await axios.post(
      `${API_BASE}/chat/${caseId}`,
      { encrypted: true, recipients },
      { headers: { Authorization: `Bearer ${tokenA}` } }
    );
    console.log('A posted encrypted message, id=', postRes.data._id || postRes.data.id);
  } catch (err) {
    if (err.response) {
      console.error('POST /chat error status=', err.response.status, 'data=', err.response.data);
    }
    throw err;
  }

  // wait for receive
  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (received === plainText) {
    console.log('SUCCESS: B decrypted the message correctly');
    process.exit(0);
  } else {
    console.error('FAIL: B did not decrypt correctly. received=', received);
    process.exit(2);
  }
}

run().catch((err) => {
  console.error('Headless test failed:', err && err.stack ? err.stack : err);
  process.exit(1);
});
