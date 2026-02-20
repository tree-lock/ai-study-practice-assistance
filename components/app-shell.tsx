"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import { Avatar, Box, Flex, Heading, IconButton, Text } from "@radix-ui/themes";
import { useState } from "react";

type AppShellProps = {
  title?: string;
  subtitle?: string;
  userLabel?: string;
  headerActions?: React.ReactNode;
  floatingActions?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({
  title,
  subtitle,
  userLabel,
  headerActions,
  floatingActions,
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Box style={{ minHeight: "100vh", background: "#f3f3f5" }}>
      <Flex>
        <Box
          style={{
            position: "sticky",
            top: 0,
            height: "100vh",
            width: collapsed ? 88 : 250,
            minWidth: collapsed ? 88 : 250,
            transition: "width 180ms ease",
            padding: "14px 10px",
            background: "#efeff1",
          }}
        >
          <Flex direction="column" gap="5">
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
              <IconButton
                variant="ghost"
                color="gray"
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </IconButton>
            </Flex>
          </Flex>
        </Box>

        <Box style={{ flex: 1, position: "relative" }}>
          <Box style={{ width: "100%", padding: "20px 24px" }}>
            {floatingActions ? (
              <Box
                style={{ position: "absolute", top: 20, right: 20, zIndex: 5 }}
              >
                <Flex align="center" gap="2">
                  <IconButton variant="ghost" color="gray" aria-label="设置">
                    <GearIcon />
                  </IconButton>
                  {floatingActions}
                </Flex>
              </Box>
            ) : null}

            {title || subtitle || headerActions ? (
              <Flex justify="between" align="start" gap="3" mb="5">
                <Box>
                  {title ? <Heading size="7">{title}</Heading> : null}
                  {subtitle ? (
                    <Text as="p" size="2" color="gray" mt="1">
                      {subtitle}
                    </Text>
                  ) : null}
                </Box>
                <Flex align="center" gap="2">
                  <IconButton variant="ghost" color="gray" aria-label="设置">
                    <GearIcon />
                  </IconButton>
                  {headerActions}
                </Flex>
              </Flex>
            ) : null}

            {children}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
}
