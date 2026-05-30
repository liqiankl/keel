"use client";

import Link from "next/link";
import { Inbox, Lightbulb, BarChart2, Map, Check, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { useInboxStore } from "@/store/useInboxStore";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { deriveWorkflowStages } from "@/lib/workflow";
import { Tooltip } from "@/components/ui/Tooltip";
import type { StageStatus } from "@/types";

type Stage = "inbox" | "ideas" | "prioritization" | "roadmap";

interface WorkflowBarProps {
  currentStage: Stage;
  teamSlug?: string; // accepted for backward compat with existing views, unused
}

const STAGES: {
  key: Stage;
  label: string;
  icon: React.ElementType;
  href: string;
}[] = [
  { key: "inbox",          label: "Inbox",          icon: Inbox,     href: "/inbox"    },
  { key: "ideas",          label: "Ideas",          icon: Lightbulb, href: "/ideas"    },
  { key: "prioritization", label: "Prioritization", icon: BarChart2, href: "/scoring"  },
  { key: "roadmap",        label: "Roadmap",        icon: Map,       href: "/roadmap"  },
];

function StageCircle({ status, icon: Icon }: { status: StageStatus; icon: React.ElementType }) {
  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      {status === "active" && (
        <span className="absolute inline-flex h-[32px] w-[32px] rounded-full bg-[var(--color-brand)]/25 animate-ping-slow" />
      )}
      <div
        className={cn(
          "relative w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150",
          status === "active"     && "bg-[var(--color-brand)] text-white shadow-sm",
          status === "completed"  && "bg-[var(--color-success)]/20 text-[var(--color-success)]",
          status === "locked"     && "bg-[var(--color-bg-selected)] border border-[var(--color-border-strong)] text-[var(--color-text-secondary)]",
          status === "not_started"&& "bg-[var(--color-bg-selected)] border border-[var(--color-border-strong)] text-[var(--color-text-secondary)]",
        )}
      >
        {status === "completed"   && <Check size={13} strokeWidth={2.5} />}
        {status === "locked"      && <Lock  size={11} strokeWidth={2}   />}
        {(status === "active" || status === "not_started") && <Icon size={13} strokeWidth={2} />}
      </div>
    </div>
  );
}

export function WorkflowBar({ currentStage }: WorkflowBarProps) {
  const requests         = useInboxStore((s) => s.requests);
  const inboxCompleted   = useWorkflowStore((s) => s.inboxCompleted);
  const scoringStarted   = useWorkflowStore((s) => s.scoringStarted);

  const stages = deriveWorkflowStages(requests, inboxCompleted, scoringStarted);

  const statusOf = (key: Stage): StageStatus => stages[key];

  const isClickable = (status: StageStatus) => status !== "not_started";

  return (
    <div className="flex items-center px-6 h-12 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] flex-shrink-0">
      {STAGES.map((stage, i) => {
        const status   = statusOf(stage.key);
        const isActive = stage.key === currentStage;
        const clickable = isClickable(status);
        const Icon     = stage.icon;

        const stepContent = (
          <div
            className={cn(
              "group/step flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-150",
              isActive    && "bg-[var(--color-brand)]/10",
              clickable && !isActive && status === "completed" && "hover:bg-[var(--color-brand)]/8 cursor-pointer",
              clickable && !isActive && status === "locked"    && "hover:bg-[var(--color-bg-hover)] cursor-pointer",
              !clickable  && "cursor-default",
            )}
          >
            {status === "locked" ? (
              <Tooltip
                content="This stage is locked because prioritization scoring has started. To make changes, reset prioritization."
                placement="bottom"
                width={260}
              >
                <span className="flex items-center gap-2">
                  <StageCircle status={status} icon={Icon} />
                  <span className="text-[13px] font-medium whitespace-nowrap leading-none text-[var(--color-text-secondary)]">
                    {stage.label}
                  </span>
                </span>
              </Tooltip>
            ) : (
              <>
                <StageCircle status={status} icon={Icon} />
                <span
                  className={cn(
                    "text-[13px] font-medium whitespace-nowrap leading-none transition-colors duration-150",
                    status === "active"      && "text-[var(--color-brand)]",
                    status === "completed"   && "text-[var(--color-text-secondary)]",
                    status === "not_started" && "text-[var(--color-text-secondary)]",
                  )}
                >
                  {stage.label}
                </span>
              </>
            )}
          </div>
        );

        return (
          <div key={stage.key} className="flex items-center">
            {clickable && stage.key !== currentStage ? (
              <Link href={stage.href}>{stepContent}</Link>
            ) : stepContent}

            {i < STAGES.length - 1 && (
              <div className="flex items-center mx-1">
                <div
                  className={cn(
                    "w-8 h-px transition-colors",
                    statusOf(STAGES[i].key) === "completed" ? "bg-[var(--color-success)]/60" : "bg-[var(--color-border-strong)]",
                  )}
                />
                <svg
                  width="5" height="8" viewBox="0 0 5 8"
                  className={cn(
                    statusOf(STAGES[i].key) === "completed" ? "text-[var(--color-success)]/60" : "text-[var(--color-border-strong)]",
                  )}
                >
                  <path d="M1 1l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
