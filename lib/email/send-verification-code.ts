type SendResult =
  | { ok: true }
  | { ok: false; reason: "missing_config" | "send_failed" };

function isDevBypass(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Sends a 6-digit login/register OTP. In development, if Resend is not
 * configured, logs the code to the server console instead of failing.
 */
export async function sendLoginVerificationEmail(
  to: string,
  code: string,
): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    if (isDevBypass()) {
      console.info(`[email-otp] 发送至 ${to} 的验证码: ${code}`);
      return { ok: true };
    }
    return { ok: false, reason: "missing_config" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "登录验证码",
      html: `<p>你的验证码是 <strong>${code}</strong>，10 分钟内有效。如非本人操作请忽略。</p>`,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[email-otp] Resend error", res.status, text);
    return { ok: false, reason: "send_failed" };
  }

  return { ok: true };
}
