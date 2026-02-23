"use client";

import { Plus, Trash2, Wand2, X } from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  addKnowledgePoint,
  deleteKnowledgePoint,
  generateKnowledgePoints,
  getKnowledgePointLinkedCount,
  getTopicKnowledgePoints,
  type KnowledgePoint,
} from "@/app/actions/topic";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

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
    setError(null);
    try {
      const result = await getTopicKnowledgePoints(topicId);
      setKnowledgePoints(result);
    } catch (err) {
      console.error("加载知识点失败:", err);
      setError("加载知识点失败");
    } finally {
      setIsLoading(false);
    }
  }, [topicId]);

  useEffect(() => {
    if (!isOpen) return;

    let ignored = false;
    setError(null);

    async function load() {
      setIsLoading(true);
      try {
        const result = await getTopicKnowledgePoints(topicId);
        if (!ignored) {
          setKnowledgePoints(result);
          setError(null);
        }
      } catch (err) {
        if (!ignored) {
          console.error("加载知识点失败:", err);
          setError("加载知识点失败");
        }
      } finally {
        if (!ignored) {
          setIsLoading(false);
        }
      }
    }
    load();

    return () => {
      ignored = true;
    };
  }, [isOpen, topicId]);

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
      <Button variant="secondary" size="sm" onClick={() => setIsOpen(true)}>
        知识点管理
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[480px]" showClose>
          <DialogHeader>
            <DialogTitle>知识点管理</DialogTitle>
            <DialogDescription>
              管理题库的知识点列表，题目只能从这些知识点中选择
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            {!hasOutline && (
              <div className="rounded-md bg-amber-50 p-3">
                <p className="text-sm text-amber-800">
                  请先添加题库大纲，才能使用 AI 生成知识点
                </p>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="size-8" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {knowledgePoints.length === 0 ? (
                    <p className="text-sm text-muted-foreground">暂无知识点</p>
                  ) : (
                    knowledgePoints.map((kp) => (
                      <Badge
                        key={kp.id}
                        variant="secondary"
                        className="group flex items-center gap-1"
                      >
                        {kp.name}
                        <button
                          type="button"
                          onClick={() => handleDelete(kp.id, kp.name)}
                          className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                          aria-label={`删除 ${kp.name}`}
                          disabled={isPending}
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    placeholder="输入知识点名称"
                    value={newName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNewName(e.target.value)
                    }
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAdd();
                      }
                    }}
                    disabled={isPending || isGenerating}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={handleAdd}
                    disabled={isPending || isGenerating || !newName.trim()}
                    aria-label="添加知识点"
                  >
                    {isPending ? (
                      <Spinner className="size-4" />
                    ) : (
                      <Plus className="size-4" />
                    )}
                  </Button>
                </div>

                {error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : null}

                <p className="text-xs text-muted-foreground">
                  知识点数量：{knowledgePoints.length}（建议 5-15 个）
                </p>
              </>
            )}
          </div>

          <DialogFooter className="mt-4 justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerate}
              disabled={!hasOutline || isPending || isGenerating}
            >
              {isGenerating ? (
                <Spinner className="size-4" />
              ) : (
                <Wand2 className="size-4" />
              )}
              AI 生成
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={(open: boolean) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除知识点</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.linkedCount && deleteConfirm.linkedCount > 0 ? (
                <>
                  知识点「{deleteConfirm?.name}
                  」已被 {deleteConfirm?.linkedCount}{" "}
                  道题目关联，删除后将自动从这些题目中移除关联关系。
                </>
              ) : (
                <>确定要删除知识点「{deleteConfirm?.name}」吗？</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 gap-3">
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline">
                取消
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
              >
                <Trash2 className="size-4" />
                删除
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
