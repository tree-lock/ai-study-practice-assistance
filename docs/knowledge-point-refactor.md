# 知识点与题库管理逻辑重构需求文档

## 需求背景

当前知识点与题目、题库的关系需要重构，将知识点从"题目属性"转变为"题库属性"，使知识管理更加结构化。

---

## 核心变更

### 1. 知识点归属变更

**现状**：知识点从题目生成，题目可以自由创建知识点
**目标**：知识点由题库统一管理，题目只能引用题库中已有的知识点

**数据关系**：

- 题库（Topic）：定义和管理知识点列表（知识点的"源头"）
- 题目（Question）：仍然拥有知识点属性，但**只能从所属题库的知识点中选择**（约束引用）

**规则**：

- 一个题库可以有多个不重复的知识点
- 题目生成/编辑时，知识点必须从所属题库的已有知识点中选择
- 不允许题目自由创建新知识点

### 2. 新增题目时的题库选择逻辑

**取消**：新增题目时的"新增题库"选项

**新增**：智能匹配 + 建议机制

- 如果题目不适合放在任何已有题库中：
  - 自动选择一个最相近的题库
  - 显示提示："此题目不适合存放在任何已有题库中，建议新增题库：【AI 生成的建议题库名】"

### 3. 题库大纲功能（新增）

**大纲 = 题库的描述**

大纲生成方式：

- 用户手动添加大纲
- AI 根据题库名称自动生成大纲

大纲用途：

- 作为题库的描述信息
- 作为生成知识点的依据

### 4. 知识点管理功能

**触发条件**：题库有大纲后

操作方式：

- 点击"生成知识点"：AI 根据大纲自动生成
- 手动添加知识点
- 手动删除知识点

### 5. 题库管理功能增强

用户随时可以：

- 删除题库
- 重命名题库
- 修改大纲

### 6. 题目知识点生成时机变更

**现状**：题目导入时 AI 自动生成知识点
**目标**：题目知识点在题目详情页按需生成

**触发方式**：题目详情页点击「AI 生成解析」按钮

**「AI 生成解析」功能**：

一键生成以下内容：

- **答案**：题目的标准答案
- **解析**：详细的解题思路和步骤
- **知识点**：从所属题库的知识点列表中匹配关联（必须是题库已有的知识点）
- **提示**：智能提醒信息，帮助用户完善题库和知识体系

**提示内容示例**：

- 当题目涉及的知识点不在题库中时："此题涉及【xxx】知识点，建议在题库中添加"
- 当题库知识点覆盖不足时："建议补充以下知识点：【知识点 A】、【知识点 B】"
- 当题目难度较高时："此题为综合题，涉及多个知识点的交叉应用"
- 其他场景：根据题目特点给出针对性建议

**规则**：

- 导入题目时不再自动生成知识点
- 知识点只能从所属题库的已有知识点中选择
- 如果题库没有匹配的知识点，AI 不会自动创建，而是通过"提示"字段建议用户先在题库中添加相关知识点

### 边界情况处理

1. **空知识点题库**：

   - 如果题库没有任何知识点，用户点击"AI 生成解析"时：
     - 正常生成答案和解析
     - 提示："该题库暂无知识点，建议先【生成知识点】或【手动添加】"
     - 不强制要求必须有知识点才能保存答案和解析

2. **知识点删除**：

   - 删除题库知识点时，检查是否有题目关联该知识点
   - 如果有题目关联：
     - 显示警告："有 X 道题目关联此知识点，删除后将自动从题目中移除"
     - 用户确认后，级联删除题目中的关联关系
   - 如果没有题目关联：直接删除

3. **知识点重命名**：

   - 修改题库知识点名称时，自动同步更新所有关联题目的知识点显示
   - 保持 ID 不变，仅更新名称
   - 题目关联关系不受影响

4. **题库删除**：

   - 删除题库时，级联删除该题库的所有知识点
   - 该题库下的题目不会被删除，但 `topicId` 设为 `null`，知识点关联清空
   - 提示用户："删除题库后，相关题目将失去归属，但不会被删除"

5. **题库无匹配时的处理**：
   - 新增题目时，如果 AI 判断没有合适的题库：
     - 自动选择匹配度最高的题库（即使匹配度较低）
     - 显示强提示："此题目与当前题库匹配度较低，建议：【新增题库：AI 建议名称】"
     - 用户仍可选择继续保存到当前题库

---

