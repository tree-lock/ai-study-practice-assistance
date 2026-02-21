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
    <div className="leading-[1.65]">
      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
        {questionMarkdown}
      </ReactMarkdown>
    </div>
  );
});
