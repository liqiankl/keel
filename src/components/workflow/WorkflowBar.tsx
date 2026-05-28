"use client";

import Link from "next/link";
import { Inbox, Lightbulb, BarChart2, Map, Check, Pencil } from "lucide-react";
import { cn } from "@/lib/cn";

type Stage = "inbox" | "ideas" | "prioritize" | "roadmap";

interface WorkflowBarProps {
  currentStage: Stage;
  teamSlug?: string;
}

const STAGES: {
  key: Stage;
  label: string;
  icon: React.ElementType;
  href: (slug: string) => string;
}[] = [
  { key: "inbox",      label: "Inbox",      icon: Inbox,     href: ()     => "/inbox" },
  { key: "ideas",      label: "Ideas",      icon: Lightbulb, href: (slug) => `/team/${slug}/ideas` },
  { key: "prioritize", label: "Prioritization", icon: BarChart2,  href: (slug) => `/team/${slug}/prioritization` },
  { key: "roadmap",    label: "Roadmap",    icon: Map,        href: (slug) => `/team/${slug}/roadmap` },
];

export function WorkflowBar({ currentStage, teamSlug }: WorkflowBarProps) {
  const activeIndex = STAGES.findIndex((s) => s.key === currentStage);

  return (
    <div className="flex items-center px-6 h-12 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] flex-shrink-0">
      {STAGES.map((stage, i) => {
        const isActive = stage.key === currentStage;
        const isPast   = i < activeIndex;
        const isFuture = i > activeIndex;
        const Icon     = stage.icon;

        const editHref = isPast && stage.key !== "inbox"
          ? (teamSlug ? stage.href(teamSlug) : null)
          : null;

        const stepContent = (
          <div
            className={cn(
              "group/step flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-150",
              isActive  && "bg-[var(--color-brand)]/10",
              isPast && editHref  && "hover:bg-[var(--color-brand)]/10 cursor-pointer",
              isPast && !editHref && "cursor-default",
              isFuture  && "opacity-40 cursor-default",
            )}
          >
            {/* Circle — swaps ✓ → pencil on hover for past stages */}
            <div className="relative flex items-center justify-center flex-shrink-0">
              {isActive && (
                <span className="absolute inline-flex h-[32px] w-[32px] rounded-full bg-[var(--color-brand)]/25 animate-ping-slow" />
              )}
              <div
                className={cn(
                  "relative w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150",
                  isActive  && "bg-[var(--color-brand)] text-white shadow-sm",
                  isPast && editHref  && "bg-[var(--color-success)]/20 text-[var(--color-success)] group-hover/step:bg-[var(--color-brand)] group-hover/step:text-white group-hover/step:shadow-sm",
                  isPast && !editHref && "bg-[var(--color-success)]/20 text-[var(--color-success)]",
                  isFuture  && "bg-[var(--color-bg-hover)] border border-[var(--color-border-strong)] text-[var(--color-text-muted)]",
                )}
              >
                {isPast ? (
                  <>
                    <Check  size={16} strokeWidth={2.5} className={cn("absolute", editHref && "transition-opacity duration-150 group-hover/step:opacity-0")} />
                    {editHref && <Pencil size={15} strokeWidth={2} className="transition-opacity duration-150 opacity-0 group-hover/step:opacity-100 absolute" />}
                  </>
                ) : (
                  <Icon size={16} strokeWidth={2} />
                )}
              </div>
            </div>

            {/* Label */}
            <span
              className={cn(
                "text-[13px] font-medium whitespace-nowrap leading-none transition-colors duration-150",
                isActive  && "text-[var(--color-brand)]",
                isPast && editHref  && "text-[var(--color-text-secondary)] group-hover/step:text-[var(--color-brand)]",
                isPast && !editHref && "text-[var(--color-text-secondary)]",
                isFuture  && "text-[var(--color-text-muted)]",
              )}
            >
              {stage.label}
            </span>
          </div>
        );

        return (
          <div key={stage.key} className="flex items-center">
            {isPast && editHref ? (
              <Link href={editHref} title={`Edit ${stage.label}`}>
                {stepContent}
              </Link>
            ) : stepContent}

            {/* Connector */}
            {i < STAGES.length - 1 && (
              <div className="flex items-center mx-1">
                <div
                  className={cn(
                    "w-8 h-px transition-colors",
                    i < activeIndex ? "bg-[var(--color-success)]/40" : "bg-[var(--color-border-subtle)]",
                  )}
                />
                <svg width="5" height="8" viewBox="0 0 5 8" className={cn(
                  i < activeIndex ? "text-[var(--color-success)]/40" : "text-[var(--color-border-subtle)]",
                )}>
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
