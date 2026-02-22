import { Add, Search } from "@mui/icons-material";
import { Box, Button, TextField, Typography } from "@mui/material";
import Link from "next/link";
import { KnowledgePointManager } from "./knowledge-point-manager";
import { OutlineEditor } from "./outline-editor";

type TopicHeaderProps = {
  topicId: string;
  name: string;
  description: string | null;
  outline: string | null;
};

export function TopicHeader({
  topicId,
  name,
  description,
  outline,
}: TopicHeaderProps) {
  return (
    <Box className="flex flex-col gap-4 pb-6">
      <Box className="flex flex-col gap-1">
        <Typography variant="h4" fontWeight="fontWeightBold">
          {name}
        </Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        ) : null}
      </Box>

      <Box className="flex items-start gap-4">
        <Box className="flex-1">
          <OutlineEditor topicId={topicId} outline={outline} />
        </Box>
        <KnowledgePointManager topicId={topicId} hasOutline={!!outline} />
      </Box>

      <Box className="flex items-center justify-between gap-4">
        <TextField
          placeholder="搜索题目"
          variant="outlined"
          size="small"
          sx={{ width: 360 }}
          InputProps={{
            startAdornment: <Search color="action" />,
          }}
        />
        <Button
          component={Link}
          href="/"
          variant="contained"
          startIcon={<Add />}
        >
          创建
        </Button>
      </Box>
    </Box>
  );
}
