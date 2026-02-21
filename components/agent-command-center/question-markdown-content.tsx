import { memo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type QuestionMarkdownContentProps = {
  questionMarkdown: string;
};

export const QuestionMarkdownContent = memo(function QuestionMarkdownContent({
  questionMarkdown,
}: QuestionMarkdownContentProps) {
  return (
    <div className="question-markdown leading-[1.65] [&>p]:mb-3 [&>p:last-child]:mb-0">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {questionMarkdown}
      </ReactMarkdown>
    </div>
  );
});
