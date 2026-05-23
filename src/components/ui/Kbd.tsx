import { cn } from "@/lib/cn";

// Keyboard shortcut badge
interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center rounded px-1 py-0.5",
        "font-mono text-[11px] leading-none",
        "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]",
        "border border-[var(--color-border-subtle)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
