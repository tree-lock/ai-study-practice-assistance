# AI Agent 对话应用

基于 **Bun + Next.js 16 + Vercel AI SDK** 的多轮对话应用：侧栏为**任务记录**（每个任务一条对话线程），通过 [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) 调用所选模型。

## 功能概览

- **任务**：登录用户可创建任务，在 `/tasks/[id]` 与模型对话；消息持久化在 PostgreSQL。
- **认证**：邮箱验证码注册与登录、邮箱密码登录（Auth.js Credentials），可选 Google OAuth；数据按用户隔离。
- **UI**：浅色/深色主题、Markdown 渲染（含 KaTeX）。

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 运行时 | [Bun](https://bun.sh) |
| 框架 | [Next.js 16](https://nextjs.org)（App Router） |
| 数据库 | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team) |
| 认证 | [Auth.js](https://authjs.dev) |
| AI | [AI SDK](https://ai-sdk.dev/docs/introduction) + Vercel AI Gateway |
| UI | Tailwind CSS + shadcn/ui |
| 规范 | [Biome](https://biomejs.dev) |
| 测试 | Vitest |

## 数据库表（业务）

- **agent_tasks**：任务（会话）元数据，`user_id` 外键。
- **agent_messages**：消息内容，`task_id` 级联删除。

Auth 表：`user`（含 `passwordHash` 供邮箱密码）、`account`、`session`、`verificationToken`、`authenticator`（与 Drizzle Adapter 一致）；另有 `email_otp`、`email_otp_send_log` 用于邮箱验证码与发信限流。

## 环境变量

复制 `env.example` 为 `.env.local` 并填写：

- `DATABASE_URL`：PostgreSQL 连接串
- `AUTH_SECRET`、`AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET`（若启用 Google 登录）
- `RESEND_API_KEY`、`EMAIL_FROM`：邮箱验证码发信（生产环境必填；本地开发未配置时验证码会输出在运行 `bun dev` 的终端）
- `AI_GATEWAY_API_KEY`：Vercel AI Gateway API Key
- `AI_GATEWAY_MODEL`：模型 ID（`provider/model`，见 Gateway 文档）

## 本地开发

```bash
bun install
# 启动 Postgres 后同步 schema：
bun db:push
# 若 drizzle-kit push 卡在「enum 是新建还是重命名」的交互提示，可改用（幂等）：
bun run db:ensure-agent
bun dev
```

## 清空任务数据（保留账号）

**不可逆**。用户确认后执行：

```bash
bun --env-file=.env.local scripts/wipe-agent-data.ts
```

## Schema 迁移说明

从旧版「题库/题目」schema 切换为当前 Agent schema 时，`bun db:push` 可能对开发库做**破坏性**变更，请先备份或接受清空后再推送。
