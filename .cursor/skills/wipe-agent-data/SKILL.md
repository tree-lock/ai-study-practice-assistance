---
name: wipe-agent-task-data
description: 使用 wipe 脚本清空本地 Postgres 中所有 Agent 任务与对话消息，保留用户与登录表。用于「清空任务记录」「重置对话数据」等需求。
---

# 清空 Agent 任务数据

## 使用场景

- 用户要删除/重置**所有任务与对话记录**（`agent_tasks`、`agent_messages`），**保留** `user`、`account`、`session` 等登录数据。
- 仅用于**本地/开发**数据库；生产环境须用户明确确认。

## 前置条件

1. 向用户说明这是**不可逆**操作。
2. 用户明确同意后再执行。
3. 脚本路径：`scripts/wipe-agent-data.ts`

## 执行

```bash
bun --env-file=.env.local scripts/wipe-agent-data.ts
```

## 验证

- 查看脚本输出是否报错；必要时 `bun check`。
