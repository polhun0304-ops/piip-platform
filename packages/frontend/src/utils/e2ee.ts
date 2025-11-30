// Simple E2EE helper using Web Crypto (P-256 ECDH + AES-GCM)
// PoC: generate keypair, export public key (base64), derive shared key and encrypt/decrypt text.

const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function fromBase64(b64: string) {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function generateKeyPair() {
  const kp = await window.crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
    'deriveKey',
    'deriveBits',
  ]);
  return kp;
}

export async function exportPublicKeyRaw(publicKey: CryptoKey) {
  const raw = await window.crypto.subtle.exportKey('raw', publicKey);
  return toBase64(raw);
}

export async function importPublicKeyRaw(rawBase64: string) {
  const raw = fromBase64(rawBase64);
  const key = await window.crypto.subtle.importKey(
    'raw',
    raw,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    []
  );
  return key;
}

export async function deriveAesKey(privateKey: CryptoKey, peerPublicKey: CryptoKey) {
  const shared = await window.crypto.subtle.deriveBits(
    { name: 'ECDH', public: peerPublicKey },
    privateKey,
    256
  );
  // Import as AES-GCM key
  const aesKey = await window.crypto.subtle.importKey('raw', shared, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ]);
  return aesKey;
}

export async function encryptText(aesKey: CryptoKey, plaintext: string) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const ct = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    enc.encode(plaintext)
  );
  return {
    iv: toBase64(iv.buffer),
    ciphertext: toBase64(ct),
  };
}

export async function decryptText(aesKey: CryptoKey, ivB64: string, ctB64: string) {
  const iv = new Uint8Array(fromBase64(ivB64));
  const ct = fromBase64(ctB64);
  const plain = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, ct);
  return dec.decode(plain);
}

// Local storage helpers for PoC
export async function ensureLocalKeypair() {
  const stored = localStorage.getItem('e2e_keypair_public');
  const storedPriv = localStorage.getItem('e2e_keypair_private');
  if (stored && storedPriv) {
    // try to import
    try {
      const pubRaw = fromBase64(stored);
      const privRaw = fromBase64(storedPriv);
      const pub = await window.crypto.subtle.importKey(
        'raw',
        pubRaw,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        []
      );
      const priv = await window.crypto.subtle.importKey(
        'pkcs8',
        privRaw,
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey', 'deriveBits']
      );
      return { publicKey: pub, privateKey: priv };
    } catch (e) {
      // fallthrough to generate
    }
  }
  const kp = await generateKeyPair();
  const pubRaw = await window.crypto.subtle.exportKey('raw', kp.publicKey);
  const privPkcs8 = await window.crypto.subtle.exportKey('pkcs8', kp.privateKey);
  localStorage.setItem('e2e_keypair_public', toBase64(pubRaw));
  localStorage.setItem('e2e_keypair_private', toBase64(privPkcs8));
  return { publicKey: kp.publicKey, privateKey: kp.privateKey };
}

export function getLocalPublicKeyBase64() {
  return localStorage.getItem('e2e_keypair_public') || null;
}
