"use client";

import { useMemo, useState, useCallback } from "react";
import { useStore } from "zustand";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { FilterTabs } from "./FilterTabs";
import { BulkActionBar } from "./BulkActionBar";
import { RequestList } from "./RequestList";
import { RequestDetail } from "./RequestDetail";
import { NewRequestModal } from "./NewRequestModal";
import { useInboxStore, selectFilteredRequests } from "@/store/useInboxStore";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { buildDisplayIdMap } from "@/lib/format";
import type { RequestStatus } from "@/types";

// ─────────────────────────────────────────────
// InboxView — root client component for /inbox.
// Orchestrates:
//   - store reads/writes
//   - split-view layout (list | detail)
//   - keyboard shortcuts
//   - modal state
// ─────────────────────────────────────────────

export function InboxView() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);

  // ── Store reads ──
  const {
    requests,
    filters,
    selectedIds,
    focusedId,
    setFilter,
    setFocusedId,
    addRequest,
    setStatus,
    bulkSetStatus,
    setTags,
    toggleSelectId,
    selectAll,
    clearSelection,
    resetFilters,
  } = useInboxStore();

  // Undo/redo via zundo temporal
  const temporal = useStore(useInboxStore.temporal);

  // ── Derived state ──
  // useMemo instead of a second useInboxStore selector — avoids the
  // useSyncExternalStore "getSnapshot must be cached" infinite loop that
  // fires when a selector always returns a new array reference.
  const filteredRequests = useMemo(
    () => selectFilteredRequests({ requests, filters }),
    [requests, filters],
  );

  const displayIdMap = useMemo(() => buildDisplayIdMap(requests), [requests]);

  const openRequest = openId ? requests.find((r) => r.id === openId) ?? null : null;

  // ── Event handlers ──
  function handleOpen(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function handleCloseDetail() {
    setOpenId(null);
  }

  function handleStatusChange(id: string, status: RequestStatus) {
    setStatus(id, status);
  }

  function handleBulkStatus(status: RequestStatus) {
    bulkSetStatus(selectedIds, status);
    clearSelection();
  }

  function handleBulkTag() {
    // Phase 2: simple tag prompt; Phase 3 will use a proper tag picker
    const tag = window.prompt("Add tag to selected requests:");
    if (tag?.trim()) {
      selectedIds.forEach((id) => {
        const req = requests.find((r) => r.id === id);
        if (req && !req.tags.includes(tag.trim().toLowerCase())) {
          setTags(id, [...req.tags, tag.trim().toLowerCase()]);
        }
      });
      clearSelection();
    }
  }

  function handleSelectAll() {
    if (selectedIds.length === filteredRequests.length) {
      clearSelection();
    } else {
      selectAll(filteredRequests.map((r) => r.id));
    }
  }

  // ── Global keyboard shortcuts ──
  useGlobalShortcuts({
    c: () => setNewModalOpen(true),
    escape: () => {
      if (newModalOpen) return;
      if (openId) { setOpenId(null); return; }
      if (selectedIds.length > 0) { clearSelection(); return; }
    },
    undo: () => temporal.undo(),
    redo: () => temporal.redo(),
  });

  const hasDetail = openRequest !== null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Top header ── */}
      <Header
        title="Active issues"
        rightSlot={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setNewModalOpen(true)}
            className="gap-1.5"
            aria-label="Create new request (C)"
            title="Create request (C)"
          >
            <Plus size={13} />
            New request
          </Button>
        }
        showViewToggle
      />

      {/* ── Filter tabs + search ── */}
      <FilterTabs
        activeTab={filters.tab}
        requests={requests}
        onTabChange={(tab) => {
          setFilter("tab", tab);
          setOpenId(null);
          clearSelection();
        }}
        searchValue={filters.search}
        onSearchChange={(v) => setFilter("search", v)}
      />

      {/* ── Bulk action bar (conditional) ── */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onBulkStatus={handleBulkStatus}
        onBulkTag={handleBulkTag}
        onClearSelection={clearSelection}
      />

      {/* ── Main content: list + detail split view ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Request list — shrinks when detail is open */}
        <div
          className="flex flex-col overflow-hidden transition-all duration-200"
          style={{ flex: hasDetail ? "0 0 55%" : "1 1 0%" }}
        >
          <RequestList
            allRequests={requests}
            filteredRequests={filteredRequests}
            activeTab={filters.tab}
            openId={openId}
            checkedIds={selectedIds}
            focusedId={focusedId}
            onOpen={handleOpen}
            onCheck={toggleSelectId}
            onStatusChange={handleStatusChange}
            onFocus={setFocusedId}
            onAddToGroup={() => setNewModalOpen(true)}
          />
        </div>

        {/* Detail panel — slides in from right */}
        {hasDetail && (
          <div
            className="flex flex-col overflow-hidden"
            style={{ flex: "0 0 45%" }}
          >
            <RequestDetail
              request={openRequest}
              displayId={displayIdMap[openRequest.id] ?? "KEL-???"}
              onClose={handleCloseDetail}
              onStatusChange={handleStatusChange}
              onTagsChange={setTags}
            />
          </div>
        )}
      </div>

      {/* ── New request modal ── */}
      <NewRequestModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onSubmit={(req) => {
          addRequest(req);
          setOpenId(req.id);
        }}
      />
    </div>
  );
}
