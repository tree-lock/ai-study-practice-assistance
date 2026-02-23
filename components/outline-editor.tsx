"use client";

import { Pencil, Wand2 } from "lucide-react";
import { useState, useTransition } from "react";
import { generateTopicOutline, updateTopicOutline } from "@/app/actions/topic";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
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

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setEditedOutline(outline ?? "");
      setError(null);
    }
  };

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
    <div className="flex flex-col gap-2">
      {outline ? (
        <div className="flex items-start gap-2">
          <p className="flex-1 text-sm text-muted-foreground">{outline}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(true)}
            aria-label="编辑大纲"
          >
            <Pencil className="size-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">暂无大纲</p>
          <Button variant="secondary" size="sm" onClick={() => setIsOpen(true)}>
            <Pencil className="size-4" />
            添加大纲
          </Button>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-[520px]" showCloseButton>
          <DialogHeader>
            <DialogTitle>编辑题库大纲</DialogTitle>
            <DialogDescription>
              大纲是对题库内容的描述，用于生成知识点列表
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-4">
            <textarea
              placeholder="请输入题库大纲..."
              value={editedOutline}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setEditedOutline(e.target.value)
              }
              rows={6}
              disabled={isPending || isGenerating}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
            />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter className="mt-4 justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleGenerate}
              disabled={isPending || isGenerating}
            >
              {isGenerating ? (
                <Spinner className="size-4" />
              ) : (
                <Wand2 className="size-4" />
              )}
              AI 生成
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setIsOpen(false)}
              >
                取消
              </Button>
              <Button
                type="button"
                onClick={handleSave}
                disabled={isPending || isGenerating}
              >
                {isPending ? <Spinner className="size-4" /> : null}
                保存
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
