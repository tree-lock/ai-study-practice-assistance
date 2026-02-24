import { db } from "@/lib/db";
import { topics, userProgress } from "@/lib/db/schema";

async function main() {
  // 这里只清空题库/题目相关业务数据，不删除用户账号和登录信息
  console.log("开始清空题库与题目相关数据...");

  // 先清空用户做题进度，再清空题库（会通过外键级联删除题目及其关联数据）
  await db.delete(userProgress);
  console.log("已清空 user_progress 表数据");

  await db.delete(topics);
  console.log("已清空 topics 表数据（级联删除所有题目及相关数据）");

  console.log("题库与题目相关数据清空完成。");
}

main().catch((error) => {
  console.error("清空题库数据失败:", error);
  process.exit(1);
});
