"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilePlusIcon,
  GearIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import { Avatar, Box, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createTopic } from "@/app/actions/topic";
import { GhostButton } from "@/components/ghost-button";

type Topic = {
  id: string;
  name: string;
  description: string | null;
};

type AppShellProps = {
  title?: string;
  subtitle?: string;
  userLabel?: string;
  topics?: Array<Topic>;
  headerActions?: React.ReactNode;
  floatingActions?: React.ReactNode;
  children: React.ReactNode;
};

export function AppShell({
  title,
  subtitle,
  userLabel,
  topics = [],
  headerActions,
  floatingActions,
  children,
}: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [isCreatingDir, setIsCreatingDir] = useState(false);
  const [newDirName, setNewDirName] = useState("");
  const [createError, setCreateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateDir = async () => {
    const name = newDirName.trim();
    if (!name || isSubmitting) return;
    setIsSubmitting(true);
    setCreateError("");
    const result = await createTopic({ name });
    setIsSubmitting(false);
    if ("error" in result) {
      const message =
        typeof result.error === "string" ? result.error : "创建目录失败";
      setCreateError(message);
      return;
    }
    setNewDirName("");
    setIsCreatingDir(false);
    setCreateError("");
    router.refresh();
  };

  return (
    <Box className="min-h-screen bg-[#f3f3f5]">
      <Flex>
        <Box
          className={`sticky top-0 h-screen py-3.5 px-2.5 bg-[#efeff1] transition-all duration-200 ease-in-out ${
            collapsed ? "w-[88px] min-w-[88px]" : "w-[250px] min-w-[250px]"
          }`}
        >
          <Flex direction="column" gap="6">
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
                onClick={() => setCollapsed((prev) => !prev)}
                aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
              >
                {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              </GhostButton>
            </Flex>

            <Flex direction="column" className="pt-2">
              <GhostButton
                asChild
                layout="icon-text"
                aria-label="新增题目"
                className="pl-3"
              >
                <Link href="/" className="text-inherit no-underline">
                  <FilePlusIcon />
                  {!collapsed && <Text size="2">新增题目</Text>}
                </Link>
              </GhostButton>

              {isCreatingDir && !collapsed ? (
                <Flex direction="column" gap="1" className="px-2">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleCreateDir();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        setIsCreatingDir(false);
                        setNewDirName("");
                        setCreateError("");
                      }
                    }}
                  >
                    <TextField.Root
                      size="2"
                      value={newDirName}
                      onChange={(e) => {
                        setNewDirName(e.target.value);
                        setCreateError("");
                      }}
                      onBlur={() => {
                        if (!newDirName.trim()) {
                          setIsCreatingDir(false);
                          setCreateError("");
                        }
                      }}
                      placeholder="输入目录名称..."
                      autoFocus
                      disabled={isSubmitting}
                      style={{ width: "100%" }}
                    />
                  </form>
                  {createError ? (
                    <Text size="1" color="red">
                      {createError}
                    </Text>
                  ) : null}
                </Flex>
              ) : (
                <GhostButton
                  layout="icon-text"
                  onClick={() => !collapsed && setIsCreatingDir(true)}
                  disabled={collapsed}
                  aria-label="新建目录"
                  className="pl-3"
                >
                  <PlusIcon />
                  {!collapsed && <Text size="2">新建目录</Text>}
                </GhostButton>
              )}
            </Flex>

            {!collapsed ? (
              <Flex direction="column" gap="2">
                <Text as="p" size="2" weight="bold" className="pl-3">
                  目录
                </Text>
                <Flex direction="column">
                  {topics.map((topic) => (
                    <GhostButton
                      key={topic.id}
                      layout="text"
                      isActive={pathname === `/dashboard/topics/${topic.id}`}
                      onClick={() =>
                        router.push(`/dashboard/topics/${topic.id}`)
                      }
                      className="pl-3"
                    >
                      <Text size="2">{topic.name}</Text>
                    </GhostButton>
                  ))}
                </Flex>
              </Flex>
            ) : null}
          </Flex>
        </Box>

        <Box className="flex-1 relative">
          <Box className="w-full py-5 px-6">
            {floatingActions ? (
              <Box className="absolute top-5 right-5 z-[5]">
                <Flex align="center" gap="2">
                  <GhostButton layout="icon" aria-label="设置">
                    <GearIcon />
                  </GhostButton>
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
                  <GhostButton layout="icon" aria-label="设置">
                    <GearIcon />
                  </GhostButton>
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
