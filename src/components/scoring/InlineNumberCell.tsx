"use client";

import { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/cn";

interface InlineNumberCellProps {
  value: number;
  onChange: (v: number) => void;
  onTabNext?: () => void;    // called on Tab to move to next editable cell
  onTabPrev?: () => void;    // called on Shift+Tab
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  "data-col"?: string;
  "data-initiative"?: string;
}

export function InlineNumberCell({
  value,
  onChange,
  onTabNext,
  onTabPrev,
  min,
  max,
  step = 1,
  suffix,
  className,
  "data-col": dataCol,
  "data-initiative": dataInitiative,
}: InlineNumberCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = useCallback(() => {
    setDraft(String(value));
    setEditing(true);
    // Input renders on next tick; focus via ref
    requestAnimationFrame(() => {
      inputRef.current?.select();
    });
  }, [value]);

  const commit = useCallback(() => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      const clamped =
        min !== undefined && max !== undefined
          ? Math.min(max, Math.max(min, parsed))
          : min !== undefined
          ? Math.max(min, parsed)
          : max !== undefined
          ? Math.min(max, parsed)
          : parsed;
      onChange(clamped);
    }
    setEditing(false);
  }, [draft, min, max, onChange]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDraft("");
  }, []);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        value={draft}
        min={min}
        max={max}
        step={step}
        autoFocus
        data-col={dataCol}
        data-initiative={dataInitiative}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); commit(); }
          if (e.key === "Escape") { e.preventDefault(); cancel(); }
          if (e.key === "Tab") {
            e.preventDefault();
            commit();
            if (e.shiftKey) onTabPrev?.();
            else onTabNext?.();
          }
        }}
        className={cn(
          "h-full w-full bg-[var(--color-bg-elevated)] border border-[var(--color-brand)]",
          "text-right text-[12px] font-mono text-[var(--color-text-primary)]",
          "rounded px-1.5 focus:outline-none tabular-nums",
          // Hide number input spin buttons
          "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      tabIndex={0}
      data-col={dataCol}
      data-initiative={dataInitiative}
      onClick={startEdit}
      onFocus={startEdit}
      className={cn(
        "flex h-full w-full items-center justify-end gap-0.5 rounded px-1.5",
        "text-[12px] font-mono text-[var(--color-text-secondary)] tabular-nums",
        "hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
        "transition-colors cursor-text select-text",
        className,
      )}
    >
      <span>{value}</span>
      {suffix && (
        <span className="text-[10px] text-[var(--color-text-muted)]">{suffix}</span>
      )}
    </button>
  );
}
