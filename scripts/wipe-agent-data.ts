import { db } from "@/lib/db";
import { agentMessages, agentTasks } from "@/lib/db/schema";

/**
 * 清空所有 Agent 任务与消息，保留用户与登录相关表。
 * 运行：bun --env-file=.env.local scripts/wipe-agent-data.ts
 */
async function main() {
  await db.delete(agentMessages);
  await db.delete(agentTasks);
  console.log("已清空 agent_messages、agent_tasks");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
