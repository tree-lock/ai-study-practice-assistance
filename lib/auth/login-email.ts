export function normalizeLoginEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isValidOtpCode(raw: string): boolean {
  return /^\d{6}$/.test(raw.trim());
}

export const MIN_PASSWORD_LENGTH = 8;
