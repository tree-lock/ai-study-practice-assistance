"use client";

import { Delete, Edit, MoreVert } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteTopic, updateTopic } from "@/app/actions/topic";

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
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

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
      <IconButton
        aria-label="题库操作"
        onClick={(e) => {
          setMenuAnchorEl(e.currentTarget);
        }}
        size="small"
        sx={{
          height: 28,
          width: 28,
          minWidth: 28,
        }}
      >
        <MoreVert fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={(e) => {
            e.preventDefault();
            setNewName(topicName);
            setError(null);
            setIsRenameOpen(true);
            setMenuAnchorEl(null);
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} />
          重命名
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.preventDefault();
            setError(null);
            setIsDeleteOpen(true);
            setMenuAnchorEl(null);
          }}
          sx={{ color: "error.main" }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          删除
        </MenuItem>
      </Menu>

      <Dialog
        open={isRenameOpen}
        onClose={() => setIsRenameOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>重命名题库</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            修改题库名称
          </Typography>
          <div className="mt-2 flex flex-col gap-3">
            <TextField
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="输入新的题库名称"
              disabled={isPending}
              fullWidth
              autoFocus
            />

            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsRenameOpen(false)}
            variant="outlined"
            color="inherit"
            disabled={isPending}
          >
            取消
          </Button>
          <Button
            onClick={handleRename}
            variant="contained"
            disabled={isPending}
          >
            {isPending ? <CircularProgress size={20} /> : null}
            确认
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>确认删除题库</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            确定要删除题库「{topicName}
            」吗？删除后，该题库下的所有题目也将被删除，此操作不可恢复。
          </Typography>

          {error && (
            <Typography variant="caption" color="error" className="mt-2 block">
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeleteOpen(false)}
            variant="outlined"
            color="inherit"
            disabled={isPending}
          >
            取消
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={20} /> : <Delete />}
          >
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
