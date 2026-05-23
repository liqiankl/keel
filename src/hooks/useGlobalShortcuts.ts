"use client";

import { useEffect } from "react";

// ─────────────────────────────────────────────
// useGlobalShortcuts — app-level key bindings.
// Fires only when focus is NOT inside an input.
// ─────────────────────────────────────────────

interface ShortcutMap {
  c?: () => void;         // Create new issue
  escape?: () => void;    // Close modal/panel
  undo?: () => void;      // Cmd/Ctrl+Z
  redo?: () => void;      // Cmd/Ctrl+Shift+Z
}

export function useGlobalShortcuts(shortcuts: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const inInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      const meta = e.metaKey || e.ctrlKey;

      if (meta && e.key === "z") {
        if (e.shiftKey) {
          e.preventDefault();
          shortcuts.redo?.();
        } else {
          e.preventDefault();
          shortcuts.undo?.();
        }
        return;
      }

      if (inInput) return;

      if (e.key === "c" || e.key === "C") {
        shortcuts.c?.();
      }
      if (e.key === "Escape") {
        shortcuts.escape?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, enabled]);
}
