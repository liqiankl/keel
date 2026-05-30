"use client";

import { X, ExternalLink, Clock, Map, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { MoSCoWBadge } from "./MoSCoWCell";
import { GoalTag } from "./GoalTag";
import { InlineNumberCell } from "./InlineNumberCell";
import { IMPACT_VALUES } from "./columns";
import { avatarColor, getInitials, formatRelativeDate } from "@/lib/format";
import type {
  RoadmapItem,
  QuarterlyGoal,
  ScoringFramework,
  MoSCoWLabel,
  RICEScore,
  WSJFScore,
} from "@/types";

// ─────────────────────────────────────────────
// InitiativeDetail — right panel that shows
// full scoring inputs + metadata for the
// selected initiative.
// ─────────────────────────────────────────────

interface InitiativeDetailProps {
  initiative: RoadmapItem;
  framework: ScoringFramework;
  goals: QuarterlyGoal[];
  onClose: () => void;
  onUpdateRICE: (id: string, patch: Partial<RICEScore>) => void;
  onUpdateMoSCoW: (id: string, label: MoSCoWLabel) => void;
  onUpdateWSJF: (id: string, patch: Partial<WSJFScore>) => void;
  onUpdateEffort: (id: string, points: number | null) => void;
  onUpdateGoals: (id: string, goalIds: string[]) => void;
  onUpdateGoalNotes: (id: string, notes: string) => void;
  onSendToRoadmap?: (id: string) => void;
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-[var(--color-border-subtle)] last:border-0">
      <span className="w-28 flex-shrink-0 text-[13px] text-[var(--color-text-muted)] pt-0.5">
        {label}
      </span>
      <div className="flex-1 text-[14px] text-[var(--color-text-primary)]">{children}</div>
    </div>
  );
}

function ScoreDisplay({ label, value, large }: { label: string; value: number | null; large?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1">
      <span
        className={cn(
          "font-mono font-bold tabular-nums",
          large ? "text-[30px]" : "text-[22px]",
          value != null && value > 0
            ? "text-[var(--color-brand)]"
            : "text-[var(--color-text-muted)]",
        )}
      >
        {value ?? "—"}
      </span>
      <span className="text-[12px] text-[var(--color-text-muted)]">{label}</span>
    </div>
  );
}

