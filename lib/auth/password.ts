import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEYLEN = 64;
const SCRYPT_OPTIONS = {
  N: 16_384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
} as const;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16);
  const derivedKey = scryptSync(plain, salt, KEYLEN, SCRYPT_OPTIONS);
  return `scrypt$${salt.toString("base64")}$${derivedKey.toString("base64")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }
  let salt: Buffer;
  let expected: Buffer;
  try {
    salt = Buffer.from(parts[1], "base64");
    expected = Buffer.from(parts[2], "base64");
  } catch {
    return false;
  }
  if (salt.length === 0 || expected.length !== KEYLEN) {
    return false;
  }
  const derivedKey = scryptSync(plain, salt, KEYLEN, SCRYPT_OPTIONS);
  if (derivedKey.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(derivedKey, expected);
}
