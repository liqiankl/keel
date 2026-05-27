"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import type {
  FeatureRequest,
  RequestStatus,
  FilterTab,
} from "@/types";
import { SEED_REQUESTS, SEED_REQUESTS_HITCHHIKER } from "@/lib/seed";

const ALL_SEED_REQUESTS = [...SEED_REQUESTS, ...SEED_REQUESTS_HITCHHIKER];

// ─────────────────────────────────────────────
// Inbox store — feature requests, triage.
// Wrapped with zundo temporal for undo/redo.
// Access history: useTemporalStore(useInboxStore)
// ─────────────────────────────────────────────

interface InboxFilters {
  tab: FilterTab;
  search: string;
}

interface InboxState {
  requests: FeatureRequest[];
  filters: InboxFilters;
  selectedIds: string[];
  focusedId: string | null;

  addRequest: (req: FeatureRequest) => void;
  updateRequest: (id: string, patch: Partial<FeatureRequest>) => void;
  removeRequest: (id: string) => void;
  mergeRequests: (primaryId: string, sourceIds: string[]) => void;
  setStatus: (id: string, status: RequestStatus) => void;
  bulkSetStatus: (ids: string[], status: RequestStatus) => void;
  setTags: (id: string, tags: string[]) => void;
  bulkAddTag: (ids: string[], tag: string) => void;
  toggleSelectId: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
  setFocusedId: (id: string | null) => void;
  setFilter: <K extends keyof InboxFilters>(key: K, value: InboxFilters[K]) => void;
}

const DEFAULT_FILTERS: InboxFilters = {
  tab: "active",
  search: "",
};

export const useInboxStore = create<InboxState>()(
  temporal(
    persist<InboxState, [], [], Pick<InboxState, "requests">>(
      (set) => ({
        requests: ALL_SEED_REQUESTS,
        filters: DEFAULT_FILTERS,
        selectedIds: [],
        focusedId: null,

      addRequest: (req) =>
        set((s) => ({ requests: [req, ...s.requests] })),

      updateRequest: (id, patch) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),

      removeRequest: (id) =>
        set((s) => ({ requests: s.requests.filter((r) => r.id !== id) })),

      mergeRequests: (primaryId, sourceIds) =>
        set((s) => {
          const primary = s.requests.find((r) => r.id === primaryId);
          if (!primary) return s;
          const sources = s.requests.filter((r) => sourceIds.includes(r.id));
          return {
            requests: s.requests
              .filter((r) => !sourceIds.includes(r.id))
              .map((r) =>
                r.id === primaryId
                  ? {
                      ...r,
                      votes: [...r.votes, ...sources.flatMap((sr) => sr.votes)],
                      mergedFromIds: [...r.mergedFromIds, ...sourceIds],
                    }
                  : r,
              ),
          };
        }),

      setStatus: (id, status) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)),
        })),

      bulkSetStatus: (ids, status) =>
        set((s) => ({
          requests: s.requests.map((r) => (ids.includes(r.id) ? { ...r, status } : r)),
        })),

      setTags: (id, tags) =>
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, tags } : r)),
        })),

      bulkAddTag: (ids, tag) =>
        set((s) => ({
          requests: s.requests.map((r) =>
            ids.includes(r.id) && !r.tags.includes(tag)
              ? { ...r, tags: [...r.tags, tag] }
              : r,
          ),
        })),

      toggleSelectId: (id) =>
        set((s) => ({
          selectedIds: s.selectedIds.includes(id)
            ? s.selectedIds.filter((sid) => sid !== id)
            : [...s.selectedIds, id],
        })),

      selectAll: (ids) => set({ selectedIds: ids }),
      clearSelection: () => set({ selectedIds: [] }),
      setFocusedId: (id) => set({ focusedId: id }),

      setFilter: (key, value) =>
        set((s) => ({ filters: { ...s.filters, [key]: value } })),
      }),
      {
        name: "keel-inbox",
        partialize: (s) => ({ requests: s.requests }),
      },
    ) as any,
    {
      limit: 50,
      partialize: (s) => ({ requests: s.requests }),
    },
  ),
);

// ── Derived selectors ──────────────────────

// Accepts a subset so callers can pass { requests, filters } from useMemo
// without needing the full InboxState (avoids a second useStore subscription).
export function selectFilteredRequests(
  state: Pick<InboxState, "requests" | "filters">,
  teamId?: string,
): FeatureRequest[] {
  const { requests, filters } = state;
  return requests.filter((r) => {
    // Team isolation: default to "team_navigators" for untagged legacy requests
    const rTeam = r.teamId ?? "team_navigators";
    if (teamId && rTeam !== teamId) return false;
    if (filters.tab === "active"   && r.status === "archived") return false;
    if (filters.tab === "new"      && r.status !== "new") return false;
    if (filters.tab === "triaged"  && r.status !== "triaged") return false;
    if (filters.tab === "archived" && r.status !== "archived") return false;
    if (filters.tab === "backlog"  && r.status !== "triaged") return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!r.title.toLowerCase().includes(q) && !r.description.toLowerCase().includes(q))
        return false;
    }
    return true;
  });
}