export function InitiativeDetail({
  initiative,
  framework,
  goals,
  onClose,
  onUpdateRICE,
  onUpdateMoSCoW,
  onUpdateWSJF,
  onUpdateEffort,
  onUpdateGoals,
  onUpdateGoalNotes,
  onSendToRoadmap,
}: InitiativeDetailProps) {
  const score = initiative.score;
  const rice  = score?.rice;
  const wsjf  = score?.wsjf;
  const initiativeGoals = goals.filter((g) => initiative.goalIds.includes(g.id));

  return (
    <div className="flex flex-col h-full border-l border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[var(--color-border-subtle)] flex-shrink-0">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)] leading-snug">
            {initiative.title}
          </h2>
          <p className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
            {initiative.productArea}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close detail panel"
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md",
            "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
            "hover:bg-[var(--color-bg-hover)] transition-colors mt-0.5",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
          )}
        >
          <X size={19} />
        </button>
      </div>

      {/* Score summary */}
      <div className="px-5 py-4 border-b border-[var(--color-border-subtle)] flex-shrink-0">
        {framework === "rice" && (
          <>
            <div className="flex items-center justify-around mb-4">
              <ScoreDisplay label="RICE Score" value={rice?.score ?? null} large />
            </div>
            <div className="flex items-center justify-around">
              <ScoreDisplay label="Reach"      value={rice?.reach ?? null} />
              <ScoreDisplay label="Impact"     value={rice?.impact ?? null} />
              <ScoreDisplay label="Conf %"     value={rice?.confidence ?? null} />
              <ScoreDisplay label="Effort"     value={rice?.effort ?? null} />
            </div>
          </>
        )}

        {framework === "wsjf" && (
          <div className="flex items-center justify-around">
            <ScoreDisplay label="WSJF Score"    value={wsjf?.score ?? null} large />
            <ScoreDisplay label="Cost of Delay" value={wsjf?.costOfDelay ?? null} />
            <ScoreDisplay label="Job Size"      value={wsjf?.jobSize ?? null} />
          </div>
        )}

        {framework === "moscow" && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-[12px] text-[var(--color-text-muted)]">MoSCoW Priority</p>
            <MoSCoWBadge value={score?.moscow ?? null} />
          </div>
        )}

      </div>

      {/* Inputs section */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* ── RICE inputs ── */}
        {framework === "rice" && (
          <section>
            <h3 className="text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
              RICE Inputs
            </h3>
            <div className="space-y-2">
              <InputRow label="Reach" hint="Users impacted per quarter">
                <InlineNumberCell
                  value={rice?.reach ?? 0}
                  min={0}
                  step={10}
                  onChange={(v) => onUpdateRICE(initiative.id, { reach: v })}
                  className="!h-8 !text-right text-[13px]"
                />
              </InputRow>

              <InputRow label="Impact" hint="0.25 minimal → 3 massive">
                <select
                  value={rice?.impact ?? 1}
                  onChange={(e) => onUpdateRICE(initiative.id, { impact: parseFloat(e.target.value) })}
                  className={cn(
                    "h-8 rounded-md px-2 text-[13px] appearance-none w-full text-right",
                    "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
                    "text-[var(--color-text-primary)] font-mono",
                    "focus:outline-none focus:border-[var(--color-brand)]",
                  )}
                >
                  {IMPACT_VALUES.map((v) => (
                    <option key={v} value={v} className="bg-[#26262e]">{v}</option>
                  ))}
                </select>
              </InputRow>

              <InputRow label="Confidence %" hint="How certain are we? (0–100)">
                <InlineNumberCell
                  value={rice?.confidence ?? 100}
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  onChange={(v) => onUpdateRICE(initiative.id, { confidence: v })}
                  className="!h-8 !text-right text-[13px]"
                />
              </InputRow>

              <InputRow label="Effort" hint="Person-months of work">
                <InlineNumberCell
                  value={rice?.effort ?? 1}
                  min={0.1}
                  step={0.5}
                  onChange={(v) => onUpdateRICE(initiative.id, { effort: v })}
                  className="!h-8 !text-right text-[13px]"
                />
              </InputRow>
            </div>
          </section>
        )}

        {/* ── WSJF inputs ── */}
        {framework === "wsjf" && (
          <section>
            <h3 className="text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
              WSJF Inputs
            </h3>
            <div className="space-y-2">
              <InputRow label="Cost of Delay" hint="Business value lost per time unit">
                <InlineNumberCell
                  value={wsjf?.costOfDelay ?? 0}
                  min={0}
                  step={1}
                  onChange={(v) => onUpdateWSJF(initiative.id, { costOfDelay: v })}
                  className="!h-8 !text-right text-[13px]"
                />
              </InputRow>
              <InputRow label="Job Size" hint="Relative effort (higher = harder)">
                <InlineNumberCell
                  value={wsjf?.jobSize ?? 1}
                  min={0.1}
                  step={0.5}
                  onChange={(v) => onUpdateWSJF(initiative.id, { jobSize: v })}
                  className="!h-8 !text-right text-[13px]"
                />
              </InputRow>
            </div>
          </section>
        )}

        {/* ── Metadata ── */}
        <section>
          <h3 className="text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Details
          </h3>
          <div>
            {initiative.description && (
              <MetaRow label="Description">
                <span className="text-[var(--color-text-secondary)] leading-relaxed text-[13px]">
                  {initiative.description}
                </span>
              </MetaRow>
            )}
            {initiative.businessContext && (
              <MetaRow label="Business Context">
                <span className="text-[var(--color-text-secondary)] leading-relaxed text-[13px]">
                  {initiative.businessContext}
                </span>
              </MetaRow>
            )}
            <MetaRow label="Goals">
              <textarea
                value={initiative.goalNotes ?? ""}
                onChange={(e) => onUpdateGoalNotes(initiative.id, e.target.value)}
                placeholder="Type goals here…"
                rows={3}
                className={cn(
                  "w-full resize-none rounded-md px-2 py-1.5 text-[13px] leading-relaxed",
                  "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
                  "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                  "focus:outline-none focus:border-[var(--color-brand)] transition-colors",
                )}
              />
            </MetaRow>
            <MetaRow label="Status">
              <span className="capitalize text-[13px]">
                {initiative.status.replace("_", " ")}
              </span>
            </MetaRow>
            <MetaRow label="Story points">
              <InlineNumberCell
                value={initiative.effort.points ?? 0}
                min={0}
                step={1}
                onChange={(v) => onUpdateEffort(initiative.id, v === 0 ? null : v)}
                className="!h-7 !text-right text-[13px]"
              />
            </MetaRow>
            {score?.scoredAt && (
              <MetaRow label="Last scored">
                <span className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)]">
                  <Clock size={16} />
                  {new Date(score.scoredAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </MetaRow>
            )}
            {initiative.jiraEpicId && (
              <MetaRow label="Jira Epic">
                <a
                  href={`#jira/${initiative.jiraEpicId}`}
                  className="flex items-center gap-1 text-[13px] text-[var(--color-brand)] hover:underline"
                >
                  {initiative.jiraEpicId} <ExternalLink size={15} />
                </a>
              </MetaRow>
            )}
          </div>
        </section>

        {/* Votes */}
        {initiative.votes && initiative.votes.length > 0 && (
          <section>
            <h3 className="text-[12px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ThumbsUp size={12} />
              Stakeholder Votes · {initiative.votes.length}
            </h3>
            <ul className="space-y-3">
              {initiative.votes.map((vote, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div
                    className="h-[22px] w-[22px] rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-semibold text-white mt-0.5"
                    style={{ backgroundColor: avatarColor(vote.stakeholderName) }}
                  >
                    {getInitials(vote.stakeholderName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                        {vote.stakeholderName}
                      </span>
                      <span className="text-[12px] text-[var(--color-text-muted)]">
                        {formatRelativeDate(vote.votedAt)}
                      </span>
                    </div>
                    {vote.comment && (
                      <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
                        {vote.comment}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-[var(--color-border-subtle)] flex-shrink-0">
        {onSendToRoadmap && (
          <Button
            variant="primary"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={() => onSendToRoadmap(initiative.id)}
          >
            <Map size={18} />
            Send to Roadmap
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}


function InputRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-32 flex-shrink-0">
        <p className="text-[13px] text-[var(--color-text-secondary)]">{label}</p>
        {hint && <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
