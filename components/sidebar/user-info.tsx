import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Avatar, Box, Flex, Text } from "@radix-ui/themes";
import { GhostButton } from "@/components/ghost-button";

type SidebarUserInfoProps = {
  userLabel?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function SidebarUserInfo({
  userLabel,
  collapsed,
  onToggleCollapse,
}: SidebarUserInfoProps) {
  return (
    <Flex align="center" justify="between">
      <Flex align="center" gap="3">
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
      <GhostButton
        layout="icon"
        onClick={onToggleCollapse}
        aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
      >
        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </GhostButton>
    </Flex>
  );
}
