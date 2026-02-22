import { ChevronLeft, ChevronRight, Home } from "@mui/icons-material";
import { Avatar, Box, IconButton, Typography } from "@mui/material";
import Link from "next/link";

export function SidebarUserInfo({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  if (collapsed) {
    return (
      <div className="p-px">
        <IconButton
          color="inherit"
          onClick={onToggleCollapse}
          aria-label="展开侧边栏"
          size="small"
        >
          <ChevronRight />
        </IconButton>
      </div>
    );
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between">
      <div className="p-px">
        <IconButton
          component={Link}
          href="/"
          color="inherit"
          aria-label="返回首页"
          size="small"
        >
          <Home />
        </IconButton>
      </div>
      <div className="p-px">
        <IconButton
          color="inherit"
          onClick={onToggleCollapse}
          aria-label="收起侧边栏"
          size="small"
        >
          <ChevronLeft />
        </IconButton>
      </div>
    </Box>
  );
}

export function SidebarFooter({
  userLabel,
  collapsed,
}: {
  userLabel?: string;
  collapsed: boolean;
}) {
  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1.5}
      className="whitespace-nowrap"
    >
      <Avatar alt="AI" sx={{ width: 32, height: 32 }}>
        AI
      </Avatar>
      {!collapsed ? (
        <Box>
          <Typography variant="subtitle2" fontWeight="fontWeightBold">
            AI 学习助教
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {userLabel ?? "欢迎使用"}
          </Typography>
        </Box>
      ) : null}
    </Box>
  );
}
