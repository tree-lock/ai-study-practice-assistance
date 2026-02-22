"use client";

import { MagicWandIcon, Pencil1Icon } from "@radix-ui/react-icons";
import {
  Button,
  Dialog,
  IconButton,
  Spinner,
  Text,
  TextArea,
} from "@radix-ui/themes";
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
          <Text size="2" color="gray" className="flex-1">
            {outline}
          </Text>
          <div className="p-px">
            <IconButton
              variant="ghost"
              color="gray"
              onClick={() => setIsOpen(true)}
              aria-label="编辑大纲"
            >
              <Pencil1Icon />
            </IconButton>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Text size="2" color="gray">
            暂无大纲
          </Text>
          <Button variant="soft" size="1" onClick={() => setIsOpen(true)}>
            <Pencil1Icon />
            添加大纲
          </Button>
        </div>
      )}

      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Content maxWidth="520px">
          <Dialog.Title>编辑题库大纲</Dialog.Title>
          <Dialog.Description size="2" color="gray">
            大纲是对题库内容的描述，用于生成知识点列表
          </Dialog.Description>

          <div className="mt-4 flex flex-col gap-4">
            <TextArea
              placeholder="请输入题库大纲..."
              value={editedOutline}
              onChange={(e) => setEditedOutline(e.target.value)}
              rows={6}
              disabled={isPending || isGenerating}
            />

            {error && (
              <Text size="2" color="red">
                {error}
              </Text>
            )}
          </div>

          <div className="mt-4 flex justify-between gap-3">
            <Button
              variant="soft"
              color="gray"
              onClick={handleGenerate}
              disabled={isPending || isGenerating}
            >
              {isGenerating ? <Spinner size="1" /> : <MagicWandIcon />}
              AI 生成
            </Button>

            <div className="flex gap-2">
              <Dialog.Close>
                <Button variant="soft" color="gray" disabled={isPending}>
                  取消
                </Button>
              </Dialog.Close>
              <Button onClick={handleSave} disabled={isPending || isGenerating}>
                {isPending ? <Spinner size="1" /> : null}
                保存
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
}
