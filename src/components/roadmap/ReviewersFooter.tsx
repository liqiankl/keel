"use client";

import { Check, X, Clock, UserPlus } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { avatarColor } from "@/lib/format";
import type { QuarterlyPlan, PlanStatus } from "@/types";

// ─────────────────────────────────────────────
// ReviewersFooter — shows reviewer avatars with
// approval status. Submit for review / lock CTAs.
// ─────────────────────────────────────────────

interface ReviewersFooterProps {
  plan: QuarterlyPlan;
  onStatusChange: (status: PlanStatus) => void;
}

function ReviewerAvatar({ name, decision }: { name: string; decision: string | null }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const bg = avatarColor(name);

  return (
    <div className="relative flex-shrink-0" title={`${name}: ${decision ?? "pending"}`}>
      <div
        className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white"
        style={{ backgroundColor: bg }}
        aria-label={name}
      >
        {initials}
      </div>
      {/* Decision indicator */}
      <span
        className={cn(
          "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full flex items-center justify-center",
          "border border-[var(--color-bg-surface)]",
          decision === "approved"           ? "bg-[var(--color-success)]" :
          decision === "changes_requested"  ? "bg-[var(--color-warning)]" :
          decision === "declined"           ? "bg-[var(--color-danger)]" :
                                              "bg-[var(--color-bg-hover)]",
        )}
        aria-hidden="true"
      >
        {decision === "approved"          && <Check size={8} strokeWidth={2.5} className="text-white" />}
        {decision === "changes_requested" && <Clock size={7} className="text-white" />}
        {decision === "declined"          && <X size={8} strokeWidth={2.5} className="text-white" />}
        {!decision                        && <Clock size={7} className="text-[var(--color-text-muted)]" />}
      </span>
    </div>
  );
}

export function ReviewersFooter({ plan, onStatusChange }: ReviewersFooterProps) {
  const allApproved =
    plan.reviewers.length > 0 &&
    plan.reviewers.every((r) => !r.required || r.decision === "approved");

  const isLocked   = plan.status === "locked";
  const isDraft    = plan.status === "draft";
  const isInReview = plan.status === "in_review";

  return (
    <div
      className={cn(
        "flex items-center gap-4 px-4 py-3 border-t border-[var(--color-border-subtle)] flex-shrink-0",
        "bg-[var(--color-bg-surface)]",
      )}
    >
      {/* Reviewer avatars */}
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-[var(--color-text-muted)] mr-1">
          Reviewers
        </span>
        {plan.reviewers.length === 0 ? (
          <span className="text-[11px] text-[var(--color-text-muted)]">None</span>
        ) : (
          <div className="flex items-center gap-1">
            {plan.reviewers.map((r) => (
              <ReviewerAvatar key={r.userId} name={r.name} decision={r.decision} />
            ))}
          </div>
        )}
        <button
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-full",
            "border border-dashed border-[var(--color-border-subtle)]",
            "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
            "hover:border-[var(--color-border-strong)] transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
          )}
          aria-label="Add reviewer"
          title="Add reviewer"
        >
          <UserPlus size={12} />
        </button>
      </div>

      <div className="flex-1" />

      {/* Approval summary */}
      {plan.reviewers.length > 0 && (
        <span
          className={cn(
            "text-[11px] font-medium",
            allApproved
              ? "text-[var(--color-success)]"
              : "text-[var(--color-text-muted)]",
          )}
        >
          {allApproved
            ? "All approved ✓"
            : `${plan.reviewers.filter((r) => r.decision === "approved").length}/${plan.reviewers.length} approved`}
        </span>
      )}

      {/* Action CTAs */}
      {isDraft && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onStatusChange("in_review")}
        >
          Submit for review
        </Button>
      )}

      {isInReview && (
        <Button
          variant={allApproved ? "primary" : "secondary"}
          size="sm"
          onClick={() => onStatusChange(allApproved ? "locked" : "approved")}
          title={allApproved ? "All required reviewers have approved" : "Lock the plan"}
        >
          {allApproved ? "Lock plan" : "Mark approved"}
        </Button>
      )}

      {isLocked && (
        <div className="flex items-center gap-1.5 text-[12px] text-[var(--color-brand)]">
          <Check size={13} strokeWidth={2} />
          Plan locked
        </div>
      )}
    </div>
  );
}
