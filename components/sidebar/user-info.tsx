import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HomeIcon,
} from "@radix-ui/react-icons";
import { Avatar, Box, Flex, IconButton, Text } from "@radix-ui/themes";
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
          variant="ghost"
          color="gray"
          onClick={onToggleCollapse}
          aria-label="展开侧边栏"
        >
          <ChevronRightIcon />
        </IconButton>
      </div>
    );
  }

  return (
    <Flex align="center" justify="between">
      <div className="p-px">
        <IconButton variant="ghost" color="gray" asChild aria-label="返回首页">
          <Link href="/">
            <HomeIcon />
          </Link>
        </IconButton>
      </div>
      <div className="p-px">
        <IconButton
          variant="ghost"
          color="gray"
          onClick={onToggleCollapse}
          aria-label="收起侧边栏"
        >
          <ChevronLeftIcon />
        </IconButton>
      </div>
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
