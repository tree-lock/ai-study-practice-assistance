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
  /** 无 panels 时占位用（parsing、uploading、notice、count、splitting）；有 panels 时由 panel.currentPhase 驱动 */
  parsePhase: QuestionPanelParsePhase | null;
  existingCatalogCandidates: TopicOption[];

  // 编辑状态
  editingPanelId: string | null;
  questionDraft: string;
  savingPanelId: string | null;
  reRecognizingPanelIds: Set<string>;

  // 回调函数
  onDraftChange: (value: string) => void;
  onStartEdit: (panelId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: (panelId: string) => void;
  onSelectTopic: (panelId: string, topicId: string | null) => void;
  onConfirm: (panel: QuestionPanelItem) => Promise<void>;
  onQuestionTypeChange: (panelId: string, type: string, label: string) => void;
  onReRecognize: (panelId: string) => void;
};

export function ResultPanels({
  sourceLabel,
  questionPanels,
  generateStatus,
  parsePhase,
  existingCatalogCandidates,
  editingPanelId,
  questionDraft,
  savingPanelId,
  reRecognizingPanelIds,
  onDraftChange,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onSelectTopic,
  onConfirm,
  onQuestionTypeChange,
  onReRecognize,
}: ResultPanelsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {sourceLabel ? (
        <p className="text-xs text-muted-foreground">来源：{sourceLabel}</p>
      ) : null}
      {generateStatus === "generating" && questionPanels.length > 0 ? (
        <p className="text-sm text-muted-foreground">
          检测到 {questionPanels.length} 题
        </p>
      ) : null}
      {questionPanels.map((panel, index) => (
        <div
          key={panel.id}
          className={`flex flex-col overflow-hidden rounded-xl border border-[#e5eaf3] bg-white ${
            panel.status === "pending" ? "opacity-60" : ""
          }`}
        >
          <QuestionPanel
            questionIndex={index}
            totalQuestions={questionPanels.length}
            generateStatus={generateStatus}
            parsePhase={null}
            isActivePanel={
              generateStatus !== "generating" || panel.status !== "pending"
            }
            notice={panel.notice}
            questionType={panel.questionType}
            questionTypeLabel={panel.questionTypeLabel}
            formattedContent={panel.formattedContent}
            questionRaw={panel.questionRaw}
            onQuestionTypeChange={(type, label) =>
              onQuestionTypeChange(panel.id, type, label)
            }
            onReRecognize={() => onReRecognize(panel.id)}
            isReRecognizing={reRecognizingPanelIds.has(panel.id)}
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
            panelStatus={panel.status}
            panelCurrentPhase={panel.currentPhase ?? null}
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
            questionType="subjective"
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
