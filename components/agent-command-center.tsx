"use client";

import { Badge, Card, Flex, Text, TextArea } from "@radix-ui/themes";
import { useState } from "react";
import { type AgentPlan, runAgentPlan } from "@/app/actions/agent";

type AgentCommandCenterProps = {
  isLoggedIn: boolean;
};

export function AgentCommandCenter({ isLoggedIn }: AgentCommandCenterProps) {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<AgentPlan | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isLoggedIn) {
      setError("请先登录后再使用 Agent");
      return;
    }

    setError("");
    const result = await runAgentPlan({ prompt });

    if (!result.success) {
      setPlan(null);
      setError(result.error);
      return;
    }

    setPlan(result.data);
  }

  return (
    <Flex direction="column" gap="5" style={{ width: "100%", maxWidth: 760 }}>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="3">
          <TextArea
            placeholder="上传题目，文字、图片或文档"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            style={{ minHeight: 120 }}
          />
          {error ? (
            <Text size="2" color="red">
              {error}
            </Text>
          ) : null}
        </Flex>
      </form>

      {plan ? (
        <Card style={{ width: "100%", border: "none", boxShadow: "none" }}>
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="1">
              <Text size="3" weight="bold">
                Agent 生成计划
              </Text>
              <Text size="2" color="gray">
                总时长：{plan.totalMinutes} 分钟
              </Text>
            </Flex>

            <Flex gap="2" wrap="wrap">
              {plan.focusTopics.map((topic) => (
                <Badge key={topic} color="blue">
                  {topic}
                </Badge>
              ))}
            </Flex>

            <Flex direction="column" gap="3">
              {plan.steps.map((step) => (
                <Card
                  key={`${step.title}-${step.minutes}`}
                  style={{
                    border: "none",
                    boxShadow: "none",
                    background: "#f8f8fa",
                  }}
                >
                  <Flex justify="between" align="center">
                    <Flex direction="column" gap="1">
                      <Text size="2" weight="bold">
                        {step.title}
                      </Text>
                      <Text size="2" color="gray">
                        {step.detail}
                      </Text>
                    </Flex>
                    <Badge color="gray">{step.minutes} 分钟</Badge>
                  </Flex>
                </Card>
              ))}
            </Flex>
          </Flex>
        </Card>
      ) : null}
    </Flex>
  );
}
