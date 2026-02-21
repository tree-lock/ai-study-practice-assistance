"use client";

import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import Link from "next/link";
import { useState } from "react";
import { createTopic, deleteTopic } from "@/app/actions/topic";

interface Topic {
  id: string;
  name: string;
  description: string | null;
}

export function TopicList({ topics }: { topics: Topic[] }) {
  if (topics.length === 0) {
    return (
      <Card className="border-none bg-white shadow-none">
        <Text size="2" color="gray">
          暂无题库，请先创建。
        </Text>
      </Card>
    );
  }

  return (
    <Flex direction="column" gap="4">
      {topics.map((topic) => (
        <Card key={topic.id} className="border-none bg-white shadow-none">
          <Flex align="center" justify="between" gap="4">
            <Box>
              <Text as="p" size="3" weight="bold">
                {topic.name}
              </Text>
              <Text as="p" size="2" color="gray">
                {topic.description || "暂无描述"}
              </Text>
            </Box>
            <Flex align="center" gap="2">
              <Button asChild type="button" variant="soft" color="blue">
                <Link href={`/dashboard/topics/${topic.id}`}>进入题库</Link>
              </Button>
              <Button
                type="button"
                variant="soft"
                color="red"
                onClick={async () => {
                  if (confirm("确认删除该题库吗？")) {
                    await deleteTopic(topic.id);
                  }
                }}
              >
                删除
              </Button>
            </Flex>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}

export function TopicForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await createTopic({ name, description });

    if (result && "error" in result && result.error) {
      const message =
        typeof result.error === "string"
          ? result.error
          : "提交失败，请检查输入信息";
      setError(message);
      setIsSubmitting(false);
      return;
    }

    setName("");
    setDescription("");
    setIsSubmitting(false);
  };

  return (
    <Card className="border-none bg-white shadow-none">
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">
          <Heading size="4">添加题库</Heading>

          <Box>
            <Text as="label" htmlFor="topic-name" size="2" weight="medium">
              名称
            </Text>
            <Box mt="2">
              <TextField.Root
                id="topic-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Box>
          </Box>

          <Box>
            <Text
              as="label"
              htmlFor="topic-description"
              size="2"
              weight="medium"
            >
              描述
            </Text>
            <Box mt="2">
              <TextArea
                id="topic-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Box>
          </Box>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "提交中..." : "创建题库"}
          </Button>

          {error ? (
            <Text size="2" color="red">
              {error}
            </Text>
          ) : null}
        </Flex>
      </form>
    </Card>
  );
}
