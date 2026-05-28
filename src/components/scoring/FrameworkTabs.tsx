"use client";

import { useState, useCallback, useRef } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { FrameworkInfoPopover } from "./FrameworkInfoPopover";
import type { ScoringFramework } from "@/types";

const FRAMEWORKS: { id: ScoringFramework; label: string; description: string }[] = [
  { id: "rice",   label: "RICE",   description: "Reach × Impact × Confidence / Effort" },
  { id: "moscow", label: "MoSCoW", description: "Must, Should, Could, Won't"            },
  { id: "wsjf",   label: "WSJF",   description: "Weighted Shortest Job First"            },
];

interface FrameworkTabsProps {
  active: ScoringFramework;
  onChange: (f: ScoringFramework) => void;
}

export function FrameworkTabs({ active, onChange }: FrameworkTabsProps) {
  const [openPopover, setOpenPopover] = useState<ScoringFramework | null>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInfoEnter = useCallback((fw: ScoringFramework) => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setOpenPopover(fw);
  }, []);

  const handleInfoLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setOpenPopover(null), 120);
  }, []);

  const handlePopoverEnter = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  }, []);

  const closePopover = useCallback(() => setOpenPopover(null), []);

  return (
    <div className="relative flex-shrink-0">
      <div
        className="flex items-center gap-0 border-b border-[var(--color-border-subtle)] px-4 h-10"
        role="tablist"
        aria-label="Prioritization framework"
      >
        {FRAMEWORKS.map((fw) => {
          const isActive   = active === fw.id;
          const isInfoOpen = openPopover === fw.id;

          return (
            <div key={fw.id} className="relative flex items-center h-full">
              {/* Framework tab */}
              <button
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(fw.id)}
                className={cn(
                  "relative flex items-center h-full px-3 text-[13px] transition-colors duration-100",
                  "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-[-2px]",
                  isActive
                    ? "text-[var(--color-text-primary)] font-medium"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                {fw.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[var(--color-brand)]"
                    aria-hidden="true"
                  />
                )}
              </button>

              {/* Info icon — hover to reveal popover */}
              <button
                type="button"
                aria-label={`About ${fw.label}`}
                aria-expanded={isInfoOpen}
                onMouseEnter={() => handleInfoEnter(fw.id)}
                onMouseLeave={handleInfoLeave}
                onFocus={() => handleInfoEnter(fw.id)}
                onBlur={handleInfoLeave}
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full -ml-1 mr-1",
                  "transition-all duration-100 focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
                  isInfoOpen
                    ? "bg-[var(--color-brand)]/15 text-[var(--color-brand)]"
                    : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]",
                )}
              >
                <Info size={13} strokeWidth={2} />
              </button>

              {/* Popover anchored below this tab's icon */}
              <FrameworkInfoPopover
                framework={fw.id}
                open={isInfoOpen}
                onClose={closePopover}
                onMouseEnter={handlePopoverEnter}
                onMouseLeave={handleInfoLeave}
              />
            </div>
          );
        })}

        <div className="flex-1" />
      </div>
    </div>
  );
}
