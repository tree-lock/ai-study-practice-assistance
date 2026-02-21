"use client";

import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Select,
  Text,
  TextArea,
  TextField,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createQuestionsInTopic,
  type TopicQuestion,
} from "@/app/actions/question";

type TopicQuestionsProps = {
  topicId: string;
  initialQuestions: Array<TopicQuestion>;
};

type QuestionType = "choice" | "blank" | "subjective";

const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  choice: "选择题",
  blank: "填空题",
  subjective: "主观题",
};

export function TopicQuestions({
  topicId,
  initialQuestions,
}: TopicQuestionsProps) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [source, setSource] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("subjective");
  const [files, setFiles] = useState<Array<string>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const result = await createQuestionsInTopic({
      topicId,
      content,
      source,
      type: questionType,
      fileNames: files,
    });

    if (!result.success) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    setSuccess(`已创建 ${result.count} 道题目`);
    setContent("");
    setSource("");
    setFiles([]);
    setIsSubmitting(false);
    router.refresh();
  }

  return (
    <Flex direction="column" gap="4">
      <Card className="border-none bg-white shadow-none">
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Heading size="4">上传题目到当前题库</Heading>

            <Box>
              <Text as="label" size="2" weight="medium">
                题目文本（可选）
              </Text>
              <Box mt="2">
                <TextArea
                  placeholder="可直接粘贴题干；如果只上传图片/PDF，这里可以留空"
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                />
              </Box>
            </Box>

            <Flex gap="4" wrap="wrap">
              <Box className="min-w-[180px]">
                <Text as="label" size="2" weight="medium">
                  题目类型
                </Text>
                <Box mt="2">
                  <Select.Root
                    value={questionType}
                    onValueChange={(value) =>
                      setQuestionType(value as QuestionType)
                    }
                  >
                    <Select.Trigger />
                    <Select.Content>
                      <Select.Item value="choice">选择题</Select.Item>
                      <Select.Item value="blank">填空题</Select.Item>
                      <Select.Item value="subjective">主观题</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Box>
              </Box>

              <Box className="min-w-[240px] flex-1">
                <Text as="label" size="2" weight="medium">
                  题目来源（可选）
                </Text>
                <Box mt="2">
                  <TextField.Root
                    placeholder="例如：2025 考研数学一"
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                  />
                </Box>
              </Box>
            </Flex>

            <Box>
              <Text as="label" size="2" weight="medium">
                上传图片/PDF（可多选）
              </Text>
              <Box mt="2">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={(event) => {
                    const selected = Array.from(event.target.files ?? []).map(
                      (file) => file.name,
                    );
                    setFiles(selected);
                  }}
                />
              </Box>
              {files.length > 0 ? (
                <Flex gap="2" wrap="wrap" mt="2">
                  {files.map((name) => (
                    <Badge key={name} color="gray">
                      {name}
                    </Badge>
                  ))}
                </Flex>
              ) : null}
            </Box>

            <Flex align="center" justify="between">
              <Text size="1" color="gray">
                当前版本先落库题目和文件名占位，下一步可接入 OCR/PDF
                解析流水线。
              </Text>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "上传中..." : "上传题目"}
              </Button>
            </Flex>

            {error ? (
              <Text size="2" color="red">
                {error}
              </Text>
            ) : null}
            {success ? (
              <Text size="2" color="green">
                {success}
              </Text>
            ) : null}
          </Flex>
        </form>
      </Card>

      <Card className="border-none bg-white shadow-none">
        <Flex direction="column" gap="3">
          <Heading size="4">本题库题目</Heading>
          {initialQuestions.length === 0 ? (
            <Text size="2" color="gray">
              还没有题目，先上传第一道题吧。
            </Text>
          ) : (
            <Flex direction="column" gap="2">
              {initialQuestions.map((question) => (
                <Card
                  key={question.id}
                  className="border-none bg-[#f7f7f8] shadow-none"
                >
                  <Flex direction="column" gap="2">
                    <Flex align="center" gap="2">
                      <Badge color="blue">
                        {QUESTION_TYPE_LABEL[question.type]}
                      </Badge>
                      {question.source ? (
                        <Badge color="gray">{question.source}</Badge>
                      ) : null}
                    </Flex>
                    <Text size="2">{question.content}</Text>
                  </Flex>
                </Card>
              ))}
            </Flex>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}
