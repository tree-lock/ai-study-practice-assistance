import { Box, Skeleton, Typography } from "@mui/material";

export function SidebarSkeleton() {
  return (
    <Box className="sticky top-0 h-screen w-[250px] min-w-[250px] py-3.5 px-2.5 bg-[#efeff1]">
      <Box display="flex" flexDirection="column" gap={3}>
        {/* UserInfo 区域 */}
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box>
              <Skeleton width={80}>
                <Typography variant="subtitle2" fontWeight="fontWeightBold">
                  AI 学习助教
                </Typography>
              </Skeleton>
              <Skeleton width={60}>
                <Typography variant="caption" color="text.secondary">
                  欢迎使用
                </Typography>
              </Skeleton>
            </Box>
          </Box>
          <Skeleton variant="circular" width={28} height={28} />
        </Box>

        {/* Actions 区域 */}
        <Box display="flex" flexDirection="column" gap={0.5} className="pt-2">
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            className="pl-3 py-1.5"
          >
            <Skeleton variant="rectangular" width={15} height={15} />
            <Skeleton width={60}>
              <Typography variant="body2">新增题目</Typography>
            </Skeleton>
          </Box>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            className="pl-3 py-1.5"
          >
            <Skeleton variant="rectangular" width={15} height={15} />
            <Skeleton width={60}>
              <Typography variant="body2">新建题库</Typography>
            </Skeleton>
          </Box>
        </Box>

        {/* TopicList 区域 */}
        <Box display="flex" flexDirection="column" gap={1}>
          <Skeleton className="pl-3">
            <Typography variant="subtitle2" fontWeight="fontWeightBold">
              题库
            </Typography>
          </Skeleton>
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box className="pl-3 py-1.5">
              <Skeleton width={120}>
                <Typography variant="body2">题库项</Typography>
              </Skeleton>
            </Box>
            <Box className="pl-3 py-1.5">
              <Skeleton width={90}>
                <Typography variant="body2">题库项</Typography>
              </Skeleton>
            </Box>
            <Box className="pl-3 py-1.5">
              <Skeleton width={140}>
                <Typography variant="body2">题库项</Typography>
              </Skeleton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
