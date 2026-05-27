"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "zustand";
import { BarChart2, Check, Map, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FrameworkTabs } from "./FrameworkTabs";
import { ScoringTable } from "./ScoringTable";
import { InitiativeDetail } from "./InitiativeDetail";
import { CustomDimensionsModal } from "./CustomDimensionsModal";
import { WorkflowBar } from "@/components/workflow/WorkflowBar";
import { useScoringStore } from "@/store/useScoringStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAppStore } from "@/store/useAppStore";
import { TEAMS, CURRENT_QUARTER } from "@/lib/constants";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { cn } from "@/lib/cn";
import {
  RICE_COLUMNS,
  MOSCOW_COLUMNS,
  WSJF_COLUMNS,
  type ColDef,
} from "./columns";
import type { CustomDimension, QuarterlyPlan } from "@/types";

// ─────────────────────────────────────────────
// ScoringView — root client component for /scoring.
// Orchestrates:
//   - framework switching
//   - scoring table (sorted, inline-editable)
//   - initiative detail panel
//   - custom dimensions modal
//   - undo/redo via zundo
// ─────────────────────────────────────────────

const goals: QuarterlyPlan["goals"] = [];

function buildCustomColumns(dims: CustomDimension[]): ColDef[] {
  const dimCols: ColDef[] = dims.map((d) => ({
    id:       d.id,
    label:    d.name,
    type:     "number" as const,
    widthPx:  88,
    align:    "right" as const,
    editable: true,
    min:      0,
    max:      d.scale,
    step:     1,
  }));
  return [
    { id: "rank",        label: "#",           type: "rank",   widthPx: 40,  align: "center" },
    { id: "title",       label: "Initiative",  type: "title",                align: "left"   },
    ...dimCols,
    { id: "customScore", label: "Score",       type: "score",  widthPx: 80,  align: "right"  },
    { id: "goals",       label: "Goals",       type: "goals",  widthPx: 128, align: "left"   },
    { id: "status",      label: "Status",      type: "status", widthPx: 100, align: "left"   },
  ];
}

interface ScoringViewProps {
  initialTeam?: string;
}

