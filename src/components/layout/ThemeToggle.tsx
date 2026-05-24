"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/cn";
import { useTheme, type Theme } from "@/hooks/useTheme";

const CONFIG: Record<Theme, { Icon: typeof Sun; label: string }> = {
  system: { Icon: Monitor, label: "System" },
  light:  { Icon: Sun,     label: "Light"  },
  dark:   { Icon: Moon,    label: "Dark"   },
};

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();
  const { Icon, label } = CONFIG[theme];

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${label} — click to cycle`}
      aria-label={`Current theme: ${label}. Click to change.`}
      className={cn(
        "w-full flex items-center gap-2 h-[28px] px-2 rounded-md text-[12px]",
        "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)]",
        "hover:text-[var(--color-text-secondary)] transition-colors",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
      )}
    >
      <Icon size={13} />
      <span>{label}</span>
    </button>
  );
}
