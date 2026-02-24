import { AgentCommandCenter } from "@/components/agent-command-center";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-170px)] flex-col items-center justify-center gap-6 overflow-auto px-4 py-16">
      <h1 className="home-hero-title text-center text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        把题目变成可执行的
        <span className="text-primary"> 学习计划 </span>
      </h1>
      <p className="home-hero-subtitle text-center text-base text-muted-foreground sm:text-lg">
        上传题目，文字、图片或文档，系统会自动生成题库、编排与复习任务。
      </p>
      <AgentCommandCenter />
    </div>
  );
}
