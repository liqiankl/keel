"use client";

import { useState, useMemo, useEffect } from "react";
import { useStore } from "zustand";
import { BarChart2, Plus } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FrameworkTabs } from "./FrameworkTabs";
import { ScoringTable } from "./ScoringTable";
import { InitiativeDetail } from "./InitiativeDetail";
import { CustomDimensionsModal } from "./CustomDimensionsModal";
import { NewInitiativeModal } from "./NewInitiativeModal";
import { useScoringStore } from "@/store/useScoringStore";
import { useAppStore } from "@/store/useAppStore";
import { TEAMS } from "@/lib/constants";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import {
  RICE_COLUMNS,
  MOSCOW_COLUMNS,
  WSJF_COLUMNS,
  type ColDef,
} from "./columns";
import { SEED_PLAN } from "@/lib/seed";
import type { CustomDimension } from "@/types";

// ─────────────────────────────────────────────
// ScoringView — root client component for /scoring.
// Orchestrates:
//   - framework switching
//   - scoring table (sorted, inline-editable)
//   - initiative detail panel
//   - custom dimensions modal
//   - undo/redo via zundo
// ─────────────────────────────────────────────

const goals = SEED_PLAN.goals;

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
  const [openId, setOpenId] = useState<string | null>(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [newInitiativeOpen, setNewInitiativeOpen] = useState(false);

  const setActiveTeamId = useAppStore((s) => s.setActiveTeamId);

  useEffect(() => {
    if (initialTeam) {
      const team = TEAMS.find((t) => t.slug === initialTeam);
      if (team) setActiveTeamId(team.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTeam]);

  const {
    initiatives,
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
    addInitiative,
    setSortColumn,
    toggleSortDirection,
  } = useScoringStore();

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
      if (customModalOpen || newInitiativeOpen) return;
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
        title="Prioritize"
        rightSlot={
          <Button
            variant="primary"
            size="sm"
            className="gap-1.5"
            onClick={() => setNewInitiativeOpen(true)}
            aria-label="New initiative"
          >
            <Plus size={13} />
            Initiative
          </Button>
        }
        showViewToggle
      />

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
          className="flex flex-col overflow-hidden transition-all duration-200"
          style={{ flex: hasDetail ? "0 0 58%" : "1 1 0%" }}
        >
          {initiatives.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                Icon={BarChart2}
                title="No initiatives"
                description="Add initiatives to your quarterly plan to start scoring them."
                action={{ label: "Add initiative", onClick: () => undefined }}
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
              onSort={handleSort}
              onOpen={handleOpen}
              onUpdateRICE={updateRICE}
              onUpdateMoSCoW={updateMoSCoW}
              onUpdateWSJF={updateWSJF}
              onUpdateCustom={updateCustomScore}
            />
          )}
        </div>

        {/* Detail panel */}
        {hasDetail && openInitiative && (
          <div
            className="flex flex-col overflow-hidden"
            style={{ flex: "0 0 42%" }}
          >
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

      {/* ── New initiative modal ── */}
      <NewInitiativeModal
        open={newInitiativeOpen}
        onClose={() => setNewInitiativeOpen(false)}
        onSubmit={(item) => {
          addInitiative(item);
          setNewInitiativeOpen(false);
          setOpenId(item.id);
        }}
      />
    </div>
  );
}
