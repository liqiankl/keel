"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useStore } from "zustand";
import { Header } from "@/components/layout/Header";
import { FilterTabs } from "./FilterTabs";
import { BulkActionBar } from "./BulkActionBar";
import { RequestList } from "./RequestList";
import { RequestDetail } from "./RequestDetail";
import { NewRequestModal } from "./NewRequestModal";
import { WorkflowBar } from "@/components/workflow/WorkflowBar";
import { NextPhaseBar } from "@/components/workflow/NextPhaseBar";
import { useInboxStore, selectFilteredRequests } from "@/store/useInboxStore";
import { useAppStore } from "@/store/useAppStore";
import { useScoringStore } from "@/store/useScoringStore";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { useGuestSession } from "@/context/GuestSessionContext";
import { buildDisplayIdMap } from "@/lib/format";
import { TEAMS, CURRENT_QUARTER } from "@/lib/constants";
import { EmptyState } from "@/components/ui/EmptyState";
import { Inbox, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import type { RequestStatus, FilterTab, FeatureRequest } from "@/types";

const VALID_TABS = new Set<FilterTab>(["active", "all", "new", "triaged", "archived", "backlog"]);

interface InboxViewProps {
  initialTeam?: string;
  initialTab?: string;
  title?: string;
  visibleTabs?: FilterTab[];
}

export function InboxView({ initialTeam, initialTab, title = "Inbox", visibleTabs }: InboxViewProps = {}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [prioritizeToast, setPrioritizeToast] = useState<string | null>(null);
  const phasesActed    = useAppStore((s) => s.phasesActed);
  const markPhaseActed = useAppStore((s) => s.markPhaseActed);
  const phaseKey       = initialTeam ? `ideas:${initialTeam}` : null;
  const hasActed       = phaseKey ? phasesActed.includes(phaseKey) : false;

  const { isGuest, session } = useGuestSession();

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
  } = useInboxStore();

  const temporal = useStore(useInboxStore.temporal);

  const activeTeamId = useAppStore((s) => s.activeTeamId);
  const setActiveTeamId = useAppStore((s) => s.setActiveTeamId);
  const addInitiative = useScoringStore((s) => s.addInitiative);

  useEffect(() => {
    if (initialTeam) {
      const team = TEAMS.find((t) => t.slug === initialTeam);
      if (team) setActiveTeamId(team.id);
    }
    if (initialTab && VALID_TABS.has(initialTab as FilterTab)) {
      setFilter("tab", initialTab as FilterTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTeam, initialTab]);

  const filteredRequests = useMemo(
    () => selectFilteredRequests({ requests, filters }, activeTeamId),
    [requests, filters, activeTeamId],
  );

  const displayIdMap = useMemo(() => buildDisplayIdMap(requests), [requests]);

  const openRequest = openId ? requests.find((r) => r.id === openId) ?? null : null;

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

  if (isGuest && !initialTeam) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <Header title={title} />
        <div className="flex flex-1 items-center justify-center">
          <EmptyState
            Icon={Inbox}
            title="Your inbox is empty"
            description={`Welcome to ${session?.workspaceName ?? "the workspace"}! Feature requests submitted across teams will appear here once you start contributing.`}
          />
        </div>
      </div>
    );
  }

  const handleSendToPrioritize = useCallback((id: string) => {
    const request = requests.find((r) => r.id === id);
    if (!request) return;
    const priority =
      request.prioritySignal === "critical" ? "urgent" :
      request.prioritySignal === "important" ? "high" : "low";
    const teamId = initialTeam ? TEAMS.find((t) => t.slug === initialTeam)?.id : undefined;
    addInitiative({
      id:                `init_${id}_${Date.now()}`,
      teamId,
      featureRequestId:  id,
      title:             request.title,
      description:       request.description,
      assignedPmId:      "u_pm_01",
      goalIds:           request.goalIds,
      productArea:       request.productArea ?? "",
      status:            "backlog",
      priority,
      effort:            { unit: "story_points", points: null, tshirt: null, weeks: null },
      quarter:           CURRENT_QUARTER,
      score:             null,
      dependencies:      [],
      jiraEpicId:        null,
      linearProjectId:   null,
      createdAt:         new Date().toISOString(),
      updatedAt:         new Date().toISOString(),
    });
    setStatus(id, "triaged");
    setPrioritizeToast(request.title);
    setTimeout(() => setPrioritizeToast(null), 3500);
    if (phaseKey) markPhaseActed(phaseKey);
  }, [requests, addInitiative, setStatus, phaseKey, markPhaseActed, initialTeam]);

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

  function handleBulkSendToPrioritize() {
    selectedIds.forEach((id) => handleSendToPrioritize(id));
    clearSelection();
  }

  function handleBulkTag() {
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

  const hasDetail = openRequest !== null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title={title} />
      {initialTeam && <WorkflowBar currentStage="ideas" teamSlug={initialTeam} />}

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
        visibleTabs={visibleTabs}
        searchPlaceholder={initialTeam ? "Search ideas…" : "Search requests…"}
      />

      <BulkActionBar
        selectedCount={selectedIds.length}
        onBulkStatus={handleBulkStatus}
        onBulkTag={handleBulkTag}
        onClearSelection={clearSelection}
        onSendToPrioritize={initialTeam ? handleBulkSendToPrioritize : undefined}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
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
            onSendToPrioritize={initialTeam ? handleSendToPrioritize : undefined}
            allowedStatuses={initialTeam ? ["new", "triaged"] : undefined}
            statusLabels={initialTeam ? { triaged: "Backlog" } : undefined}
            hideStatusIcon={!!initialTeam}
          />
        </div>

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
              onSendToPrioritize={initialTeam ? handleSendToPrioritize : undefined}
              allowedStatuses={initialTeam ? ["new", "triaged"] : undefined}
              statusLabels={initialTeam ? { triaged: "Backlog" } : undefined}
            />
          </div>
        )}
      </div>

      <NewRequestModal
        open={newModalOpen}
        onClose={() => setNewModalOpen(false)}
        onSubmit={(req) => {
          addRequest(req);
          setOpenId(req.id);
        }}
      />

      {/* ── Next phase bar ── */}
      {initialTeam && hasActed && (
        <NextPhaseBar
          nextPhase="Prioritization"
          options={[{ label: "Prioritization", href: `/team/${initialTeam}/prioritization` }]}
        />
      )}

      {prioritizeToast && (
        <div className={cn(
          "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg",
          "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
          "text-[12px] text-[var(--color-text-secondary)]",
          "animate-in fade-in slide-in-from-bottom-2 duration-200",
        )}>
          <Check size={13} className="text-[var(--color-success)]" />
          <span>Sent to <span className="font-semibold text-[var(--color-text-primary)]">Prioritization</span></span>
        </div>
      )}
    </div>
  );
}
