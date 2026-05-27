import { cn } from "@/lib/cn";
import type { RequestSource } from "@/types";

interface SourceBadgeProps {
  source: RequestSource;
  className?: string;
}

const SOURCE_CONFIG: Record<RequestSource, { label: string; color: string }> = {
  customer:    { label: "Customer",    color: "#22c55e" },
  engineering: { label: "Engineering", color: "#f59e0b" },
  internal:    { label: "Internal",    color: "#818cf8" },
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const { label, color } = SOURCE_CONFIG[source] ?? { label: source, color: "#94a3b8" };
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
