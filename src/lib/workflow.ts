import type { FeatureRequest, StageStatus } from "@/types";

export interface WorkflowStageStatuses {
  inbox: StageStatus;
  ideas: StageStatus;
  prioritization: StageStatus;
  roadmap: StageStatus;
}

export function deriveWorkflowStages(
  requests: FeatureRequest[],
  inboxCompleted: boolean,
  scoringStarted: boolean,
): WorkflowStageStatuses {
  const hasIdeas          = requests.some((r) => r.workflowStage === "ideas");
  const hasPrioritization = requests.some((r) => r.workflowStage === "prioritization");
  const hasRoadmap        = requests.some((r) => r.workflowStage === "roadmap");

  let ideas: StageStatus;
  if (scoringStarted) {
    ideas = "locked";
  } else if (hasPrioritization || hasRoadmap) {
    ideas = "completed";
  } else if (hasIdeas) {
    ideas = "active";
  } else {
    ideas = "not_started";
  }

  let prioritization: StageStatus;
  if (hasRoadmap) {
    prioritization = "completed";
  } else if (hasPrioritization) {
    prioritization = "active";
  } else {
    prioritization = "not_started";
  }

  return {
    inbox:          inboxCompleted ? "completed" : "active",
    ideas,
    prioritization,
    roadmap:        hasRoadmap ? "active" : "not_started",
  };
}
