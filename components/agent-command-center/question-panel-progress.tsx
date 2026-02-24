"use client";

import {
  getPhaseProgress,
  PARSE_PHASE_LABELS,
  type QuestionPanelParsePhase,
} from "./parse-phase-constants";

type QuestionPanelProgressProps = {
  currentPhase: QuestionPanelParsePhase;
  isProcessing: boolean;
};

export function QuestionPanelProgress({
  currentPhase,
  isProcessing,
}: QuestionPanelProgressProps) {
  if (!isProcessing || !currentPhase) return null;

  const progress = getPhaseProgress(currentPhase);
  const label = PARSE_PHASE_LABELS[currentPhase];

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="h-0.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
