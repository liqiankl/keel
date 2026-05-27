import { cn } from "@/lib/cn";
import type { RequestSource } from "@/types";

interface SourceBadgeProps {
  source: RequestSource;
  className?: string;
}

const SOURCE_CONFIG: Record<RequestSource, { label: string; color: string }> = {
  customer:   { label: "Customer",   color: "#22c55e" },
  internal:   { label: "Internal",   color: "#818cf8" },
  market:     { label: "Market",     color: "#f59e0b" },
  leadership: { label: "Leadership", color: "#ec4899" },
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const { label, color } = SOURCE_CONFIG[source];
  return (
    <span
      className={cn(
        "inline-flex items-center h-[18px] rounded px-1.5",
        "text-[11px] font-medium leading-none border",
        className,
      )}
      style={{
        color,
        backgroundColor: `${color}18`,
        borderColor: `${color}33`,
      }}
    >
      {label}
    </span>
  );
}
