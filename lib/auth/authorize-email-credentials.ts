import type { User } from "@auth/core/types";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { verifyOtpAgainstStored } from "@/lib/auth/email-otp-crypto";
import {
  isValidOtpCode,
  MIN_PASSWORD_LENGTH,
  normalizeLoginEmail,
} from "@/lib/auth/login-email";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { emailOtps, users } from "@/lib/db/schema";

const MAX_OTP_ATTEMPTS = 5;

const credentialsSchema = z.object({
  email: z.string(),
  password: z.string().optional(),
  code: z.string().optional(),
});

function toAuthUser(row: {
  id: string;
  email: string | null;
  name: string | null;
}): User {
  return {
    id: row.id,
    email: row.email ?? undefined,
    name: row.name ?? undefined,
  };
}

export async function authorizeEmailCredentials(
  credentials: Partial<Record<"email" | "password" | "code", unknown>>,
): Promise<User | null> {
  const parsed = credentialsSchema.safeParse({
    email: credentials.email,
    password:
      typeof credentials.password === "string" &&
      credentials.password.length > 0
        ? credentials.password
        : undefined,
    code:
      typeof credentials.code === "string" && credentials.code.trim().length > 0
        ? credentials.code.trim()
        : undefined,
  });
  if (!parsed.success) {
    return null;
  }

  const normalizedEmail = normalizeLoginEmail(parsed.data.email);
  const emailParsed = z.email().safeParse(normalizedEmail);
  if (!emailParsed.success) {
    return null;
  }
  const email = emailParsed.data;
  const { password, code } = parsed.data;

  if (code !== undefined) {
    if (!isValidOtpCode(code)) {
      return null;
    }

    const [otpRow] = await db
      .select()
      .from(emailOtps)
      .where(eq(emailOtps.email, email))
      .limit(1);

    if (!otpRow || otpRow.expiresAt.getTime() < Date.now()) {
      return null;
    }

    const valid = verifyOtpAgainstStored(
      email,
      code,
      otpRow.salt,
      otpRow.codeHash,
    );
    if (!valid) {
      const nextAttempts = otpRow.attempts + 1;
      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        await db.delete(emailOtps).where(eq(emailOtps.email, email));
      } else {
        await db
          .update(emailOtps)
          .set({ attempts: nextAttempts })
          .where(eq(emailOtps.email, email));
      }
      return null;
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      await db.delete(emailOtps).where(eq(emailOtps.email, email));
      return toAuthUser(existing);
    }

    await db.delete(emailOtps).where(eq(emailOtps.email, email));

    const passwordHash =
      password !== undefined && password.length >= MIN_PASSWORD_LENGTH
        ? hashPassword(password)
        : null;
    const id = crypto.randomUUID();
    const displayName = email.split("@")[0] ?? "用户";

    await db.insert(users).values({
      id,
      email,
      emailVerified: new Date(),
      name: displayName,
      passwordHash,
    });

    return {
      id,
      email,
      name: displayName,
    };
  }

  if (password === undefined || password.length < MIN_PASSWORD_LENGTH) {
    return null;
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!existing?.passwordHash) {
    return null;
  }

  const ok = verifyPassword(password, existing.passwordHash);
  if (!ok) {
    return null;
  }

  return toAuthUser(existing);
}
