import { MINIMAX_MODEL, minimax } from "./minimax";

export const QUESTION_TYPES = [
  "choice",
  "blank",
  "subjective",
  "application",
  "proof",
  "comprehensive",
] as const;

export type QuestionType = (typeof QUESTION_TYPES)[number];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  choice: "选择题",
  blank: "填空题",
  subjective: "主观题",
  application: "应用题",
  proof: "证明题",
  comprehensive: "综合题",
};

export type CatalogRecommendation = {
  action: "use-existing" | "create-new";
  topicId?: string;
  topicName: string;
  reason: string;
};

export type QuestionAnalysisResult = {
  formattedContent: string;
  questionType: QuestionType;
  questionTypeLabel: string;
  knowledgePoints: string[];
  catalogRecommendation: CatalogRecommendation;
};

export type ExistingTopic = {
  id: string;
  name: string;
};

function buildSystemPrompt(existingTopics: ExistingTopic[]): string {
  const topicListStr =
    existingTopics.length > 0
      ? existingTopics.map((t) => `- ID: ${t.id}, 名称: ${t.name}`).join("\n")
      : "（用户暂无题库）";

  return `你是一个智能题目分析助手。你的任务是分析用户输入的题目，并返回结构化的分析结果。

## 你需要完成的任务

1. **格式化题目**：将题目转换为标准的 Markdown 格式
2. **识别题目类型**：判断题目属于以下哪种类型
   - choice: 选择题（有明确的选项 A、B、C、D 等）
   - blank: 填空题（有 ___ 或需要填写答案的空格）
   - subjective: 主观题（需要论述或简答）
   - application: 应用题（需要通过计算解决实际问题）
   - proof: 证明题（需要证明某个数学命题）
   - comprehensive: 综合题（涉及多个知识点或多种题型的组合）
3. **提取知识点**：列出这道题涉及的核心知识点（2-4个，尽量简短）
4. **推荐存放目录**：根据题目的知识点，推荐存放到哪个题库

## 格式化规则

### 通用规则
- 删除题目前的科目名称（如"高等数学"、"线性代数"等）
- 删除题目前的题号（如"162"、"第3题"等）
- 删除题目后的"答题区"、图片链接等无关内容
- 数学公式使用 LaTeX 语法：行内公式用 $...$，行间公式用 $$...$$
- 数学符号前后加适当空格，提高可读性

### 选择题格式
- **题目描述加粗**
- 选项使用全角括号并加粗：**（A）**、**（B）**、**（C）**、**（D）**
- 每个选项独占一个段落（用空行分隔）

### 填空题格式
- 用下划线 __________ 表示填空位置（10个下划线）

## 示例

### 输入（原始题目）
\`\`\`
高等数学
162 设函数 $f(x)$ 在 $(-\\infty, +\\infty)$ 上有定义，则下述命题中正确的是
（A）若 $f(x)$ 在 $(-\\infty , + \\infty)$ 上可导且单调增加，则对一切 $x\\in (-\\infty , + \\infty)$ ，都有 $f^{\\prime}(x) > 0$ 
(B) 若 $f(x)$ 在点 $x_0$ 处取得极值，则 $f'(x_0) = 0$ 
(C) 若 $f^{\\prime \\prime}(x_0) = 0$ ，则 $(x_0, f(x_0))$ 是曲线 y = f(x)$ 的拐点坐标.
(D) 若 $f^{\\prime}(x_0) = 0, f^{\\prime \\prime}(x_0) = 0, f^{\\prime \\prime \\prime}(x_0) \\neq 0$ ，则 $x_0$ 一定不是 $f(x)$ 的极值点.
答题区
![image](https://example.com/image.jpg)
\`\`\`

### 输出（格式化后）
\`\`\`markdown
**设函数 $f(x)$ 在 $(-\\infty, +\\infty)$ 上有定义，则下述命题中正确的是**

**（A）** 若 $f(x)$ 在 $(-\\infty, +\\infty)$ 上可导且单调增加，则对一切 $x \\in (-\\infty, +\\infty)$，都有 $f'(x) > 0$

**（B）** 若 $f(x)$ 在点 $x_0$ 处取得极值，则 $f'(x_0) = 0$

**（C）** 若 $f''(x_0) = 0$，则 $(x_0, f(x_0))$ 是曲线 $y = f(x)$ 的拐点坐标

**（D）** 若 $f'(x_0) = 0$，$f''(x_0) = 0$，$f'''(x_0) \\neq 0$，则 $x_0$ 一定不是 $f(x)$ 的极值点
\`\`\`

### 对应的 JSON 输出
\`\`\`json
{
  "formattedContent": "**设函数 $f(x)$ 在 $(-\\\\infty, +\\\\infty)$ 上有定义，则下述命题中正确的是**\\n\\n**（A）** 若 $f(x)$ 在 $(-\\\\infty, +\\\\infty)$ 上可导且单调增加，则对一切 $x \\\\in (-\\\\infty, +\\\\infty)$，都有 $f'(x) > 0$\\n\\n**（B）** 若 $f(x)$ 在点 $x_0$ 处取得极值，则 $f'(x_0) = 0$\\n\\n**（C）** 若 $f''(x_0) = 0$，则 $(x_0, f(x_0))$ 是曲线 $y = f(x)$ 的拐点坐标\\n\\n**（D）** 若 $f'(x_0) = 0$，$f''(x_0) = 0$，$f'''(x_0) \\\\neq 0$，则 $x_0$ 一定不是 $f(x)$ 的极值点",
  "questionType": "choice",
  "questionTypeLabel": "选择题",
  "knowledgePoints": ["导数", "极值", "拐点"],
  "catalogRecommendation": {
    "action": "create-new",
    "topicName": "高等数学-导数应用",
    "reason": "题目涉及导数的多个应用场景，建议创建专门的导数应用题库"
  }
}
\`\`\`

## 用户现有的题库列表

${topicListStr}

## 输出格式要求

你必须以纯 JSON 格式返回，不要包含任何其他文字。JSON 结构如下：

{
  "formattedContent": "格式化后的题目内容（Markdown + LaTeX）",
  "questionType": "choice|blank|subjective|application|proof|comprehensive",
  "questionTypeLabel": "中文类型名称",
  "knowledgePoints": ["简短知识点1", "简短知识点2", ...],
  "catalogRecommendation": {
    "action": "use-existing 或 create-new",
    "topicId": "如果推荐已有题库，填写题库ID；否则不填",
    "topicName": "题库名称",
    "reason": "推荐理由（一句话）"
  }
}

## 注意事项

### 题库推荐策略（重要）
- **优先使用已有题库**：只要用户现有的题库中有任何一个与题目学科或知识领域相关，就推荐使用该题库
- **宽松匹配原则**：例如数学题可以放入"高等数学"、"数学练习"、"考研数学"等任何数学相关题库
- **仅在完全不匹配时新建**：只有当用户的所有题库都与题目学科完全无关时（如只有英语题库却要存数学题），才推荐新建题库

### 新建题库命名规则
新建题库时，必须遵循用户已有题库的命名风格：
- 已有题库是**学科名称**（如"高等数学"、"线性代数"）→ 新题库也用学科名称（如"概率论与数理统计"、"概率论"）
- 已有题库是**考试导向**（如"考研数学一"、"考研英语一"）→ 新题库也用考试导向（如"考研政治"）
- 已有题库是**书名/资料名**（如"数学基础过关660题"）→ 新题库用宽泛的学科名称（如"英语题库"）
- 用户没有任何题库 → 使用简洁的学科名称（如"高等数学"、"英语"）

### 知识点提取规则（必须严格遵守）
- **极简原则**：知识点必须是最核心的 2-3 个字，绝对不能超过 4 个字
- **去除所有修饰词**：不要加"左/右/的计算/的应用/的性质/的必要条件"等任何修饰
- **拆分组合概念**：将"A与B"拆分为独立的知识点
- **不要画蛇添足**：只提取题目的核心知识点，不要添加显而易见或边缘相关的知识点
  - ❌ ["数列", "单调性", "最大值"] → "最大值"是冗余的，应删除
  - ✅ ["数列", "单调性"]
- **转换示例**：
  - ["导数与单调性", "极值的必要条件", "拐点判定", "高阶导数"] → ["导数", "极值", "拐点"]
  - ["数列极限", "函数单调性"] → ["数列", "极限", "单调性"]
- **错误示例**：❌ 右导数、左极限、定积分的计算、极值的判定、拐点的性质
- **正确示例**：✅ 导数、极限、积分、极值、拐点、连续、级数、矩阵、行列式、单调性、数列
- **数量**：1-3 个知识点（宁少勿多）`;
}

export async function analyzeQuestion(
  rawContent: string,
  existingTopics: ExistingTopic[],
): Promise<QuestionAnalysisResult> {
  const systemPrompt = buildSystemPrompt(existingTopics);

  const message = await minimax.messages.create({
    model: MINIMAX_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `请分析以下题目：\n\n${rawContent}`,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("AI 未返回有效的文本响应");
  }

  const responseText = textBlock.text.trim();

  let jsonStr = responseText;
  const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const parsed = JSON.parse(jsonStr) as QuestionAnalysisResult;

  if (!QUESTION_TYPES.includes(parsed.questionType)) {
    parsed.questionType = "subjective";
  }
  parsed.questionTypeLabel =
    QUESTION_TYPE_LABELS[parsed.questionType] || "主观题";

  return parsed;
}
