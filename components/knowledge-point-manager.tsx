"use client";

import {
  Cross2Icon,
  MagicWandIcon,
  PlusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  AlertDialog,
  Badge,
  Button,
  Dialog,
  IconButton,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
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
      <Button variant="soft" size="1" onClick={() => setIsOpen(true)}>
        知识点管理
      </Button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Content maxWidth="480px">
          <Dialog.Title>知识点管理</Dialog.Title>
          <Dialog.Description size="2" color="gray">
            管理题库的知识点列表，题目只能从这些知识点中选择
          </Dialog.Description>

          <div className="mt-4 flex flex-col gap-4">
            {!hasOutline && (
              <div className="rounded-md bg-amber-50 p-3">
                <Text size="2" color="amber">
                  请先添加题库大纲，才能使用 AI 生成知识点
                </Text>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner size="2" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {knowledgePoints.length === 0 ? (
                    <Text size="2" color="gray">
                      暂无知识点
                    </Text>
                  ) : (
                    knowledgePoints.map((kp) => (
                      <Badge
                        key={kp.id}
                        size="2"
                        variant="soft"
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
                          <Cross2Icon className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <TextField.Root
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
                    style={{ flex: 1 }}
                  />
                  <IconButton
                    variant="soft"
                    onClick={handleAdd}
                    disabled={isPending || isGenerating || !newName.trim()}
                    aria-label="添加知识点"
                  >
                    {isPending ? <Spinner size="1" /> : <PlusIcon />}
                  </IconButton>
                </div>

                {error && (
                  <Text size="2" color="red">
                    {error}
                  </Text>
                )}

                <Text size="1" color="gray">
                  知识点数量：{knowledgePoints.length}（建议 5-15 个）
                </Text>
              </>
            )}
          </div>

          <div className="mt-4 flex justify-between gap-3">
            <Button
              variant="soft"
              color="gray"
              onClick={handleGenerate}
              disabled={!hasOutline || isPending || isGenerating}
            >
              {isGenerating ? <Spinner size="1" /> : <MagicWandIcon />}
              AI 生成
            </Button>

            <Dialog.Close>
              <Button variant="soft" color="gray">
                关闭
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialog.Content maxWidth="400px">
          <AlertDialog.Title>确认删除知识点</AlertDialog.Title>
          <AlertDialog.Description size="2">
            {deleteConfirm?.linkedCount && deleteConfirm.linkedCount > 0 ? (
              <>
                知识点「{deleteConfirm?.name}
                」已被 {deleteConfirm?.linkedCount}{" "}
                道题目关联，删除后将自动从这些题目中移除关联关系。
              </>
            ) : (
              <>确定要删除知识点「{deleteConfirm?.name}」吗？</>
            )}
          </AlertDialog.Description>

          <div className="mt-4 flex justify-end gap-3">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                取消
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" onClick={confirmDelete}>
                <TrashIcon />
                删除
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
