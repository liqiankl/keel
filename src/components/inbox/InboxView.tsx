"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [prioritizeToast, setPrioritizeToast] = useState<string | null>(null);
  const [ideasToast, setIdeasToast] = useState<{ title: string; team: string } | null>(null);
  const markPhaseActed = useAppStore((s) => s.markPhaseActed);
  const phaseKey       = initialTeam ? `ideas:${initialTeam}` : null;
  const allInitiatives = useScoringStore((s) => s.initiatives);

  const teamId = initialTeam ? TEAMS.find((t) => t.slug === initialTeam)?.id : undefined;
  const hasActed = !!teamId && allInitiatives.some(
    (i) => i.teamId === teamId && !!i.featureRequestId,
  );

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
    updateRequest,
    removeRequest,
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

  // Team-scoped but not tab-filtered — used for accurate tab counts.
  const baseRequests = useMemo(() => {
    if (activeTeamId) return requests.filter((r) => r.teamId === activeTeamId);
    return requests.filter((r) => r.teamId == null);
  }, [requests, activeTeamId]);

  // Auto-navigate to prioritization when all ideas have been sent there.
  const newIdeasCount = useMemo(
    () => baseRequests.filter((r) => r.status === "new").length,
    [baseRequests],
  );
  const prevNewIdeasCount = useRef<number | null>(null);
  useEffect(() => {
    if (!initialTeam) return;
    if (prevNewIdeasCount.current === null) {
      prevNewIdeasCount.current = newIdeasCount;
      return;
    }
    if (prevNewIdeasCount.current > 0 && newIdeasCount === 0 && hasActed) {
      const t = setTimeout(() => router.push(`/team/${initialTeam}/prioritization`), 1200);
      return () => clearTimeout(t);
    }
    prevNewIdeasCount.current = newIdeasCount;
  }, [newIdeasCount, hasActed, initialTeam, router]);

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
    setOpenId(null);
    clearSelection();
    setPrioritizeToast(request.title);
    setTimeout(() => setPrioritizeToast(null), 3500);
    if (phaseKey) markPhaseActed(phaseKey);
  }, [requests, addInitiative, setStatus, phaseKey, markPhaseActed, initialTeam]);

  const handleSendToIdeas = useCallback((id: string, teamId: string) => {
    const request = requests.find((r) => r.id === id);
    if (!request) return;
    const team = TEAMS.find((t) => t.id === teamId);
    updateRequest(id, { teamId });
    if (openId === id) setOpenId(null);
    setIdeasToast({ title: request.title, team: team?.name ?? teamId });
    setTimeout(() => setIdeasToast(null), 3500);
  }, [requests, updateRequest, openId]);

  const handleBulkSendToIdeas = useCallback((teamId: string) => {
    selectedIds.forEach((id) => handleSendToIdeas(id, teamId));
    clearSelection();
  }, [selectedIds, handleSendToIdeas, clearSelection]);

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
  const detailPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (detailPanelRef.current?.contains(target)) return;
      if (target.closest('[role="row"]')) return;
      setOpenId(null);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [openId]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title={title} />
      {initialTeam && <WorkflowBar currentStage="ideas" teamSlug={initialTeam} />}

      {(!visibleTabs || visibleTabs.length > 1) && (
        <FilterTabs
          activeTab={filters.tab}
          requests={baseRequests}
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
      )}

      <BulkActionBar
        selectedCount={selectedIds.length}
        onBulkStatus={initialTeam ? undefined : handleBulkStatus}
        onBulkTag={initialTeam ? undefined : handleBulkTag}
        onClearSelection={clearSelection}
        onSendToPrioritize={initialTeam ? handleBulkSendToPrioritize : undefined}
        onSendToIdeas={!initialTeam ? handleBulkSendToIdeas : undefined}
      />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <div
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-200",
            hasDetail ? "hidden md:flex md:[flex:0_0_55%]" : "flex-1",
          )}
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
            onSendToIdeas={!initialTeam ? handleSendToIdeas : undefined}
            allowedStatuses={initialTeam ? ["new", "triaged"] : undefined}
            statusLabels={initialTeam ? { triaged: "Backlog" } : undefined}
            hideStatusIcon={!!initialTeam}
            onSelectAll={initialTeam ? handleSelectAll : undefined}
            onDelete={initialTeam ? removeRequest : undefined}
            teamSlug={initialTeam}
          />
        </div>

        {hasDetail && (
          <div ref={detailPanelRef} className="flex flex-col overflow-hidden flex-1 md:[flex:0_0_45%]">
            <RequestDetail
              request={openRequest}
              displayId={displayIdMap[openRequest.id] ?? "KEL-???"}
              onClose={handleCloseDetail}
              onStatusChange={handleStatusChange}
              onTagsChange={setTags}
              onSendToPrioritize={initialTeam ? handleSendToPrioritize : undefined}
              onSendToIdeas={!initialTeam ? handleSendToIdeas : undefined}
              allowedStatuses={initialTeam ? ["new", "triaged"] : undefined}
              statusLabels={initialTeam ? { triaged: "Backlog" } : undefined}
              hideTags={!!initialTeam}
              onDelete={initialTeam ? (id) => { removeRequest(id); handleCloseDetail(); } : undefined}
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

      {ideasToast && (
        <div className={cn(
          "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg",
          "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
          "text-[12px] text-[var(--color-text-secondary)]",
          "animate-in fade-in slide-in-from-bottom-2 duration-200",
        )}>
          <Check size={13} className="text-[var(--color-success)]" />
          <span>Sent to <span className="font-semibold text-[var(--color-text-primary)]">{ideasToast.team} Ideas</span></span>
        </div>
      )}
    </div>
  );
}
