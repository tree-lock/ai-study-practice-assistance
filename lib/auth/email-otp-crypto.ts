import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { normalizeLoginEmail } from "@/lib/auth/login-email";

function getPepper(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not defined");
  }
  return secret;
}

function otpDigest(email: string, code: string, salt: string): string {
  const normalized = normalizeLoginEmail(email);
  return createHmac("sha256", getPepper())
    .update(`${salt}|${normalized}|${code}`)
    .digest("hex");
}

export function createOtpSaltAndHash(
  email: string,
  code: string,
): { salt: string; codeHash: string } {
  const salt = randomBytes(16).toString("hex");
  const codeHash = otpDigest(email, code, salt);
  return { salt, codeHash };
}

export function verifyOtpAgainstStored(
  email: string,
  code: string,
  salt: string,
  codeHash: string,
): boolean {
  try {
    const expected = otpDigest(email, code, salt);
    return timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(codeHash, "hex"),
    );
  } catch {
    return false;
  }
}
