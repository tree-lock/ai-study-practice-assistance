---
name: wipe-question-data
description: Clear all topics, questions, and related business tables from the local Postgres database using the existing wipe script. Use when the user asks to delete, reset, or clear all question bank/problem data while keeping user auth accounts.
---

# Wipe Question Data

## 使用场景 (When to use)

- 用户说「删除所有题库/题目」「清空本地题库数据」「重置本地题库/练习数据」之类需求。
- 目标是**只清空题库 & 题目相关业务数据**，**保留用户账号和登录相关表**（`user`、`account`、`session` 等）。
- 仅用于本项目的 **本地 / 开发数据库**，不要默认作用于生产环境。

## 涉及的表 (Domain knowledge)

在当前项目中，题库和题目相关的数据表主要包括（见 `lib/db/schema.ts`）：

- `topics`：题库
- `questions`：题目（通过 `topic_id` 引用 `topics`，`onDelete: "cascade"`）
- `options`：选择题选项（通过 `question_id` 级联）
- `answers`：答案 / 解析（通过 `question_id` 级联）
- `tags`、`question_tags`：标签与题目-标签关联
- `topic_knowledge_points``、`question_knowledge_points`：知识点和题目-知识点关联
- `user_progress`：用户做题进度

删除 `topics` 时会依赖外键级联删除绝大部分关联数据；单独清空 `user_progress` 则会清除所有做题记录。

## 前置条件 (Preconditions)

在执行清空操作前，助手应：

1. **确认意图范围**：
   - 明确用户是否只想清空「题库/题目及相关数据」而**保留用户账号**。
   - 如用户还希望删除账号数据，应单独说明，这个 skill 默认**不删除**账号/登录相关表。
2. **确认环境**：
   - 默认只对本地/开发数据库执行，使用 `.env.local` 中的 `DATABASE_URL`。
   - 只有在用户**明确说明是生产或其他环境**时，才考虑使用对应环境文件（例如 `.env.production.local`），并再次口头确认。
3. **确保脚本存在**：
   - 依赖的脚本路径：`scripts/wipe-question-data.ts`
   - 如果脚本缺失或被改动严重，应先阅读/恢复脚本再执行。

## 操作步骤 (Execution steps)

### 1. 与用户确认危险操作

- 明确说明：这是**不可逆的破坏性操作**，会删除所有题库/题目及其相关数据。
- 复述本次删除的范围，例如：
  - 「将删除所有 `topics`、`questions`、`options`、`answers`、`tags`、`question_tags`、`topic_knowledge_points`、`question_knowledge_points`、`user_progress` 表中的数据，但不会删除 `user` 及登录相关表中的数据。」
- 只有在用户明确回复同意后，才继续执行脚本。

### 2. 执行清空脚本 (Local dev DB)

在项目根目录 `/Users/treezlock/code/practice` 下，通过 Shell 工具运行（注意显式指定环境文件）：

```bash
bun --env-file=.env.local scripts/wipe-question-data.ts
```

要点：

- 不要省略 `--env-file=.env.local`，以避免误连到其他数据库。
- 如果用户明确要求作用于其他环境（例如生产），**必须先二次确认**，然后再根据约定改用相应环境文件（例如 `.env.production.local`）。

### 3. 验证与反馈

执行完脚本后：

1. 检查脚本输出是否有错误信息。
2. 可选：运行项目中已有的检查命令，确保脚本没有引入类型/风格问题：

   ```bash
   bun check
   ```

3. 将结果用简洁中文总结给用户，包括：
   - 清空是否成功（基于脚本输出和是否报错）。
   - 明确说明哪些表/数据已经被清空。
   - 提醒用户刷新前端页面查看最新状态。

## 示例 (Examples)

### 示例 1：清空本地所有题库/题目数据

**用户**：  
「删除所有本地数据库中用户的所有题库和题目以及相关数据。」

**助手行为**：

1. 用自然语言确认：  
   - 说明将清空所有题库/题目及相关表数据，保留账号数据，只作用于本地数据库。
2. 用户确认后，助手在项目根目录执行：  
   - `bun --env-file=.env.local scripts/wipe-question-data.ts`
3. 如果脚本执行成功，再向用户反馈：  
   - 数据已清空，可以刷新前端页面确认结果。

