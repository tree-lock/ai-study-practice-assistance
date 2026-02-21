# AI 智能刷题助手 (AI Study Assistant)

基于 **Bun + Next.js + AI** 构建的智能刷题与学习辅助平台。通过 AI 技术帮助用户高效管理题库、智能分析题目、自动提取知识点，并规划科学的复习进度。

## 项目愿景

打造一个"输入-处理-输出-反馈"的完整学习闭环：

1. **输入**：多模态导入题目（文本/PDF/图片）
2. **处理**：AI 自动解析、识别题型、提取知识点
3. **输出**：智能刷题、错题重练、变式训练
4. **反馈**：生成学习报告、动态调整复习计划

## 已实现功能

### AI 智能题目分析

- **智能解析**：输入原始题目文本，AI 自动格式化为结构化 Markdown + LaTeX
- **题型识别**：自动识别 6 种题型（选择题、填空题、主观题、应用题、证明题、综合题）
- **知识点提取**：AI 自动提取 1-3 个知识点标签
- **题库推荐**：根据题目内容智能推荐存放的题库（已有或建议新建）
- **实时预览**：支持题目内容编辑和 LaTeX 公式实时预览

### 结构化知识管理

- **一级题库**：扁平化题库结构（如"考研数学""数据结构"），降低维护复杂度
- **智能标签**：AI 自动为题目打上知识点标签
- **LaTeX 渲染**：支持行内公式 `$...$` 和行间公式 `$$...$$`

### 用户系统

- **Google OAuth**：一键登录，无需注册
- **数据隔离**：题库和题目按用户隔离，保证数据安全

## 规划中功能

- [ ] 基础刷题界面（选择题答题交互）
- [ ] 做题记录与学习状态追踪
- [ ] 文件上传（S3/R2）与图片/PDF OCR 解析
- [ ] AI 判题（填空题/主观题智能批改）
- [ ] 艾宾浩斯复习算法调度
- [ ] 错题变式生成
- [ ] 学习报告与掌握度热力图

## 技术栈

| 类别 | 技术 |
|------|------|
| **运行时** | [Bun](https://bun.sh) |
| **框架** | [Next.js 16](https://nextjs.org) (App Router) |
| **数据库** | PostgreSQL + [pgvector](https://github.com/pgvector/pgvector) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) |
| **验证** | [Zod](https://zod.dev) |
| **认证** | [Auth.js (NextAuth v5)](https://authjs.dev) |
| **AI 模型** | MiniMax (MiniMax-M2.5) |
| **UI 组件** | [Radix Themes](https://www.radix-ui.com/themes) + [Tailwind CSS](https://tailwindcss.com) |
| **Markdown** | react-markdown + remark-math + rehype-katex |
| **代码规范** | [Biome](https://biomejs.dev) |

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── page.tsx            # 首页 - AI 命令中心
│   ├── layout.tsx          # 全局布局
│   ├── actions/            # Server Actions
│   │   ├── topic.ts        # 题库 CRUD
│   │   ├── question.ts     # 题目 CRUD
│   │   └── agent.ts        # AI 分析/保存题目
│   └── topics/[id]/        # 题库详情页
├── components/             # React 组件
│   ├── agent-command-center/   # AI 命令中心组件
│   ├── sidebar/            # 侧边栏导航
│   └── ...
├── lib/                    # 核心库
│   ├── db/                 # 数据库 Schema & 连接
│   ├── ai/                 # AI 模型配置与分析逻辑
│   └── auth/               # 认证相关
└── docs/                   # 项目文档
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
DATABASE_URL="postgresql://..."

# Auth.js
AUTH_SECRET="..."
AUTH_GOOGLE_ID="..."
AUTH_GOOGLE_SECRET="..."

# AI 模型 (MiniMax)
MINIMAX_API_KEY="..."
```

### 4. 启动数据库

```bash
docker-compose up -d
```

### 5. 初始化数据库

```bash
bun run db:push
```

### 6. 启动开发服务器

```bash
bun dev
```

访问 [http://localhost:3000](http://localhost:3000) 开始使用。

## 开发命令

| 命令 | 说明 |
|------|------|
| `bun dev` | 启动开发服务器 |
| `bun build` | 构建生产版本 |
| `bun check` | 运行 Biome lint + typecheck |
| `bun run db:push` | 推送 Schema 到数据库 |
| `bun run db:studio` | 打开 Drizzle Studio |
| `bun test` | 运行测试 |
