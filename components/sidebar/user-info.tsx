import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import { Avatar, Box, Flex, Text } from "@radix-ui/themes";
import Link from "next/link";
import { GhostButton } from "@/components/ghost-button";

export function SidebarUserInfo({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  if (collapsed) {
    return (
      <GhostButton
        layout="icon"
        onClick={onToggleCollapse}
        aria-label="展开侧边栏"
      >
        <ChevronRightIcon />
      </GhostButton>
    );
  }

  return (
    <Flex align="center" justify="between">
      <GhostButton layout="icon" asChild aria-label="返回首页">
        <Link href="/">
          <HomeIcon />
        </Link>
      </GhostButton>
      <GhostButton
        layout="icon"
        onClick={onToggleCollapse}
        aria-label="收起侧边栏"
      >
        <ChevronLeftIcon />
      </GhostButton>
    </Flex>
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
    <Flex align="center" gap="3" className="whitespace-nowrap">
      <Avatar fallback="AI" radius="full" />
      {!collapsed ? (
        <Box>
          <Text as="p" size="2" weight="bold">
            AI 学习助教
          </Text>
          <Text as="p" size="1" color="gray">
            {userLabel ?? "欢迎使用"}
          </Text>
        </Box>
      ) : null}
    </Flex>
  );
}
