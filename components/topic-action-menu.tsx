"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteTopic, updateTopic } from "@/app/actions/topic";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="题库操作"
            data-state={isMenuOpen ? "open" : "closed"}
          >
            <MoreVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e: Event) => {
              e.preventDefault();
              setNewName(topicName);
              setError(null);
              setIsRenameOpen(true);
            }}
          >
            <Pencil className="size-4" />
            重命名
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e: Event) => {
              e.preventDefault();
              setError(null);
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 className="size-4" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="max-w-[400px]" showClose>
          <DialogHeader>
            <DialogTitle>重命名题库</DialogTitle>
            <DialogDescription>修改题库名称</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-3">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入新的题库名称"
              disabled={isPending}
            />

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter className="mt-4 gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setIsRenameOpen(false)}
            >
              取消
            </Button>
            <Button type="button" onClick={handleRename} disabled={isPending}>
              {isPending ? <Spinner className="size-4" /> : null}
              确认
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除题库</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除题库「{topicName}
              」吗？删除后，该题库下的所有题目也将被删除，此操作不可恢复。
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error ? (
            <p className="mt-2 block text-sm text-destructive">{error}</p>
          ) : null}

          <AlertDialogFooter className="mt-4 gap-3">
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                取消
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                {isPending ? (
                  <Spinner className="size-4" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                删除
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
