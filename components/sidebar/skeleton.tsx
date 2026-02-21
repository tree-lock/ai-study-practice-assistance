import { Box, Flex, Skeleton, Text } from "@radix-ui/themes";

export function SidebarSkeleton() {
  return (
    <Box className="sticky top-0 h-screen w-[250px] min-w-[250px] py-3.5 px-2.5 bg-[#efeff1]">
      <Flex direction="column" gap="6">
        {/* UserInfo 区域 */}
        <Flex align="center" justify="between">
          <Flex align="center" gap="3">
            <Skeleton width="40px" height="40px" className="rounded-full" />
            <Box>
              <Skeleton>
                <Text as="p" size="2" weight="bold">
                  AI 学习助教
                </Text>
              </Skeleton>
              <Skeleton>
                <Text as="p" size="1" color="gray">
                  欢迎使用
                </Text>
              </Skeleton>
            </Box>
          </Flex>
          <Skeleton width="28px" height="28px" />
        </Flex>

        {/* Actions 区域 */}
        <Flex direction="column" gap="1" className="pt-2">
          <Flex align="center" gap="2" className="pl-3 py-1.5">
            <Skeleton width="15px" height="15px" />
            <Skeleton>
              <Text size="2">新增题目</Text>
            </Skeleton>
          </Flex>
          <Flex align="center" gap="2" className="pl-3 py-1.5">
            <Skeleton width="15px" height="15px" />
            <Skeleton>
              <Text size="2">新建目录</Text>
            </Skeleton>
          </Flex>
        </Flex>

        {/* TopicList 区域 */}
        <Flex direction="column" gap="2">
          <Skeleton className="pl-3">
            <Text as="p" size="2" weight="bold">
              目录
            </Text>
          </Skeleton>
          <Flex direction="column" gap="1">
            <Flex className="pl-3 py-1.5">
              <Skeleton width="120px">
                <Text size="2">目录项</Text>
              </Skeleton>
            </Flex>
            <Flex className="pl-3 py-1.5">
              <Skeleton width="90px">
                <Text size="2">目录项</Text>
              </Skeleton>
            </Flex>
            <Flex className="pl-3 py-1.5">
              <Skeleton width="140px">
                <Text size="2">目录项</Text>
              </Skeleton>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
}
