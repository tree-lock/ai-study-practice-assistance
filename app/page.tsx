import { Box, Typography } from "@mui/material";
import { AgentCommandCenter } from "@/components/agent-command-center";

export default function Home() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={3}
      className="min-h-[calc(100vh-170px)] px-4 overflow-auto"
    >
      <Typography
        variant="h2"
        align="center"
        className="home-hero-title"
        fontWeight="fontWeightBold"
      >
        把题目变成可执行的
        <Box component="span" color="primary.main">
          {" "}
          学习计划{" "}
        </Box>
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        align="center"
        className="home-hero-subtitle"
      >
        上传题目，文字、图片或文档，系统会自动生成题库、编排与复习任务。
      </Typography>
      <AgentCommandCenter />
    </Box>
  );
}
