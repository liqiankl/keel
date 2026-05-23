import { cn } from "@/lib/cn";
import type { RequestSource } from "@/types";

interface SourceBadgeProps {
  source: RequestSource;
  className?: string;
}

const SOURCE_CONFIG: Record<RequestSource, { label: string; classes: string }> = {
  customer:   { label: "Customer",    classes: "bg-[#1a3a2e] text-[#4ade80] border-[#1f5c3e]" },
  internal:   { label: "Internal",    classes: "bg-[#1e1e3a] text-[#8888d0] border-[#2c2c50]" },
  market:     { label: "Market",      classes: "bg-[#2a2010] text-[#f5a623] border-[#4a3818]" },
  leadership: { label: "Leadership",  classes: "bg-[#2a1020] text-[#e06090] border-[#4a1a38]" },
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const { label, classes } = SOURCE_CONFIG[source];
  return (
    <span
      className={cn(
        "inline-flex items-center h-[18px] rounded px-1.5",
        "text-[10px] font-medium leading-none",
        "border",
        classes,
        className,
      )}
    >
      {label}
    </span>
  );
}
