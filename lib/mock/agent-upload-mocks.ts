export type UploadMockInput = {
  sourceLabel: string;
  sourceType: "image" | "text" | "document";
};

export type UploadMockOutput = {
  questionMarkdown: string;
  description: string;
  knowledgeTags: Array<string>;
  recommendedCatalog: Array<string>;
};

export type UploadMockCase = {
  id: string;
  input: UploadMockInput;
  output: UploadMockOutput;
};

const uploadMockCases: Array<UploadMockCase> = [
  {
    id: "calculus-limit",
    input: { sourceLabel: "高数极限题-截图", sourceType: "image" },
    output: {
      questionMarkdown: String.raw`已知函数 $f(x)=\dfrac{\sin x}{x}$，求极限：

$$
\lim_{x \to 0} \frac{\sin x}{x}
$$

并说明该极限在求导与积分中常见的使用场景。`,
      description: "极限基础题，占位数据。",
      knowledgeTags: ["高等数学", "极限", "三角函数"],
      recommendedCatalog: ["高数/极限/基本极限"],
    },
  },
  {
    id: "calculus-user-example",
    input: { sourceLabel: "用户示例题-文字", sourceType: "text" },
    output: {
      questionMarkdown: String.raw`求该式的值 $\lim_{n \to \infty} \frac{1}{n^2} \left( \sqrt{n^2+1^2} + \sqrt{n^2+2^2} + \dots + \sqrt{n^2+n^2} \right) =$`,
      description: "定积分思想与极限求和转换题，占位数据。",
      knowledgeTags: ["高等数学", "极限", "数列极限"],
      recommendedCatalog: ["高数/极限/数列极限与求和"],
    },
  },
  {
    id: "linear-algebra-matrix",
    input: { sourceLabel: "线代矩阵题-文档", sourceType: "document" },
    output: {
      questionMarkdown: String.raw`设矩阵

$$
A=\begin{bmatrix}1 & 2\\0 & 1\end{bmatrix}
$$

求 $A^n$ 的表达式，并证明你的结论。`,
      description: "矩阵幂与归纳法题，占位数据。",
      knowledgeTags: ["线性代数", "矩阵", "数学归纳法"],
      recommendedCatalog: ["线代/矩阵/矩阵幂"],
    },
  },
  {
    id: "probability-bayes",
    input: { sourceLabel: "概率论贝叶斯题-文字", sourceType: "text" },
    output: {
      questionMarkdown: String.raw`已知事件 $A$ 与 $B$ 满足 $P(B)>0$，请写出贝叶斯公式并计算：

$$
P(A \mid B)=\frac{P(B \mid A)P(A)}{P(B)}
$$

若 $P(A)=0.3,\ P(B\mid A)=0.8,\ P(B)=0.5$，求 $P(A\mid B)$。`,
      description: "条件概率计算题，占位数据。",
      knowledgeTags: ["概率论", "条件概率", "贝叶斯公式"],
      recommendedCatalog: ["概率论/条件概率/贝叶斯"],
    },
  },
  {
    id: "data-structure-tree",
    input: { sourceLabel: "数据结构二叉树题-截图", sourceType: "image" },
    output: {
      questionMarkdown: `给定一棵二叉树，请完成：

1. 写出前序遍历序列；
2. 写出中序遍历序列；
3. 说明如何根据前序和中序唯一重建二叉树。`,
      description: "二叉树遍历与重建题，占位数据。",
      knowledgeTags: ["数据结构", "二叉树", "遍历"],
      recommendedCatalog: ["数据结构/树/遍历与重建"],
    },
  },
];

let mockCaseCursor = 0;

export function getNextUploadMock(): UploadMockCase {
  const target = uploadMockCases[mockCaseCursor % uploadMockCases.length];
  mockCaseCursor = (mockCaseCursor + 1) % uploadMockCases.length;
  return target;
}

export function getUploadMocks(): Array<UploadMockCase> {
  return uploadMockCases;
}
