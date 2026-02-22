"use client";

import { Add, AutoFixHigh, Close, Delete } from "@mui/icons-material";
import {
  Alert,
  Badge,
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
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  addKnowledgePoint,
  deleteKnowledgePoint,
  generateKnowledgePoints,
  getKnowledgePointLinkedCount,
  getTopicKnowledgePoints,
  type KnowledgePoint,
} from "@/app/actions/topic";

type KnowledgePointManagerProps = {
  topicId: string;
  hasOutline: boolean;
};

export function KnowledgePointManager({
  topicId,
  hasOutline,
}: KnowledgePointManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string;
    name: string;
    linkedCount: number;
  } | null>(null);

  const loadKnowledgePoints = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getTopicKnowledgePoints(topicId);
      setKnowledgePoints(result);
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    if (isOpen) {
      loadKnowledgePoints();
      setError(null);
    }
  }, [isOpen, loadKnowledgePoints]);

  const handleAdd = () => {
    if (!newName.trim()) {
      setError("知识点名称不能为空");
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await addKnowledgePoint(topicId, newName.trim());
      if (result.error) {
        setError(result.error);
      } else if (result.knowledgePoint) {
        setKnowledgePoints((prev) => [...prev, result.knowledgePoint]);
        setNewName("");
      }
    });
  };

  const handleDelete = async (id: string, name: string) => {
    const linkedCount = await getKnowledgePointLinkedCount(id);
    setDeleteConfirm({ id, name, linkedCount });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    startTransition(async () => {
      const result = await deleteKnowledgePoint(deleteConfirm.id);
      if (result.error) {
        setError(result.error);
      } else {
        setKnowledgePoints((prev) =>
          prev.filter((kp) => kp.id !== deleteConfirm.id),
        );
      }
      setDeleteConfirm(null);
    });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateKnowledgePoints(topicId);
      if (result.error) {
        setError(result.error);
      } else {
        await loadKnowledgePoints();
      }
    } catch {
      setError("生成失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Button variant="outlined" size="small" onClick={() => setIsOpen(true)}>
        知识点管理
      </Button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>知识点管理</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            管理题库的知识点列表，题目只能从这些知识点中选择
          </Typography>

          <div className="mt-4 flex flex-col gap-4">
            {!hasOutline && (
              <Alert severity="warning" sx={{ fontSize: "0.875rem" }}>
                请先添加题库大纲，才能使用 AI 生成知识点
              </Alert>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <CircularProgress size={24} />
              </div>
            ) : (
              <>
                <Box className="flex flex-wrap gap-1">
                  {knowledgePoints.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      暂无知识点
                    </Typography>
                  ) : (
                    knowledgePoints.map((kp) => (
                      <Badge
                        key={kp.id}
                        color="primary"
                        className="group"
                        sx={{ cursor: "pointer" }}
                      >
                        {kp.name}
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(kp.id, kp.name)}
                          className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                          disabled={isPending}
                        >
                          <Close sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Badge>
                    ))
                  )}
                </Box>

                <Box className="flex items-center gap-2">
                  <TextField
                    placeholder="输入知识点名称"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdd();
                      }
                    }}
                    disabled={isPending || isGenerating}
                    fullWidth
                    size="small"
                  />
                  <IconButton
                    onClick={handleAdd}
                    disabled={isPending || isGenerating || !newName.trim()}
                    aria-label="添加知识点"
                    size="small"
                  >
                    {isPending ? <CircularProgress size={20} /> : <Add />}
                  </IconButton>
                </Box>

                {error && (
                  <Typography variant="caption" color="error">
                    {error}
                  </Typography>
                )}

                <Typography variant="caption" color="text.secondary">
                  知识点数量：{knowledgePoints.length}（建议 5-15 个）
                </Typography>
              </>
            )}
          </div>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleGenerate}
            disabled={!hasOutline || isPending || isGenerating}
            startIcon={
              isGenerating ? <CircularProgress size={20} /> : <AutoFixHigh />
            }
          >
            AI 生成
          </Button>
          <Button
            onClick={() => setIsOpen(false)}
            variant="outlined"
            color="inherit"
          >
            关闭
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>确认删除知识点</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {deleteConfirm?.linkedCount && deleteConfirm.linkedCount > 0 ? (
              <>
                知识点「{deleteConfirm?.name}」已被 {deleteConfirm?.linkedCount}{" "}
                道题目关联，删除后将自动从这些题目中移除关联关系。
              </>
            ) : (
              <>确定要删除知识点「{deleteConfirm?.name}」吗？</>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteConfirm(null)}
            variant="outlined"
            color="inherit"
          >
            取消
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            startIcon={<Delete />}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
