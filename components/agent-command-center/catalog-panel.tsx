"use client";

import { Check as CheckIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { TopicOption } from "./types";

type CatalogPanelProps = {
  existingCatalogCandidates: Array<TopicOption>;
  selectedTopicId: string | null;
  matchScore: number;
  suggestedTopicName?: string;
  isSaving: boolean;
  onSelectTopic: (id: string) => void;
  onConfirm: () => void;
};

export function CatalogPanel({
  existingCatalogCandidates,
  selectedTopicId,
  matchScore,
  suggestedTopicName,
  isSaving,
  onSelectTopic,
  onConfirm,
}: CatalogPanelProps) {
  const hasTopics = existingCatalogCandidates.length > 0;
  const isLowMatch = matchScore > 0 && matchScore < 60;

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={1}
      className="border-t border-[#eef2f7] pt-2.5"
    >
      {isLowMatch && suggestedTopicName && (
        <Alert
          severity="warning"
          icon={<ExclamationTriangleIcon />}
          sx={{ fontSize: "0.875rem" }}
        >
          匹配度较低，建议新建题库：「{suggestedTopicName}」
        </Alert>
      )}

      {!hasTopics ? (
        <Typography variant="body2" color="text.secondary">
          暂无题库，请先在侧边栏创建题库
        </Typography>
      ) : (
        <Box display="flex" gap={1} alignItems="center" className="w-full">
          <Typography
            variant="body2"
            color="text.secondary"
            className="shrink-0"
          >
            保存到：
          </Typography>
          <div className="min-w-0 flex-1">
            <FormControl fullWidth size="small">
              <Select
                value={selectedTopicId || ""}
                onChange={(e) => onSelectTopic(e.target.value)}
                displayEmpty
                variant="outlined"
                fullWidth
              >
                <MenuItem value="" disabled>
                  选择题库
                </MenuItem>
                {existingCatalogCandidates.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSaving || !selectedTopicId}
            aria-label="确认保存"
            className={`inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-none text-white transition-all duration-150 ease-in-out ${
              isSaving
                ? "bg-blue-400 opacity-70"
                : selectedTopicId
                  ? "bg-blue-600 opacity-100 shadow-[0_4px_10px_rgba(37,99,235,0.28)]"
                  : "bg-blue-300 opacity-70"
            }`}
          >
            {isSaving ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <CheckIcon sx={{ fontSize: 14 }} />
            )}
          </button>
        </Box>
      )}
    </Box>
  );
}

function ExclamationTriangleIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 15 15"
      fill="currentColor"
      aria-label="警告"
    >
      <title>警告</title>
      <path d="M7.49991 0.877045C8.08702 0.877045 8.5984 1.20116 8.85327 1.7246L14.1266 12.593C14.3923 13.1396 14.1644 13.7966 13.5967 14.0623C13.4593 14.1266 13.3089 14.1598 13.1583 14.1598H1.84158C1.27391 14.1598 0.814941 13.6993 0.814941 13.1316C0.814941 12.981 0.84816 12.8306 0.912438 12.6932L6.18579 1.7246C6.44066 1.20116 6.95204 0.877045 7.49991 0.877045ZM7.49991 2.22705L2.22656 13.0957H12.7732L7.49991 2.22705ZM7.49991 11.5957C7.84509 11.5957 8.12491 11.3159 8.12491 10.9707C8.12491 10.6255 7.84509 10.3457 7.49991 10.3457C7.15473 10.3457 6.87491 10.6255 6.87491 10.9707C6.87491 11.3159 7.15473 11.5957 7.49991 11.5957ZM6.87491 8.0957C6.87491 8.44088 7.15473 8.7207 7.49991 8.7207H7.50791C7.85309 8.7207 8.13291 8.44088 8.13291 8.0957V4.5957C8.13291 4.25052 7.85309 3.9707 7.50791 3.9707H7.49991C7.15473 3.9707 6.87491 4.25052 6.87491 4.5957V8.0957Z" />
    </svg>
  );
}
