"use client";

// ─────────────────────────────────────────────
// Re-export zundo's temporal middleware under
// the project's abstraction layer.
//
// Usage in stores:
//   import { temporal } from "@/store/middleware/withHistory";
//   const useMyStore = create(temporal((set) => ({ ... })))
//
// Access undo/redo via the companion hook:
//   const { undo, redo, futureStates, pastStates } =
//     useTemporalStore(useMyStore);
// ─────────────────────────────────────────────

export { temporal } from "zundo";
export { useStore as useTemporalStore } from "zustand";
