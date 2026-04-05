"use server";

import { and, count, desc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import { createOtpSaltAndHash } from "@/lib/auth/email-otp-crypto";
import { normalizeLoginEmail } from "@/lib/auth/login-email";
import { db } from "@/lib/db";
import { emailOtpSendLogs, emailOtps } from "@/lib/db/schema";
import { sendLoginVerificationEmail } from "@/lib/email/send-verification-code";

/** 同一邮箱两次发送最小间隔（略放宽，避免正常重试被 60s 卡死） */
const SEND_COOLDOWN_MS = 30_000;
const MAX_SENDS_PER_24H = 10;
const OTP_TTL_MS = 10 * 60 * 1000;

function randomSixDigitCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return n.toString().padStart(6, "0");
}

export type SendEmailOtpResult =
  | { ok: true }
  | {
      ok: false;
      message: string;
    };

export async function sendEmailOtp(
  rawEmail: string,
): Promise<SendEmailOtpResult> {
  const normalized = normalizeLoginEmail(rawEmail);
  const parsed = z.email().safeParse(normalized);
  if (!parsed.success) {
    return { ok: false, message: "请输入有效邮箱" };
  }
  const email = parsed.data;

  const [lastSend] = await db
    .select({ createdAt: emailOtpSendLogs.createdAt })
    .from(emailOtpSendLogs)
    .where(eq(emailOtpSendLogs.email, email))
    .orderBy(desc(emailOtpSendLogs.createdAt))
    .limit(1);

  if (lastSend) {
    const elapsed = Date.now() - lastSend.createdAt.getTime();
    if (elapsed < SEND_COOLDOWN_MS) {
      const waitSec = Math.max(
        1,
        Math.ceil((SEND_COOLDOWN_MS - elapsed) / 1000),
      );
      return {
        ok: false,
        message: `发送过于频繁，请 ${waitSec} 秒后再试`,
      };
    }
  }

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [countRow] = await db
    .select({ c: count() })
    .from(emailOtpSendLogs)
    .where(
      and(
        eq(emailOtpSendLogs.email, email),
        gte(emailOtpSendLogs.createdAt, dayAgo),
      ),
    );

  if ((countRow?.c ?? 0) >= MAX_SENDS_PER_24H) {
    return { ok: false, message: "该邮箱今日发送次数已达上限" };
  }

  const code = randomSixDigitCode();
  const sent = await sendLoginVerificationEmail(email, code);
  if (!sent.ok) {
    if (sent.reason === "missing_config") {
      return {
        ok: false,
        message:
          "未配置邮件服务（生产环境需设置 RESEND_API_KEY 与 EMAIL_FROM）",
      };
    }
    return { ok: false, message: "邮件发送失败，请稍后重试" };
  }

  const { salt, codeHash } = createOtpSaltAndHash(email, code);

  await db.delete(emailOtps).where(eq(emailOtps.email, email));
  await db.insert(emailOtps).values({
    email,
    salt,
    codeHash,
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
    attempts: 0,
  });

  await db.insert(emailOtpSendLogs).values({ email });

  return { ok: true };
}