## 数据模型变更（预估）

### ER 图

```
Topic (题库)
├── id
├── name (名称)
├── outline (大纲/描述) -- 新增字段
└── questions[] (题目列表)

TopicKnowledgePoint (题库知识点) -- 新增表
├── id
├── topicId (外键，关联 Topic.id)
├── name (知识点名称)
└── createdAt

Question (题目)
├── id
├── topicId (所属题库)
├── content (题目内容)
├── type (题型)
├── difficulty (难度)
├── source (来源)
├── answerId (外键，关联 Answer.id) -- 新增：保存答案和解析
├── knowledgePoints[] (知识点) -- 保留，通过 QuestionKnowledgePoint 关联表
└── ...其他字段

Answer (答案和解析) -- 现有表
├── id
├── questionId (外键，一对一关联 Question.id)
├── content (答案内容) -- 客观题保存选项 ID，主观题保存文本答案
├── explanation (解析) -- AI 生成或用户上传的解题思路
└── createdAt

QuestionKnowledgePoint (题目 - 知识点关联) -- 现有表
├── questionId (外键，关联 Question.id)
└── knowledgePointId (外键，关联 TopicKnowledgePoint.id)
```

**关系说明**：

- `Topic` 与 `TopicKnowledgePoint`：一对多关系
- `TopicKnowledgePoint` 与 `QuestionKnowledgePoint`：一对多关系
- `Question` 与 `QuestionKnowledgePoint`：一对多关系
- `Question` 与 `Answer`：一对一关系（通过 `answerId` 外键）
- 通过 `TopicKnowledgePoint` → `QuestionKnowledgePoint` → `Question` 实现题目对题库知识点的引用

**约束**：`Question.knowledgePoints ⊆ Topic.knowledgePoints`（题目知识点必须是题库知识点的子集）

### 字段说明

**Question 表新增字段**：
- `answerId` (uuid, foreign key → Answer.id, set null on delete)
  - 用于关联答案和解析
  - 可为空（题目可以暂时没有答案和解析）
  - 通过此外键实现一对一关系

**Answer 表字段**（现有表，保持不变）：
- `content` (text, nullable)
  - 客观题（选择题）：保存正确选项的 ID 列表（JSON 格式）
  - 主观题/填空题：保存标准答案文本
- `explanation` (text, nullable)
  - 详细的解题思路和步骤
  - 可由 AI 生成或用户上传

**AI 生成解析时**：
- 如果题目没有 `answerId`：创建新的 Answer 记录，并将 `answerId` 关联到题目
- 如果题目已有 `answerId`：更新对应的 Answer 记录

---

## 用户交互流程

### 流程 A：题库知识点管理

```
题库详情页
    │
    ├── 无大纲 ──> [手动添加大纲] 或 [AI 生成大纲]
    │
    └── 有大纲 ──> [生成知识点] / [手动添加] / [删除知识点]
```

### 流程 B：新增题目时的题库匹配

```
输入题目内容
    │
    ├── 匹配到合适题库 ──> 直接选择
    │
    └── 无合适题库 ──> 选择最相近的 + 显示建议提示
                       "建议新增题库：【AI 建议名称】"
```

### 流程 C：题目详情页生成解析

```
题目详情页
    │
    ├── 无答案/解析/知识点 ──> 显示 [AI 生成解析] 按钮
    │
    └── 点击 [AI 生成解析]
            │
            └── 生成内容：
                    │
                    ├── 答案：标准答案
                    ├── 解析：详细解题思路
                    ├── 知识点：从题库已有知识点中匹配
                    └── 提示：智能建议信息
                            │
                            ├── 题库有匹配知识点 ──> "此题考查【xxx】知识点"
                            ├── 题库无匹配知识点 ──> "建议在题库中添加【xxx】知识点"
                            └── 其他场景 ──> 根据题目特点给出针对性建议
```

---

## AI 模块目录结构

重构后将产生多个 AI 功能和 Prompt，按功能模块分割到不同目录，保持代码组织清晰：

