/**
 * 一次性脚本：为 topic_id 为 NULL 的 questions 指定默认 topic，以便后续 db:push 能通过 NOT NULL 约束。
 * 使用 raw SQL，仅操作数据库中已存在的列（不依赖 schema 中未 push 的 is_default 等）。
 * 使用：bun --env-file=.env.local run scripts/fix-null-topic-id.ts
 */
import postgres from "postgres";

const DEFAULT_TOPIC_NAME = "默认题库";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not defined");
  }
  const sql = postgres(connectionString, { max: 1 });

  // 1. 取一个现有 topic（只查 id，按 created_at 取第一个）
  const [row] =
    await sql`SELECT id FROM topics ORDER BY created_at ASC LIMIT 1`;

  let topicId: string;
  if (!row) {
    const [inserted] =
      await sql`INSERT INTO topics (name, created_at, updated_at) VALUES (${DEFAULT_TOPIC_NAME}, NOW(), NOW()) RETURNING id`;
    if (!inserted) {
      throw new Error("插入默认题库失败");
    }
    topicId = inserted.id;
    console.log("已创建默认题库:", topicId);
  } else {
    topicId = row.id;
    console.log("使用现有题库 id:", topicId);
  }

  // 2. 将 topic_id 为 NULL 的 questions 更新为该 topic_id
  const updated =
    await sql`UPDATE questions SET topic_id = ${topicId}, updated_at = NOW() WHERE topic_id IS NULL RETURNING id`;
  console.log("已为", updated.length, "道题目补全 topic_id");

  await sql.end();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
