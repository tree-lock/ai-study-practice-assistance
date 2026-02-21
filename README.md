# 🎓 AI 智能刷题助手 (AI Study Assistant)

这是一个基于 **Bun + Next.js + AI** 构建的现代化智能刷题与学习辅助平台。旨在通过 AI 技术帮助用户高效管理题库、智能判题、生成个性化学习报告，并利用艾宾浩斯遗忘曲线科学规划复习进度。

## 🚀 项目愿景

打造一个“输入-处理-输出-反馈”的完整学习闭环：

1.  **输入**：多模态导入题目（PDF/图片/文本）。
2.  **处理**：AI 自动解析、打标、建立知识图谱。
3.  **输出**：智能刷题、错题重练、变式训练。
4.  **反馈**：生成学习报告、动态调整复习计划。

## ✨ 核心功能

### 1. 智能题库导入 (Smart Ingestion)

- **多模态上传**：支持批量上传 PDF 或图片（试卷/习题册）。
- **AI 解析**：自动识别题目内容、选项、公式（LaTeX）及手写笔记。
- **导入校对**：提供左右分屏的校对界面，确保入库准确性。
- **智能去重**：利用向量搜索（Vector Search）检测并提示重复题目。

### 2. 结构化知识管理 (Knowledge Management)

- **一级题库**：题库结构统一为一级题库（如“考研数学”“高等数学”“数据结构”），不再使用上级/子级关系，降低维护复杂度。
- **智能标签**：AI 自动为题目打上知识点、难度、题型标签。
- **知识图谱**：构建知识点依赖关系（如：做错“二重积分” -> 推荐复习“极坐标”）。

### 3. 沉浸式刷题体验 (Practice Mode)

- **多种题型**：支持选择题、填空题、主观题。
- **AI 判题**：
  - **选择题**：自动核对。
  - **填空/主观题**：支持拍照上传手写答案，AI 识别笔迹并进行逻辑批改，指出具体错误步骤。
- **专注模式**：全屏刷题，屏蔽干扰，记录答题耗时。

### 4. 科学复习与反馈 (Review & Feedback)

- **艾宾浩斯调度引擎**：基于记忆曲线自动安排每日复习任务。
- **错题归因**：用户可标记错因（粗心/概念不清/运算错误），AI 据此调整推荐策略。
- **变式训练**：针对错题，AI 一键生成“举一反三”的变式题，巩固薄弱点。

### 5. 数据分析与报告 (Analytics)

- **学习报告**：生成每日/每周学习总结，分析掌握度变化。
- **掌握度热力图**：可视化展示各知识点的掌握情况。
- **复习建议**：基于数据推荐今日重点攻克的知识盲区。

## 🛠 技术栈

- **Runtime & Package Manager**: [Bun](https://bun.sh)
- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Database**: PostgreSQL (with `pgvector` for AI search)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team)
- **Validation**: [Zod](https://zod.dev) (End-to-end type safety)
- **Auth**: [Auth.js (NextAuth v5)](https://authjs.dev) (Google Login)
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai)
- **Model Provider**: OpenAI (GPT-4o) / Google (Gemini 1.5 Pro)
- **Storage**: AWS S3 / Cloudflare R2 (For images/PDFs)
- **UI Components**: Radix Themes + Tailwind CSS

## 📅 开发进度表 (Roadmap)

### Phase 1: 基础建设 (Infrastructure)

- [x] 初始化 Next.js + Bun 项目结构 (已完成依赖安装: Drizzle, Postgres, Zod)
- [x] 配置 PostgreSQL + Drizzle ORM 环境 (Schema, Migration)
- [x] 集成 Auth.js (Google OAuth)
- [x] 设计数据库 Schema (Topics, Questions, Users)
- [x] 实现基础题库 (Topic) 的 CRUD

### Phase 1.5: 上传题目 (当前阶段)

- [x] 在主页集成「上传题目」入口（选择/创建题库 → 文本题目 + 图片/PDF 文件名占位落库）

### Phase 2: 核心循环 (Core Loop)

- [ ] 开发基础刷题界面 (选择题)
- [ ] 实现做题记录与状态更新 (做对/做错)
- [ ] 搭建文件上传服务 (S3/R2 集成)

### Phase 3: AI 深度集成 (AI Integration)

- [ ] 接入 Vercel AI SDK
- [ ] 实现图片/PDF 上传与 OCR 智能解析
- [ ] 开发 AI 判题功能 (填空/主观题)
- [ ] 实现 AI 错题分析与知识点提取

### Phase 4: 高级功能与算法 (Advanced)

- [ ] 实现艾宾浩斯复习算法调度
- [ ] 开发错题变式生成功能
- [ ] 制作学习报告与掌握度热力图
- [ ] 移动端适配与 PWA 优化

### UI 体验升级（进行中）

- [x] 接入 Radix Themes，统一基础组件风格
- [x] 完成 Agent 风格工作台页面（Dashboard）与侧边导航骨架
- [x] 调整为路径化工作区架构：主页 `/`，工作区 `/dashboard`，子页面使用 `/dashboard/*`
- [x] 保留按 ID 切换入口：`/topics/[topicId]` 重定向到 `/dashboard/topics/[topicId]`
- [ ] 接入真实 Agent 对话流（输入 -> 执行 -> 结果卡片）

## 📦 快速开始

1.  **克隆项目**

    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  **安装依赖**

    ```bash
    bun install
    ```

3.  **配置环境变量**
    复制 `.env.example` 为 `.env.local` 并填入以下配置：

    ```env
    DATABASE_URL="postgresql://..."
    AUTH_SECRET="..."
    AUTH_GOOGLE_ID="..."
    AUTH_GOOGLE_SECRET="..."
    OPENAI_API_KEY="..."
    # 或其他 AI Provider Key
    ```

4.  **初始化数据库**

    ```bash
    bun run db:push
    ```

5.  **启动开发服务器**

    ```bash
    bun dev
    ```

6.  **运行自动化测试**
    ```bash
    bun run test
    ```

打开 [http://localhost:3000](http://localhost:3000) 查看结果。