```
lib/ai/
├── minimax.ts                    # AI 模型配置（保持不变）
├── types.ts                      # 共享类型定义
│
├── prompts/                      # Prompt 模板目录（集中管理）
│   ├── question-import.ts        # 题目导入 prompt（格式化 + 类型识别 + 题库匹配）
│   ├── outline-generate.ts       # 大纲生成 prompt
│   └── solution-generate.ts      # 解析生成 prompt（答案 + 解析 + 知识点匹配 + 提示）
│
├── question/                     # 题目相关 AI 功能
│   ├── importer.ts               # 题目导入（格式化 + 类型识别 + 题库匹配）
│   └── solution.ts               # 解析生成（答案 + 解析 + 知识点匹配 + 提示）
│
└── topic/                        # 题库相关 AI 功能
    └── outline.ts                # 大纲生成（大纲内容 + 知识点列表）
```

**Prompt 功能说明**：

| Prompt              | 输入                        | 输出                            |
| ------------------- | --------------------------- | ------------------------------- |
| `question-import`   | 原始题目文本 + 用户题库列表 | 格式化内容 + 题型 + 推荐题库    |
| `outline-generate`  | 题库名称                    | 大纲描述 + 知识点列表           |
| `solution-generate` | 题目内容 + 题库知识点列表   | 答案 + 解析 + 匹配知识点 + 提示 |

**设计原则**：

- **Prompt 集中管理**：所有 prompt 模板放在 `prompts/` 目录，便于维护和迭代
- **功能模块分离**：`question/` 和 `topic/` 按业务领域划分
- **一次调用完成**：相关联的生成任务合并到同一个 prompt，减少 API 调用
- **类型共享**：公共类型定义提取到 `types.ts`

**迁移说明**：

现有 `question-analyzer.ts` 将重构为：

- `prompts/question-import.ts` + `question/importer.ts`

---

## 涉及文件（预估）

- 数据库 Schema：`lib/db/schema.ts`
- AI 模块重构：`lib/ai/` 目录（按上述结构重组）
- 题库管理 UI：需新增/修改组件
- 题目详情页：`app/topics/[id]/questions/[questionId]/page.tsx`（新增"AI 生成解析"按钮）
- Agent 动作：`app/actions/agent.ts`（新增生成解析 action）

---

## 实施计划（按 Phase 分阶段）

### Phase 1：数据模型变更（P0 - 基础）

**目标**：完成数据库 Schema 变更

**任务**：

1. 修改 `lib/db/schema.ts`：
   - `Topic` 表新增 `outline` 字段（`text` 类型，可为空）
   - 新建 `topic_knowledge_points` 表：
     - `id` (uuid, primary key)
     - `topicId` (uuid, foreign key → Topic.id, cascade delete)
     - `name` (text, not null)
     - `createdAt` (timestamp, default now)
   - `Question` 表新增 `answerId` 字段（`uuid` 类型，可为空，外键 → Answer.id, set null on delete）
   - 保持现有 `question_knowledge_points` 关联表和 `answers` 表结构不变

**验收标准**：

- [ ] Schema 修改完成，类型检查通过
- [ ] 数据库表结构正确创建
- [ ] 外键约束和级联删除配置正确
- [ ] `Question.answerId` 字段正确关联到 `Answer.id`

---

### Phase 2：题库大纲管理（P0 - 后端 + 前端）

**目标**：支持题库大纲的查看、编辑和 AI 生成

**任务**：

1. **后端**：

   - `app/actions/topic.ts`：
     - 新增 `updateTopicOutline(topicId, outline)` Server Action
     - 新增 `generateTopicOutline(topicId)` Server Action（调用 AI）
   - `lib/ai/topic/outline.ts`：
     - 实现 `generateOutline(topicName: string)` 函数
     - Prompt 模板：`lib/ai/prompts/outline-generate.ts`

2. **前端**：
   - `app/topics/[id]/page.tsx`：
     - 新增大纲展示区域
     - 新增 `OutlineEditor` 组件（支持手动编辑）
     - 新增 [AI 生成大纲] 按钮
   - 添加加载状态和错误处理

**验收标准**：

- [ ] 题库详情页可显示大纲
- [ ] 支持手动编辑大纲并保存
- [ ] AI 生成大纲功能正常工作
- [ ] 有大纲后才能进行知识点操作

---

### Phase 3：知识点管理功能（P1 - 后端 + 前端）

**目标**：支持题库知识点的 CRUD 和 AI 生成

**任务**：

1. **后端**：

   - `app/actions/topic.ts`：
     - 新增 `generateKnowledgePoints(topicId)` Server Action
     - 新增 `addKnowledgePoint(topicId, name)` Server Action
     - 新增 `deleteKnowledgePoint(knowledgePointId)` Server Action
     - 新增 `getTopicKnowledgePoints(topicId)` 查询函数
   - `lib/ai/topic/outline.ts`：
     - 扩展 `generateKnowledgePoints(outline: string)` 函数

