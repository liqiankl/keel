import { cn } from "@/lib/cn";
import type { PrioritySignal } from "@/types";

interface PrioritySignalBadgeProps {
  signal: PrioritySignal;
  showLabel?: boolean;
  className?: string;
}

const SIGNAL_CONFIG: Record<PrioritySignal, {
  label: string;
  dot: string;
  ariaLabel: string;
}> = {
  critical:     { label: "Critical",     dot: "bg-[var(--color-priority-urgent)]", ariaLabel: "Critical priority signal" },
  important:    { label: "Important",    dot: "bg-[var(--color-priority-medium)]", ariaLabel: "Important priority signal" },
  nice_to_have: { label: "Nice to have", dot: "bg-[var(--color-text-muted)]",      ariaLabel: "Nice to have priority signal" },
};

export function PrioritySignalBadge({
  signal,
  showLabel = false,
  className,
}: PrioritySignalBadgeProps) {
  const { label, dot, ariaLabel } = SIGNAL_CONFIG[signal];

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 flex-shrink-0", className)}
      aria-label={ariaLabel}
      title={label}
    >
      <span
        className={cn("h-[7px] w-[7px] rounded-full flex-shrink-0", dot)}
        aria-hidden="true"
      />
      {showLabel && (
        <span className="text-[11px] text-[var(--color-text-muted)]">{label}</span>
      )}
    </span>
  );
}
