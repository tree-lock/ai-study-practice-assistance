# AI 智能刷题助手 (AI Study Assistant)

基于 **Bun + Next.js 16 + AI** 构建的智能刷题与学习辅助平台。通过 AI 技术帮助用户高效管理题库、智能分析题目、自动提取知识点，并规划科学的复习进度。

## 项目愿景

打造一个"输入-处理-输出-反馈"的完整学习闭环：

1. **输入**：多模态导入题目（文本/PDF/图片）
2. **处理**：AI 自动解析、识别题型、提取知识点
3. **输出**：智能刷题、错题重练、变式训练
4. **反馈**：生成学习报告、动态调整复习计划

## 已实现功能

### 🤖 AI 智能题目分析

- **多模态导入**：支持文字、图片、PDF、Word、PPT、HTML 等，通过 [MinerU](https://mineru.net) 解析为 Markdown
- **智能解析**：输入原始题目文本，AI 自动格式化为结构化 Markdown + LaTeX
- **题型识别**：自动识别 6 种题型（选择题、填空题、主观题、应用题、证明题、综合题）
- **知识点提取**：AI 自动提取 1-3 个知识点标签
- **题库推荐**：根据题目内容智能推荐存放的题库（已有或建议新建）
- **实时预览**：支持题目内容编辑和 LaTeX 公式实时预览

### 📚 结构化知识管理

- **一级题库**：扁平化题库结构（如"考研数学""数据结构"），降低维护复杂度
- **智能标签**：AI 自动为题目打上知识点标签
- **LaTeX 渲染**：支持行内公式 `$...$` 和行间公式 `$$...$$`
- **题库大纲**：支持为题库生成学习大纲，帮助规划学习路径

### 👤 用户系统

- **Google OAuth**：一键登录，无需注册
- **数据隔离**：题库和题目按用户隔离，保证数据安全

### 🎯 学习进度追踪

- **艾宾浩斯记忆曲线**：基于间隔重复算法的复习调度
- **掌握度状态**：新学/学习中/复习中/已掌握 四种状态追踪
- **做题历史记录**：记录每次答题的时间、正确率、难度因子

### 🎨 界面与主题

- **暗黑模式**：支持浅色/暗黑模式切换
- **智能跟随**：默认跟随系统主题，支持手动切换
- **持久化**：用户主题偏好自动保存，刷新页面不丢失
- **主题切换**：顶部导航右侧提供快捷切换按钮

## 规划中功能

- [ ] 基础刷题界面（选择题答题交互）
- [ ] 做题记录与学习状态追踪
- [x] 图片/文档上传与 MinerU 解析（PDF、Word、PPT、图片、HTML）
- [ ] AI 判题（填空题/主观题智能批改）
- [ ] 艾宾浩斯复习算法调度
- [ ] 错题变式生成
- [ ] 学习报告与掌握度热力图

## 技术栈

| 类别         | 技术                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------- |
| **运行时**   | [Bun](https://bun.sh)                                                                                 |
| **框架**     | [Next.js 16](https://nextjs.org) (App Router)                                                         |
| **数据库**   | PostgreSQL + [pgvector](https://github.com/pgvector/pgvector)                                         |
| **ORM**      | [Drizzle ORM](https://orm.drizzle.team)                                                               |
| **验证**     | [Zod](https://zod.dev)                                                                                |
| **认证**     | [Auth.js (NextAuth v5)](https://authjs.dev)                                                           |
| **AI 模型**  | MiniMax (MiniMax-M2.5)                                                                                |
| **UI 组件**  | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com)（基于 Radix Primitives） |
| **Markdown** | react-markdown + remark-math + rehype-katex                                                           |
| **代码规范** | [Biome](https://biomejs.dev)                                                                          |
| **测试框架** | [Vitest](https://vitest.dev) + Testing Library                                                        |

## 数据库设计

### 核心业务表

- **topics**（题库）：存储题库信息，支持用户级隔离
- **questions**（题目）：存储题目内容、类型、难度、Embedding 向量
- **options**（选项）：选择题的选项数据
- **answers**（答案）：题目答案与解析
- **topic_knowledge_points**（题库知识点）：题库级别的知识点标签
- **question_knowledge_points**（题目 - 知识点关联）：多对多关联
- **user_progress**（用户进度）：基于艾宾浩斯记忆曲线的学习进度追踪

### Auth.js 认证表

- **user**（用户）：用户基本信息
- **account**（账户）：OAuth 账户关联
- **session**（会话）：用户会话
- **verificationToken**（验证令牌）：邮箱验证等

### 遗留兼容表

- **tags** / **question_tags**：保留向后兼容的标签系统

## 项目结构

```
├── app/                        # Next.js App Router
│   ├── page.tsx                # 首页 - AI 命令中心
│   ├── layout.tsx              # 全局布局
│   ├── app-layout.tsx          # 应用布局（Sidebar + 主内容区）
│   ├── actions/                # Server Actions
│   │   ├── topic.ts            # 题库 CRUD
│   │   ├── topic.test.ts       # 题库单元测试
│   │   ├── question.ts         # 题目 CRUD
│   │   ├── agent.ts            # AI 分析/保存题目
│   │   └── mineru.ts           # MinerU 文档解析
│   ├── topics/[id]/            # 题库详情页
│   │   └── questions/[id]/     # 题目详情页
│   └── api/                    # API 路由
│       ├── auth/[...nextauth]/ # Auth.js 认证端点
│       ├── topics/[id]/        # 题库 API
│       └── agent/              # AI 分析 API
├── components/                 # React 组件
│   ├── agent-command-center/   # AI 命令中心（核心交互组件）
│   │   ├── index.tsx           # 主组件
│   │   ├── input-area.tsx      # 输入区域（支持拖拽上传）
│   │   ├── result-panels.tsx   # 结果面板
│   │   ├── question-panel.tsx  # 题目面板
│   │   ├── use-question-generator.ts  # 题目生成逻辑
│   │   └── ...
│   ├── sidebar/                # 侧边栏导航
│   │   ├── index.tsx           # 主组件
│   │   ├── user-info.tsx       # 用户信息
│   │   ├── topic-list.tsx      # 题库列表
│   │   └── actions.tsx         # 快捷操作
│   ├── ui/                     # shadcn/ui 基础组件
│   └── ...
├── lib/                        # 核心库
│   ├── db/                     # 数据库
│   │   ├── schema.ts           # Drizzle ORM Schema
│   │   └── index.ts            # 数据库连接
│   ├── ai/                     # AI 模型与分析
│   │   ├── minimax.ts          # MiniMax 模型配置
│   │   ├── question-analyzer.ts # 题目分析逻辑
│   │   └── prompts/            # AI Prompt 模板
│   ├── auth/                   # 认证相关
│   ├── mineru/                 # MinerU 客户端
│   └── hooks/                  # 自定义 Hooks
├── scripts/                    # 工具脚本
│   ├── wipe-question-data.ts   # 清空题库数据
│   └── minimax-speed-test.ts   # API 速度测试
└── drizzle/                    # 数据库迁移文件
```

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. 安装依赖

```bash
bun install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填入配置：

```env
# 数据库
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"

# Auth.js
# 生成方法：openssl rand -base64 32
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# AI 模型 (MiniMax)
MINIMAX_API_KEY="your-minimax-api-key"

# MinerU 文档解析 (图片/PDF/Office 转 Markdown)
# 在 https://mineru.net/apiManage 申请 Token
MINERU_API_TOKEN="your-mineru-api-token"
```

### 4. 启动数据库

使用 Docker Compose 启动 PostgreSQL（包含 pgvector 扩展）：

```bash
docker-compose up -d
```

### 5. 初始化数据库

推送 Schema 到数据库：

```bash
bun run db:push
```

或使用迁移（生产环境推荐）：

```bash
bun run db:generate
bun run db:migrate
```

### 6. 启动开发服务器

```bash
bun dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用。

## 开发命令

| 命令                  | 说明                                      |
| --------------------- | ----------------------------------------- |
| `bun dev`             | 启动开发服务器（热重载）                  |
| `bun build`           | 构建生产版本                              |
| `bun build:prod`      | 使用生产环境配置构建（加载 .env）         |
| `bun start`           | 启动生产服务器（端口 8080）               |
| `bun check`           | 运行 Biome 代码检查 + TypeScript 类型检查 |
| `bun lint`            | 运行 Biome Lint                           |
| `bun format`          | 运行 Biome 格式化                         |
| `bun run db:push`     | 推送 Schema 到数据库（开发环境）          |
| `bun run db:generate` | 生成数据库迁移文件                        |
| `bun run db:migrate`  | 执行数据库迁移（生产环境）                |
| `bun run db:studio`   | 打开 Drizzle Studio（数据库管理界面）     |
| `bun test`            | 运行 Vitest 单元测试                      |
| `bun test:watch`      | 运行 Vitest 监视模式（文件变更自动重跑）  |
| `bun run typecheck`   | 仅运行 TypeScript 类型检查                |

## 核心功能说明

### AI 题目分析流程

1. **输入阶段**：用户通过文本输入或拖拽上传文件（图片/PDF/Word/PPT/HTML）
2. **文档解析**：MinerU 自动解析文档为 Markdown 格式
3. **AI 分析**：调用 MiniMax API 进行题目识别、格式化、题型分类、知识点提取
4. **结果预览**：展示 AI 分析结果，支持手动编辑调整
5. **保存入库**：选择或创建题库，保存题目到数据库

### 题库管理

- **扁平化结构**：一级题库设计，降低维护成本
- **知识点标签**：AI 自动提取 + 手动管理
- **学习大纲**：支持为题库生成学习路径大纲
- **用户隔离**：每个用户只能访问自己的题库

### 学习进度追踪

基于艾宾浩斯记忆曲线算法：

- **状态管理**：新学 → 学习中 → 复习中 → 已掌握
- **间隔重复**：根据 ease factor 和 interval 动态调整下次复习时间
- **历史记录**：记录每次答题的质量（0-5 分）、时长、正确率

## 测试

项目使用 Vitest + Testing Library 进行测试：

```bash
# 运行所有测试
bun test

# 监视模式（开发推荐）
bun test:watch

# 运行特定测试文件
bun test app/actions/topic.test.ts
```

### 测试覆盖

- ✅ **Server Actions 测试**：题库 CRUD 操作
- ✅ **工具函数测试**：用户认证获取
- ✅ **组件测试**：TopicManager 等交互组件

## API 文档

### Server Actions

- **`app/actions/topic.ts`**：题库 CRUD 操作

  - `createTopic()` - 创建新题库
  - `updateTopic()` - 更新题库信息
  - `deleteTopic()` - 删除题库
  - `getTopics()` - 获取用户题库列表

- **`app/actions/question.ts`**：题目 CRUD 操作

  - `createQuestion()` - 创建题目
  - `updateQuestion()` - 更新题目
  - `deleteQuestion()` - 删除题目
  - `getQuestionsByTopic()` - 获取题库下所有题目

- **`app/actions/agent.ts`**：AI 分析相关

  - `analyzeQuestion()` - AI 题目分析
  - `saveQuestionWithAnalysis()` - 保存 AI 分析后的题目

- **`app/actions/mineru.ts`**：文档解析
  - `parseDocument()` - 调用 MinerU 解析文档

### REST API

- **`GET /api/topics/[id]`**：获取题库详情
- **`POST /api/agent/format-stream`**：流式 AI 分析接口

## 技术细节

### AI Prompt 工程

项目使用精心设计的 Prompt 模板来确保 AI 输出质量：

- **`lib/ai/prompts/question-import.ts`**：题目导入格式化
- **`lib/ai/prompts/question-step-*.ts`**：分步分析（题型识别、知识点提取等）
- **`lib/ai/prompts/solution-generate.ts`**：答案解析生成
- **`lib/ai/prompts/outline-generate.ts`**：题库大纲生成

### 数据库 Schema

使用 Drizzle ORM 定义类型安全的数据库 Schema：

```typescript
// 核心业务表
topics; // 题库
questions; // 题目（含 vector 字段用于语义搜索）
options; // 选择题选项
answers; // 答案与解析
topic_knowledge_points; // 题库知识点
question_knowledge_points; // 题目 - 知识点关联
user_progress; // 用户学习进度（艾宾浩斯算法）
```

### 前端架构

- **Server Components 优先**：尽可能使用 React Server Components 减少客户端 JavaScript
- **Suspense 边界**：异步数据加载使用 Suspense 包裹，避免全页面阻塞
- **自定义 Hooks**：复杂状态逻辑封装为 Hooks（如 `useQuestionGenerator`）
- **SWR 数据获取**：使用 SWR 进行客户端数据获取和缓存

## 贡献指南

### 开发环境设置

1. 确保已安装 Bun（推荐最新版本）
2. 确保已安装 Docker 和 Docker Compose
3. 克隆项目并安装依赖
4. 配置 `.env.local` 文件
5. 启动数据库并初始化
6. 运行 `bun dev` 启动开发服务器

### 代码规范

项目使用 Biome 进行代码检查和格式化：

```bash
# 提交前检查
bun check

# 格式化代码
bun format
```

### Git 工作流

- `main` 分支：稳定版本
- `feature/*` 分支：新功能开发
- `fix/*` 分支：Bug 修复
- 使用 Pull Request 进行代码审查

## 常见问题

### Q: 为什么选择 MiniMax 而不是其他 AI 模型？

A: MiniMax-M2.5 在中文题目理解、格式化输出方面表现出色，且 API 成本相对较低。

### Q: MinerU 解析失败怎么办？

A: 检查以下几点：

1. 确认 `MINERU_API_TOKEN` 配置正确
2. 文件大小不超过 200MB
3. 文件格式在支持列表中（PDF/Word/PPT/图片/HTML）
4. 查看控制台错误信息

### Q: 如何清空测试数据？

A: 运行清空脚本：

```bash
bun run scripts/wipe-question-data.ts
```

**注意**：此操作会删除所有题库和题目数据，但保留用户账户。

## 许可证

MIT License
