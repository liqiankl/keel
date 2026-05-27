"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface NextPhaseOption {
  label: string;
  href: string;
  color?: string;
}

interface NextPhaseBarProps {
  nextPhase: string;
  options: NextPhaseOption[];
}

export function NextPhaseBar({ nextPhase, options }: NextPhaseBarProps) {
  return (
    <div className="flex items-center gap-3 px-5 h-12 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] flex-shrink-0">
      <span className="text-[12px] text-[var(--color-text-muted)]">
        Ready for the next phase?
      </span>

      <div className="flex items-center gap-2">
        {options.map((opt) => (
          <Link
            key={opt.href}
            href={opt.href}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium transition-colors",
              "border border-[var(--color-brand)]/30 text-[var(--color-brand)]",
              "hover:bg-[var(--color-brand)]/10",
            )}
          >
            {options.length > 1 && opt.color && (
              <span
                className="h-2 w-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: opt.color }}
              />
            )}
            {opt.label}
            <ArrowRight size={12} />
          </Link>
        ))}
      </div>
    </div>
  );
}
