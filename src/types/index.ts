// ─────────────────────────────────────────────
// KEEL — Core Type System
// All domain types for the QPT application.
// ─────────────────────────────────────────────

// ── Enums ──────────────────────────────────

export type Priority = "urgent" | "high" | "medium" | "low" | "none";

export type RequestStatus = "new" | "triaged" | "archived";

export type InitiativeStatus =
  | "backlog"
  | "todo"
  | "in_progress"
  | "in_review"
  | "closed"
  | "done"
  | "canceled";

export type PlanStatus = "draft" | "in_review" | "approved" | "locked";

export type ScoringFramework = "rice" | "moscow" | "wsjf";

export type MoSCoWLabel = "must" | "should" | "could" | "wont";

export type RequestSource = "customer" | "engineering" | "internal";

export type PrioritySignal = "nice_to_have" | "important" | "critical";

export type GoalWeight = 1 | 2 | 3 | 4 | 5;

export type EffortUnit = "story_points" | "t_shirt" | "weeks";

export type TShirtSize = "xs" | "s" | "m" | "l" | "xl";

export type ReviewDecision = "approved" | "changes_requested" | "declined";

// ── Feature Request ────────────────────────

export interface FeatureRequest {
  id: string;
  teamId?: string;           // which team's inbox this belongs to
  title: string;
  description: string;
  businessContext: string;
  source: RequestSource;
  prioritySignal: PrioritySignal;
  status: RequestStatus;
  tags: string[];
  productArea: string | null;
  goalIds: string[];
  submittedBy: string;
  submittedAt: string; // ISO 8601
  votes: RequestVote[];
  comments: RequestComment[];
  supportingLinks: string[];
  mergedFromIds: string[];
  externalRef: string | null;
}

export interface RequestVote {
  stakeholderId: string;
  stakeholderName: string;
  comment: string | null;
  votedAt: string;
}

export interface RequestComment {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

// ── Prioritization Scoring ─────────────────

export interface RICEScore {
  reach: number;        // expected users per period
  impact: number;       // 0.25 | 0.5 | 1 | 2 | 3
  confidence: number;   // percentage 0–100
  effort: number;       // person-months
  score: number;        // computed: (reach × impact × confidence%) / effort
}

export interface WSJFScore {
  costOfDelay: number;  // business value
  jobSize: number;      // effort proxy
  score: number;        // computed: costOfDelay / jobSize
}

export interface PrioritizationScore {
  initiativeId: string;
  framework: ScoringFramework;
  rice: RICEScore | null;
  moscow: MoSCoWLabel | null;
  wsjf: WSJFScore | null;
  manualRankOverride: number | null;
  overrideReason: string | null;
  scoredAt: string;
  scoredBy: string;
  history: ScoringHistoryEntry[];
}

export interface ScoringHistoryEntry {
  framework: ScoringFramework;
  scoreSnapshot: Partial<RICEScore & WSJFScore>;
  changedAt: string;
  changedBy: string;
}

// ── Quarterly Goal ─────────────────────────

export interface QuarterlyGoal {
  id: string;
  title: string;
  description: string;
  owningTeam: string;
  kpiTarget: string | null;
  weight: GoalWeight;
  quarter: QuarterRef;
  color: string; // hex, for roadmap lane color
}

// ── Roadmap Item / Initiative ──────────────

export interface RoadmapItem {
  id: string;
  teamId?: string;
  featureRequestId: string | null;  // linked intake request
  title: string;
  description: string;
  assignedPmId: string;
  goalIds: string[];
  productArea: string;
  status: InitiativeStatus;
  priority: Priority;
  effort: EffortValue;
  quarter: QuarterRef;
  score: PrioritizationScore | null;
  dependencies: InitiativeDependency[];
  jiraEpicId: string | null;
  linearProjectId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EffortValue {
  unit: EffortUnit;
  points: number | null;
  tshirt: TShirtSize | null;
  weeks: number | null;
}

export interface InitiativeDependency {
  initiativeId: string;
  type: "blocked_by" | "enables";
}

export interface QuarterRef {
  year: number;
  quarter: 1 | 2 | 3 | 4;
  label: string; // "Q3 2025"
}

// ── Quarterly Plan ─────────────────────────

export interface QuarterlyPlan {
  id: string;
  quarter: QuarterRef;
  workspaceId: string;
  teamId: string;
  status: PlanStatus;
  goals: QuarterlyGoal[];
  items: RoadmapItem[];
  capacity: CapacityConfig;
  reviewers: PlanReviewer[];
  lockedAt: string | null;
  lockedBy: string | null;
  createdAt: string;
  updatedAt: string;
  shareLink: string | null;
}

export interface CapacityConfig {
  unit: EffortUnit;
  total: number;
  committed: number;     // sum of added items' effort
  warningThreshold: number; // default 0.9 (90%)
  byArea: Record<string, number>; // productArea → capacity
}

export interface PlanReviewer {
  userId: string;
  name: string;
  email: string;
  required: boolean;
  decision: ReviewDecision | null;
  comment: string | null;
  reviewedAt: string | null;
}

// ── Workspace & User ───────────────────────

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  avatarInitials: string;
  avatarColor: string;
  role: "admin" | "member" | "viewer";
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  avatarColor: string;
  members: WorkspaceMember[];
  productAreas: string[];
  currentUser: WorkspaceMember;
}

// ── Voting Round ───────────────────────────

export interface VotingRound {
  id: string;
  planId: string;
  openedAt: string;
  closedAt: string | null;
  durationDays: number;
  invitedStakeholderEmails: string[];
}

// ── UI State (not domain) ──────────────────

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: string;           // Lucide icon name
  href: string;
  badge?: number;
  children?: SidebarNavItem[];
}

export type ViewMode = "list" | "board" | "timeline";

export type FilterTab = "active" | "all" | "new" | "triaged" | "archived" | "backlog";
