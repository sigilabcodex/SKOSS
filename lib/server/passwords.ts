import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const keyLength = 64;
const params = { N: 16384, r: 8, p: 1 } as const;

export const fallbackDemoPassword = 'skoss-demo';

function parseHash(payload: string) {
  const [scheme, saltHex, hashHex] = payload.split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) {
    return null;
  }

  return {
    salt: Buffer.from(saltHex, 'hex'),
    hash: Buffer.from(hashHex, 'hex'),
  };
}

export function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, keyLength, params);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export function verifyPassword(password: string, payload: string) {
  const parsed = parseHash(payload);
  if (!parsed) {
    return false;
  }

  const computedHash = scryptSync(password, parsed.salt, parsed.hash.length, params);
  if (computedHash.length !== parsed.hash.length) {
    return false;
  }

  return timingSafeEqual(computedHash, parsed.hash);
}