export function ScoringView({ initialTeam }: ScoringViewProps = {}) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [roadmapToast, setRoadmapToast] = useState<string | null>(null);
  const phasesActed    = useAppStore((s) => s.phasesActed);
  const markPhaseActed = useAppStore((s) => s.markPhaseActed);
  const phaseKey       = initialTeam ? `prioritize:${initialTeam}` : null;
  const hasActed       = phaseKey ? phasesActed.includes(phaseKey) : false;

  const setActiveTeamId = useAppStore((s) => s.setActiveTeamId);

  useEffect(() => {
    if (initialTeam) {
      const team = TEAMS.find((t) => t.slug === initialTeam);
      if (team) setActiveTeamId(team.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTeam]);

  const {
    initiatives: allInitiatives,
    activeFramework,
    customDimensions,
    sortColumn,
    sortDirection,
    setActiveFramework,
    updateRICE,
    updateMoSCoW,
    updateWSJF,
    addCustomDimension,
    removeCustomDimension,
    updateCustomScore,
    removeInitiative,
    setSortColumn,
    toggleSortDirection,
  } = useScoringStore();

  const { plans, addItemToPlan } = useRoadmapStore();

  // Derive the team ID and filter initiatives to only this team's items
  const teamId = useMemo(
    () => initialTeam ? TEAMS.find((t) => t.slug === initialTeam)?.id : undefined,
    [initialTeam],
  );

  const initiatives = useMemo(
    () => teamId ? allInitiatives.filter((i) => i.teamId === teamId) : allInitiatives,
    [allInitiatives, teamId],
  );

  // Find the active plan for this team's current quarter
  const activePlanId = useMemo(() => {
    if (!teamId) return null;
    const plan = plans.find(
      (p) =>
        p.teamId === teamId &&
        p.quarter.year === CURRENT_QUARTER.year &&
        p.quarter.quarter === CURRENT_QUARTER.quarter,
    );
    return plan?.id ?? null;
  }, [plans, teamId]);

  const { addPlan } = useRoadmapStore();

  // Auto-navigate to roadmap when all initiatives are sent there.
  const prevInitiativesLen = useRef<number | null>(null);
  useEffect(() => {
    if (!initialTeam) return;
    if (prevInitiativesLen.current === null) {
      prevInitiativesLen.current = initiatives.length;
      return;
    }
    if (prevInitiativesLen.current > 0 && initiatives.length === 0 && hasActed) {
      const t = setTimeout(() => router.push(`/team/${initialTeam}/roadmap`), 1200);
      return () => clearTimeout(t);
    }
    prevInitiativesLen.current = initiatives.length;
  }, [initiatives.length, hasActed, initialTeam, router]);

  const handleSendToRoadmap = useCallback((id: string) => {
    const initiative = initiatives.find((i) => i.id === id);
    if (!initiative || !teamId) return;

    let planId = activePlanId;
    if (!planId) {
      const newPlan: QuarterlyPlan = {
        id: `plan_${teamId}_${CURRENT_QUARTER.year}q${CURRENT_QUARTER.quarter}_${Date.now()}`,
        quarter: CURRENT_QUARTER,
        workspaceId: "ws_01",
        teamId,
        status: "draft",
        goals: [],
        items: [],
        capacity: { unit: "story_points", total: 80, committed: 0, warningThreshold: 0.9, byArea: {} },
        reviewers: [],
        lockedAt: null,
        lockedBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shareLink: null,
      };
      addPlan(newPlan);
      planId = newPlan.id;
    }

    const alreadyInPlan = plans.find((p) => p.id === planId)?.items.some((i) => i.id === id);
    if (!alreadyInPlan) addItemToPlan(planId, initiative);
    removeInitiative(id);
    setRoadmapToast(initiative.title);
    setTimeout(() => setRoadmapToast(null), 3500);
    if (phaseKey) markPhaseActed(phaseKey);
  }, [initiatives, activePlanId, teamId, plans, addPlan, addItemToPlan, removeInitiative, phaseKey, markPhaseActed]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === initiatives.length ? [] : initiatives.map((i) => i.id),
    );
  }, [initiatives]);

  const handleBulkSendToRoadmap = useCallback(() => {
    selectedIds.forEach((id) => handleSendToRoadmap(id));
    setSelectedIds([]);
  }, [selectedIds, handleSendToRoadmap]);

  const temporal = useStore(useScoringStore.temporal);

  const openInitiative = openId
    ? initiatives.find((i) => i.id === openId) ?? null
    : null;

  const columns = useMemo(() => {
    switch (activeFramework) {
      case "rice":   return RICE_COLUMNS;
      case "moscow": return MOSCOW_COLUMNS;
      case "wsjf":   return WSJF_COLUMNS;
      case "custom": return buildCustomColumns(customDimensions);
    }
  }, [activeFramework, customDimensions]);

  function handleOpen(id: string) {
    setOpenId((prev) => (prev === id ? null : id));
  }

  function handleSort(colId: string) {
    if (sortColumn === colId) {
      toggleSortDirection();
    } else {
      setSortColumn(colId);
    }
  }

  useGlobalShortcuts({
    escape: () => {
      if (customModalOpen) return;
      if (openId) setOpenId(null);
    },
    undo: () => temporal.undo(),
    redo: () => temporal.redo(),
  });

  const hasDetail = openInitiative !== null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <Header
        title="Prioritization"
        showViewToggle
      />

      {/* ── Workflow bar ── */}
      {initialTeam && <WorkflowBar currentStage="prioritize" teamSlug={initialTeam} />}

      {/* ── Bulk selection bar ── */}
      {selectedIds.length > 0 && (
        <div className={cn(
          "flex items-center gap-3 px-4 py-2 flex-shrink-0",
          "border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]",
        )}>
          <span className="text-[13px] font-medium text-[var(--color-text-primary)] min-w-max">
            {selectedIds.length} selected
          </span>
          {selectedIds.length < initiatives.length && (
            <button
              onClick={handleSelectAll}
              className="text-[12px] text-[var(--color-brand)] hover:underline transition-colors whitespace-nowrap"
            >
              Select all {initiatives.length}
            </button>
          )}
          <div className="h-4 w-px bg-[var(--color-border-subtle)]" />
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5 h-7 text-[12px]"
            onClick={handleBulkSendToRoadmap}
          >
            <Map size={13} />
            Send to Roadmap
          </Button>
          <div className="flex-1" />
          <button
            onClick={() => setSelectedIds([])}
            className="flex items-center gap-1.5 text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          >
            <X size={12} />
            Clear
          </button>
        </div>
      )}

      {/* ── Framework tabs ── */}
      <FrameworkTabs
        active={activeFramework}
        onChange={(f) => {
          setActiveFramework(f);
          setOpenId(null);
        }}
        onConfigureCustom={() => setCustomModalOpen(true)}
      />

      {/* ── Main content: table + detail split ── */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Table */}
        <div
          className={cn(
            "flex flex-col overflow-hidden transition-all duration-200",
            hasDetail ? "hidden md:flex md:[flex:0_0_58%]" : "flex-1",
          )}
        >
          {initiatives.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                Icon={BarChart2}
                title="Nothing to prioritize yet"
                description="Head to your team's Ideas and send a few to prioritization — then come back here to score and rank them."
                action={initialTeam ? {
                  label: "Go to Ideas",
                  onClick: () => { window.location.href = `/team/${initialTeam}/ideas`; },
                } : undefined}
              />
            </div>
          ) : (
            <ScoringTable
              initiatives={initiatives}
              framework={activeFramework}
              columns={columns}
              goals={goals}
              customDimensions={customDimensions}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              openId={openId}
              selectedIds={selectedIds}
              onSort={handleSort}
              onOpen={handleOpen}
              onSelect={handleToggleSelect}
              onSelectAll={handleSelectAll}
              onUpdateRICE={updateRICE}
              onUpdateMoSCoW={updateMoSCoW}
              onUpdateWSJF={updateWSJF}
              onUpdateCustom={updateCustomScore}
              onSendToRoadmap={initialTeam ? handleSendToRoadmap : undefined}
            />
          )}
        </div>

        {/* Detail panel */}
        {hasDetail && openInitiative && (
          <div className="flex flex-col overflow-hidden flex-1 md:[flex:0_0_42%]">
            <InitiativeDetail
              initiative={openInitiative}
              framework={activeFramework}
              goals={goals}
              customDimensions={customDimensions}
              onClose={() => setOpenId(null)}
              onUpdateRICE={updateRICE}
              onUpdateMoSCoW={updateMoSCoW}
              onUpdateWSJF={updateWSJF}
              onUpdateCustom={updateCustomScore}
              onSendToRoadmap={initialTeam ? handleSendToRoadmap : undefined}
            />
          </div>
        )}
      </div>

      {/* ── Custom dimensions modal ── */}
      <CustomDimensionsModal
        open={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        dimensions={customDimensions}
        onAdd={addCustomDimension}
        onRemove={removeCustomDimension}
      />

      {/* ── Roadmap toast ── */}
      {roadmapToast && (
        <div className={cn(
          "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg",
          "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
          "text-[12px] text-[var(--color-text-secondary)]",
          "animate-in fade-in slide-in-from-bottom-2 duration-200",
        )}>
          <Check size={13} className="text-[var(--color-success)]" />
          <span>Sent to <span className="font-semibold text-[var(--color-text-primary)]">Roadmap</span></span>
        </div>
      )}
    </div>
  );
}
