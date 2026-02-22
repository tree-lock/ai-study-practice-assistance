"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from "@mui/material";
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
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            暂无题库，请先创建。
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {topics.map((topic) => (
        <Card key={topic.id} className="border-none bg-white shadow-none">
          <CardContent>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap={2}
            >
              <Box>
                <Typography variant="h6" fontWeight="fontWeightBold">
                  {topic.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {topic.description || "暂无描述"}
                </Typography>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Button
                  component={Link}
                  href={`/dashboard/topics/${topic.id}`}
                  variant="outlined"
                  color="primary"
                >
                  进入题库
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={async () => {
                    if (confirm("确认删除该题库吗？")) {
                      await deleteTopic(topic.id);
                    }
                  }}
                >
                  删除
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
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
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Typography variant="h6">添加题库</Typography>

            <Box>
              <Typography
                variant="subtitle2"
                component="label"
                htmlFor="topic-name"
              >
                名称
              </Typography>
              <TextField
                id="topic-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                fullWidth
                margin="normal"
              />
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                component="label"
                htmlFor="topic-description"
              >
                描述
              </Typography>
              <TextField
                id="topic-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
                margin="normal"
              />
            </Box>

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "提交中..." : "创建题库"}
            </Button>

            {error ? (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            ) : null}
          </Box>
        </form>
      </CardContent>
    </Card>
  );
}
