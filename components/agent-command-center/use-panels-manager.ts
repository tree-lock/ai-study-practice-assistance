"use client";

import { useState } from "react";
import { saveQuestionToCatalog } from "@/app/actions/agent";
import type { QuestionPanelItem, TopicOption } from "./types";

type UsePanelsManagerProps = {
  onInvalidateTopicCache: (topicId: string) => void;
  onNavigate: (path: string) => void;
  onStatusReset?: () => void;
};

export function usePanelsManager({
  onInvalidateTopicCache,
  onNavigate,
  onStatusReset,
}: UsePanelsManagerProps) {
  const [questionPanels, setQuestionPanels] = useState<QuestionPanelItem[]>([]);
  const [existingCatalogCandidates, setExistingCatalogCandidates] = useState<
    Array<TopicOption>
  >([]);
  const [editingPanelId, setEditingPanelId] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] = useState("");
  const [savingPanelId, setSavingPanelId] = useState<string | null>(null);

  function updatePanelTopic(id: string, topicId: string | null) {
    setQuestionPanels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selectedTopicId: topicId } : p)),
    );
  }

  function updatePanelContent(id: string, formattedContent: string) {
    setQuestionPanels((prev) =>
      prev.map((p) => (p.id === id ? { ...p, formattedContent } : p)),
    );
  }

  function handleEditStart(panelId: string) {
    const panel = questionPanels.find((p) => p.id === panelId);
    if (panel) {
      setQuestionDraft(panel.formattedContent);
      setEditingPanelId(panelId);
    }
  }

  function handleEditCancel() {
    setEditingPanelId(null);
  }

  function handleEditSave(panelId: string) {
    updatePanelContent(panelId, questionDraft.trim());
    setEditingPanelId(null);
  }

  function handleTopicSelect(panelId: string, topicId: string | null) {
    updatePanelTopic(panelId, topicId);
  }

  async function handleConfirm(panel: QuestionPanelItem) {
    if (!panel.selectedTopicId) return;

    const selectedTopic = existingCatalogCandidates.find(
      (t) => t.id === panel.selectedTopicId,
    );
    if (!selectedTopic) {
      alert("请选择有效的题库");
      return;
    }

    const content =
      editingPanelId === panel.id
        ? questionDraft.trim()
        : panel.formattedContent.trim();
    if (!content) {
      alert("题目内容不能为空");
      return;
    }

    setSavingPanelId(panel.id);
    try {
      const result = await saveQuestionToCatalog({
        topicId: panel.selectedTopicId,
        questionContent: content,
        source: "AI 智能分析",
        questionType: panel.questionType as
          | "choice"
          | "blank"
          | "subjective"
          | "application"
          | "proof"
          | "comprehensive",
      });

      if (result.success) {
        onInvalidateTopicCache(result.topicId);
        setQuestionPanels((prev) => prev.filter((p) => p.id !== panel.id));

        // 如果这是最后一个面板，重置状态
        if (questionPanels.length <= 1 && onStatusReset) {
          onStatusReset();
        }

        onNavigate(`/topics/${result.topicId}`);
      } else {
        alert(`保存失败：${result.error}`);
      }
    } catch (error) {
      console.error("保存题目失败:", error);
      alert("保存失败，请稍后重试");
    } finally {
      setSavingPanelId(null);
    }
  }

  return {
    questionPanels,
    setQuestionPanels,
    existingCatalogCandidates,
    setExistingCatalogCandidates,
    editingPanelId,
    questionDraft,
    setQuestionDraft,
    savingPanelId,
    updatePanelTopic,
    updatePanelContent,
    handleEditStart,
    handleEditCancel,
    handleEditSave,
    handleTopicSelect,
    handleConfirm,
  };
}
