"use client";

import { useCallback, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// useKeyboardNav — arrow-key row navigation.
// Returns a ref-setter for the focused row so
// the browser scrolls it into view automatically.
// ─────────────────────────────────────────────

interface UseKeyboardNavOptions {
  ids: string[];
  focusedId: string | null;
  onFocus: (id: string | null) => void;
  onSelect?: (id: string) => void;
  onCheck?: (id: string) => void;
  enabled?: boolean;
}

export function useKeyboardNav({
  ids,
  focusedId,
  onFocus,
  onSelect,
  onCheck,
  enabled = true,
}: UseKeyboardNavOptions) {
  const rowRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerRef = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) {
        rowRefs.current.set(id, el);
      } else {
        rowRefs.current.delete(id);
      }
    },
    [],
  );

  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const currentIdx = focusedId ? ids.indexOf(focusedId) : -1;

      switch (e.key) {
        case "ArrowDown": {
          e.preventDefault();
          const nextIdx = Math.min(currentIdx + 1, ids.length - 1);
          const nextId = ids[nextIdx];
          if (nextId) {
            onFocus(nextId);
            rowRefs.current.get(nextId)?.scrollIntoView({ block: "nearest" });
          }
          break;
        }
        case "ArrowUp": {
          e.preventDefault();
          const prevIdx = Math.max(currentIdx - 1, 0);
          const prevId = ids[prevIdx];
          if (prevId) {
            onFocus(prevId);
            rowRefs.current.get(prevId)?.scrollIntoView({ block: "nearest" });
          }
          break;
        }
        case "Enter": {
          if (focusedId && onSelect) {
            e.preventDefault();
            onSelect(focusedId);
          }
          break;
        }
        case " ": {
          if (focusedId && onCheck) {
            e.preventDefault();
            onCheck(focusedId);
          }
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [ids, focusedId, onFocus, onSelect, onCheck, enabled]);

  return { registerRef };
}
