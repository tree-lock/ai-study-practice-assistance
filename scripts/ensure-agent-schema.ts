/**
 * 在非交互环境下创建 agent 相关表与枚举（避免 drizzle-kit push 卡在 enum 映射提示）。
 * 运行：bun --env-file=.env.local scripts/ensure-agent-schema.ts
 */
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error("DATABASE_URL is not defined");
}

const sql = postgres(url, { prepare: false, max: 1 });

async function main() {
  await sql.unsafe(`
DO $$ BEGIN
  CREATE TYPE agent_message_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
`);

  await sql.unsafe(`
CREATE TABLE IF NOT EXISTS agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title text DEFAULT '新任务' NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);
`);

  await sql.unsafe(`
CREATE TABLE IF NOT EXISTS agent_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  task_id uuid NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
  role agent_message_role NOT NULL,
  content text NOT NULL,
  client_message_id text,
  created_at timestamp DEFAULT now() NOT NULL
);
`);

  await sql.unsafe(`
CREATE UNIQUE INDEX IF NOT EXISTS agent_messages_task_client_msg
ON agent_messages (task_id, client_message_id);
`);

  console.log("已确保 agent_message_role、agent_tasks、agent_messages 存在。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
  });
