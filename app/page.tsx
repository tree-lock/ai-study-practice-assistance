import { Flex, Heading, Text } from "@radix-ui/themes";
import { AgentCommandCenter } from "@/components/agent-command-center";

export default function Home() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="6"
      className="min-h-[calc(100vh-170px)] px-4 overflow-auto"
    >
      <Heading size="9" align="center" className="home-hero-title">
        把题目变成可执行的
        <Text color="blue"> 学习计划 </Text>
      </Heading>
      <Text size="4" color="gray" align="center" className="home-hero-subtitle">
        上传题目，文字、图片或文档，系统会自动生成题库、编排与复习任务。
      </Text>
      <AgentCommandCenter />
    </Flex>
  );
}
