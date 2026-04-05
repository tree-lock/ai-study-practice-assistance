/**
 * 在非交互环境下补齐邮箱登录相关列与表（避免 drizzle-kit push 卡在「新建或重命名」提示）。
 * 运行：bun --env-file=.env.local scripts/ensure-email-auth-schema.ts
 */
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not defined");
}

const sql = postgres(url, { prepare: false, max: 1 });

async function main() {
  await sql.unsafe(`
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "passwordHash" text;
`);

  await sql.unsafe(`
CREATE TABLE IF NOT EXISTS email_otp (
  email text NOT NULL,
  code_hash text NOT NULL,
  salt text NOT NULL,
  expires_at timestamp NOT NULL,
  attempts integer DEFAULT 0 NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);
`);

  await sql.unsafe(`
CREATE UNIQUE INDEX IF NOT EXISTS email_otp_email_unique ON email_otp (email);
`);

  await sql.unsafe(`
CREATE TABLE IF NOT EXISTS email_otp_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  email text NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL
);
`);

  await sql.unsafe(`
CREATE INDEX IF NOT EXISTS email_otp_send_log_email_created_idx
ON email_otp_send_log (email, created_at);
`);

  console.log(
    "已确保 user.passwordHash、email_otp、email_otp_send_log 及索引存在。",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
  });