2. **前端**：
   - 新增 `KnowledgePointManager` 组件：
     - 知识点列表展示
     - 手动添加输入框
     - 删除按钮（带确认提示）
     - [AI 生成知识点] 按钮
   - 该组件应当是一个弹窗

**验收标准**：

- [ ] 知识点列表正确展示
- [ ] 支持手动添加知识点
- [ ] 支持删除知识点（带关联检查提示）
- [ ] AI 生成知识点功能正常
- [ ] 知识点数量限制：5-15 个

---

### Phase 4：题目解析生成（P1 - 核心功能）

**目标**：实现题目详情页的"AI 生成解析"功能

**任务**：

1. **后端**：
   - `app/actions/question.ts`：
     - 新增 `generateSolution(questionId)` Server Action
     - 逻辑：
       - 如果题目没有 `answerId`：创建新的 Answer 记录
       - 如果题目已有 `answerId`：更新对应的 Answer 记录
       - 保存 AI 生成的答案、解析、知识点
   - `lib/ai/question/solution.ts`：
     - 实现 `generateSolution(question, knowledgePoints)` 函数
     - Prompt 模板：`lib/ai/prompts/solution-generate.ts`
   - 修改 `app/actions/agent.ts`：
     - 移除题目导入时自动生成知识点的逻辑

2. **前端**：
   - `app/topics/[id]/questions/[questionId]/page.tsx`：
     - 新增 [AI 生成解析] 按钮（无答案/解析/知识点时显示）
     - 新增 `SolutionGenerator` 组件：
       - 展示答案、解析、匹配知识点、提示
       - 支持保存到题目
     - 添加加载状态和错误处理

**验收标准**：

- [ ] 按钮在正确条件下显示
- [ ] AI 生成答案、解析、知识点、提示
- [ ] 知识点只能从题库已有知识点中选择
- [ ] 提示内容符合规则（匹配成功/失败/难度等场景）
- [ ] 支持保存生成结果到题目

---

### Phase 5：题目导入优化（P1 - 智能匹配）

**目标**：优化新增题目流程，移除"新增题库"选项

**任务**：

1. **后端**：

   - `app/actions/agent.ts`：
     - 修改 `saveQuestionToCatalog` 逻辑
     - 移除"新增题库"选项
   - `lib/ai/question/importer.ts`：
     - 实现 `matchTopic(questionText, userTopics)` 函数
     - Prompt 模板：`lib/ai/prompts/question-import.ts`

2. **前端**：
   - 修改新增题目表单：
     - 移除"新增题库"选项
     - 题库选择器改为智能推荐 + 手动选择
     - 当匹配度低时显示强提示："建议新增题库：【AI 建议名称】"

**验收标准**：

- [ ] 新增题目时不再能直接创建题库
- [ ] 智能推荐题库功能正常
- [ ] 低匹配度时显示建议提示
- [ ] 用户仍可手动选择任意题库

---

### Phase 6：题库管理增强（P2 - 完善功能）

**目标**：完善题库的 CRUD 功能

**任务**：

1. **后端**：

   - `app/actions/topic.ts`：
     - 新增 `updateTopic(topicId, data)` Server Action（重命名、修改大纲）
     - 新增 `deleteTopic(topicId)` Server Action（带级联处理）

2. **前端**：
   - 题库列表页：
     - 新增重命名功能（弹窗编辑）
     - 新增删除功能（带二次确认和后果提示）
   - 题库详情页：
     - 支持修改大纲（Phase 2 已实现）

**验收标准**：

- [ ] 支持重命名题库
- [ ] 支持删除题库（带级联提示）
- [ ] 删除题库后，相关题目 topicId 设为 null
- [ ] 所有操作有适当的确认和提示

---

### 依赖关系

```
Phase 1 (数据模型)
    ↓
Phase 2 (大纲管理)
    ↓
Phase 3 (知识点管理)
    ↓
Phase 4 (解析生成) ←── Phase 5 (题目导入优化)
    ↓
Phase 6 (题库管理增强)
```

**说明**：

- Phase 1-3 必须按顺序执行（强依赖）
- Phase 4 依赖 Phase 3（需要知识点数据）
- Phase 5 可独立于 Phase 4 并行开发
- Phase 6 可在任意时间完成（独立功能）
