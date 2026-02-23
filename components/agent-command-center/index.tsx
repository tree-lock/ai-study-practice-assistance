"use client";

import { useRouter } from "next/navigation";
import { invalidateTopicCache } from "@/lib/hooks/use-topic-data";
import { InputArea } from "./input-area";
import { ResultPanels } from "./result-panels";
import type { QuestionPanelItem, TopicOption } from "./types";
import { useCore } from "./use-core";
import { usePanelsManager } from "./use-panels-manager";
import { useQuestionGenerator } from "./use-question-generator";

export function AgentCommandCenter() {
  const router = useRouter();

  // 组合基础状态 Hook
  const {
    prompt,
    setPrompt,
    files,
    setFiles,
    isDragging,
    setIsDragging,
    isMaximized,
    setIsMaximized,
    generateStatus,
    setGenerateStatus,
    addFiles,
    removeFile,
    updateFileRotation,
  } = useCore();

  // 组合面板管理 Hook（需要在生成器之前初始化）
  const {
    questionPanels,
    setQuestionPanels,
    existingCatalogCandidates,
    setExistingCatalogCandidates,
    editingPanelId,
    questionDraft,
    setQuestionDraft,
    savingPanelId,
    reRecognizingPanelIds,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    handleTopicSelect,
    handleConfirm,
    handleReRecognize,
    handleQuestionTypeChange,
  } = usePanelsManager({
    onInvalidateTopicCache: (topicId) => invalidateTopicCache(topicId),
    onNavigate: (path) => router.push(path),
    onStatusReset: () => {
      setPrompt("");
      setFiles([]);
      setGenerateStatus("idle");
    },
  });

  // 组合题目生成 Hook
  const { parsePhase, activePanelIndex, sourceLabel, handleGenerateClick } =
    useQuestionGenerator({
      prompt,
      files,
      onPanelsGenerated: (panels: QuestionPanelItem[]) => {
        setQuestionPanels(panels);
      },
      onTopicsFetched: (topics: TopicOption[]) => {
        setExistingCatalogCandidates(topics);
      },
      onStatusChange: setGenerateStatus,
    });

  const shouldShowResultPanels =
    files.length > 0 || prompt.trim().length > 0 || generateStatus !== "idle";

  return (
    <div className="flex w-full max-w-[760px] flex-col gap-5">
      <InputArea
        prompt={prompt}
        files={files}
        isMaximized={isMaximized}
        isDragging={isDragging}
        generateStatus={generateStatus}
        onPromptChange={setPrompt}
        onIsMaximizedChange={setIsMaximized}
        onDragStateChange={setIsDragging}
        onAddFiles={addFiles}
        onRemoveFile={removeFile}
        onRotationChange={updateFileRotation}
        onGenerateClick={handleGenerateClick}
      />
      {shouldShowResultPanels && (
        <ResultPanels
          sourceLabel={sourceLabel}
          questionPanels={questionPanels}
          generateStatus={generateStatus}
          parsePhase={parsePhase}
          activePanelIndex={activePanelIndex}
          existingCatalogCandidates={existingCatalogCandidates}
          editingPanelId={editingPanelId}
          questionDraft={questionDraft}
          savingPanelId={savingPanelId}
          reRecognizingPanelIds={reRecognizingPanelIds}
          onDraftChange={setQuestionDraft}
          onStartEdit={handleEditStart}
          onCancelEdit={handleEditCancel}
          onSaveEdit={handleEditSave}
          onSelectTopic={handleTopicSelect}
          onConfirm={handleConfirm}
          onQuestionTypeChange={handleQuestionTypeChange}
          onReRecognize={handleReRecognize}
        />
      )}
    </div>
  );
}
