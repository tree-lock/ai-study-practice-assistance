"use client";

import type { QuestionPanelParsePhase } from "./question-panel";
import { QuestionPanel } from "./question-panel";
import type { QuestionPanelItem, TopicOption } from "./types";
import type { GenerateStatus } from "./use-core";

type ResultPanelsProps = {
  // 数据
  sourceLabel: string | null;
  questionPanels: QuestionPanelItem[];
  generateStatus: GenerateStatus;
  parsePhase: QuestionPanelParsePhase | null;
  activePanelIndex: number;
  existingCatalogCandidates: TopicOption[];

  // 编辑状态
  editingPanelId: string | null;
  questionDraft: string;
  savingPanelId: string | null;

  // 回调函数
  onDraftChange: (value: string) => void;
  onStartEdit: (panelId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (panelId: string) => void;
  onSelectTopic: (panelId: string, topicId: string | null) => void;
  onConfirm: (panel: QuestionPanelItem) => Promise<void>;
};

export function ResultPanels({
  sourceLabel,
  questionPanels,
  generateStatus,
  parsePhase,
  activePanelIndex,
  existingCatalogCandidates,
  editingPanelId,
  questionDraft,
  savingPanelId,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onSelectTopic,
  onConfirm,
}: ResultPanelsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {sourceLabel ? (
        <p className="text-xs text-muted-foreground">来源：{sourceLabel}</p>
      ) : null}
      {questionPanels.map((panel, index) => (
        <div
          key={panel.id}
          className="flex flex-col overflow-hidden rounded-xl border border-[#e5eaf3] bg-white"
        >
          <QuestionPanel
            questionIndex={index}
            totalQuestions={questionPanels.length}
            generateStatus={generateStatus}
            parsePhase={
              index === activePanelIndex ||
              (questionPanels.length === 1 && generateStatus === "generating")
                ? parsePhase
                : null
            }
            isActivePanel={
              index === activePanelIndex ||
              (generateStatus !== "generating" && questionPanels.length > 0)
            }
            notice={panel.notice}
            questionTypeLabel={panel.questionTypeLabel}
            formattedContent={panel.formattedContent}
            catalogRecommendation={panel.catalogRecommendation}
            existingCatalogCandidates={existingCatalogCandidates}
            selectedTopicId={panel.selectedTopicId}
            isEditing={editingPanelId === panel.id}
            draftValue={
              editingPanelId === panel.id
                ? questionDraft
                : panel.formattedContent
            }
            onDraftChange={onDraftChange}
            onStartEdit={() => onStartEdit(panel.id)}
            onCancelEdit={onCancelEdit}
            onSaveEdit={() => onSaveEdit(panel.id)}
            onSelectTopic={(id) => onSelectTopic(panel.id, id)}
            onConfirm={() => onConfirm(panel)}
            isSaving={savingPanelId === panel.id}
          />
        </div>
      ))}
      {generateStatus === "generating" &&
      questionPanels.length === 0 &&
      parsePhase ? (
        <div className="flex flex-col overflow-hidden rounded-xl border border-[#e5eaf3] bg-white">
          <QuestionPanel
            questionIndex={0}
            totalQuestions={1}
            generateStatus={generateStatus}
            parsePhase={parsePhase}
            isActivePanel
            questionTypeLabel="主观题"
            formattedContent=""
            catalogRecommendation={{
              topicId: "",
              topicName: "",
              matchScore: 0,
            }}
            existingCatalogCandidates={[]}
            selectedTopicId={null}
            isEditing={false}
            draftValue=""
            onDraftChange={() => {}}
            onStartEdit={() => {}}
            onCancelEdit={() => {}}
            onSaveEdit={() => {}}
            onSelectTopic={() => {}}
            onConfirm={() => {}}
            isSaving={false}
          />
        </div>
      ) : null}
    </div>
  );
}
