"use client";

import { AutoFixHigh, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useState, useTransition } from "react";
import { generateTopicOutline, updateTopicOutline } from "@/app/actions/topic";
import { updateTopicOutlineCache } from "@/lib/hooks/use-topic-data";

type OutlineEditorProps = {
  topicId: string;
  outline: string | null;
};

export function OutlineEditor({ topicId, outline }: OutlineEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editedOutline, setEditedOutline] = useState(outline ?? "");
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!editedOutline.trim()) {
      setError("大纲内容不能为空");
      return;
    }

    startTransition(async () => {
      const result = await updateTopicOutline(topicId, editedOutline.trim());
      if (result.error) {
        const errMsg =
          typeof result.error === "string"
            ? result.error
            : "更新失败，请稍后重试";
        setError(errMsg);
      } else {
        updateTopicOutlineCache(topicId, editedOutline.trim());
        setIsOpen(false);
      }
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateTopicOutline(topicId);
      if (result.error) {
        setError(result.error);
      } else if (result.outline) {
        setEditedOutline(result.outline);
        updateTopicOutlineCache(topicId, result.outline);
      }
    } catch {
      setError("生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Box className="flex flex-col gap-2">
      {outline ? (
        <Box display="flex" alignItems="start" gap={1}>
          <Typography variant="body2" color="text.secondary" className="flex-1">
            {outline}
          </Typography>
          <div className="p-px">
            <IconButton
              color="inherit"
              onClick={() => setIsOpen(true)}
              aria-label="编辑大纲"
              size="small"
            >
              <Edit />
            </IconButton>
          </div>
        </Box>
      ) : (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body2" color="text.secondary">
            暂无大纲
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setIsOpen(true)}
            startIcon={<Edit />}
          >
            添加大纲
          </Button>
        </Box>
      )}

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>编辑题库大纲</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            大纲是对题库内容的描述，用于生成知识点列表
          </Typography>

          <Box className="mt-4 flex flex-col gap-2">
            <TextField
              placeholder="请输入题库大纲..."
              value={editedOutline}
              onChange={(e) => setEditedOutline(e.target.value)}
              multiline
              rows={6}
              disabled={isPending || isGenerating}
              fullWidth
            />

            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleGenerate}
            disabled={isPending || isGenerating}
            startIcon={
              isGenerating ? <CircularProgress size={20} /> : <AutoFixHigh />
            }
          >
            AI 生成
          </Button>

          <Box display="flex" gap={1}>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outlined"
              color="inherit"
              disabled={isPending}
            >
              取消
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={isPending || isGenerating}
            >
              {isPending ? <CircularProgress size={20} /> : null}
              保存
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
