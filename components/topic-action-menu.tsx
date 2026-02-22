"use client";

import {
  DotsHorizontalIcon,
  Pencil1Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  AlertDialog,
  Button,
  Dialog,
  DropdownMenu,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteTopic, updateTopic } from "@/app/actions/topic";
import { GhostButton } from "./ghost-button";

type TopicActionMenuProps = {
  topicId: string;
  topicName: string;
};

export function TopicActionMenu({ topicId, topicName }: TopicActionMenuProps) {
  const router = useRouter();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(topicName);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRename = () => {
    if (!newName.trim()) {
      setError("题库名称不能为空");
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await updateTopic(topicId, { name: newName.trim() });
      if (result.error) {
        const errMsg =
          typeof result.error === "string"
            ? result.error
            : "重命名失败，请稍后重试";
        setError(errMsg);
      } else {
        setIsRenameOpen(false);
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      setError(null);
      const result = await deleteTopic(topicId);
      if (result.error) {
        setError(result.error);
      } else {
        setIsDeleteOpen(false);
        router.push("/");
        router.refresh();
      }
    });
  };

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <GhostButton
            layout="icon"
            aria-label="题库操作"
            onClick={(e) => e.preventDefault()}
          >
            <DotsHorizontalIcon />
          </GhostButton>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content size="1">
          <DropdownMenu.Item
            onClick={(e) => {
              e.preventDefault();
              setNewName(topicName);
              setError(null);
              setIsRenameOpen(true);
            }}
          >
            <Pencil1Icon />
            重命名
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            color="red"
            onClick={(e) => {
              e.preventDefault();
              setError(null);
              setIsDeleteOpen(true);
            }}
          >
            <TrashIcon />
            删除
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>

      <Dialog.Root open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <Dialog.Content maxWidth="400px">
          <Dialog.Title>重命名题库</Dialog.Title>
          <Dialog.Description size="2" color="gray">
            修改题库名称
          </Dialog.Description>

          <div className="mt-4 flex flex-col gap-3">
            <TextField.Root
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入新的题库名称"
              disabled={isPending}
            />

            {error && (
              <Text size="2" color="red">
                {error}
              </Text>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Dialog.Close>
              <Button variant="soft" color="gray" disabled={isPending}>
                取消
              </Button>
            </Dialog.Close>
            <Button onClick={handleRename} disabled={isPending}>
              {isPending ? <Spinner size="1" /> : null}
              确认
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      <AlertDialog.Root open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialog.Content maxWidth="400px">
          <AlertDialog.Title>确认删除题库</AlertDialog.Title>
          <AlertDialog.Description size="2">
            确定要删除题库「{topicName}
            」吗？删除后，该题库下的题目将失去归属，但不会被删除。
          </AlertDialog.Description>

          {error && (
            <Text size="2" color="red" className="mt-2 block">
              {error}
            </Text>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" disabled={isPending}>
                取消
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="solid"
                color="red"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? <Spinner size="1" /> : <TrashIcon />}
                删除
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
