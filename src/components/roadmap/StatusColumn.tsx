"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { InitiativeCard } from "./InitiativeCard";
import { STATUS_CONFIG } from "@/lib/constants";
import type { RoadmapItem, InitiativeStatus, QuarterlyGoal } from "@/types";

interface StatusColumnProps {
  status: InitiativeStatus;
  items: RoadmapItem[];
  goals: QuarterlyGoal[];
  planId: string;
  openId?: string | null;
  onDropItem: (itemId: string, planId: string, newStatus: InitiativeStatus) => void;
  onOpen?: (id: string) => void;
}

export function StatusColumn({ status, items, goals, planId, openId, onDropItem, onOpen }: StatusColumnProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.backlog;
  const totalPts = items.reduce((s, i) => s + (i.effort.points ?? 0), 0);
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const itemId = e.dataTransfer.getData("itemId");
    const sourcePlanId = e.dataTransfer.getData("planId");
    if (itemId && sourcePlanId) {
      onDropItem(itemId, sourcePlanId, status);
    }
  }

  return (
    <div className="flex flex-col min-w-[232px] max-w-[288px] flex-1">
      {/* Column header */}
      <div className="flex items-center gap-2 mb-2.5 px-0.5 flex-shrink-0">
        <span
          className="h-2 w-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: cfg.color }}
          aria-hidden="true"
        />
        <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
          {cfg.label}
        </span>
        <span
          className="ml-auto text-[12px] tabular-nums text-[var(--color-text-muted)]"
          title={totalPts > 0 ? `${totalPts} story points` : undefined}
        >
          {items.length}
        </span>
      </div>

      {/* Drop zone / Cards */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col gap-2 overflow-y-auto flex-1 min-h-[64px] rounded-xl p-1 -m-1 transition-all duration-150",
          isDragOver && "bg-[var(--color-brand)]/5 ring-2 ring-inset ring-[var(--color-brand)]/20",
        )}
      >
        {items.length === 0 ? (
          <div
            className={cn(
              "rounded-xl border border-dashed p-5 text-center transition-colors",
              isDragOver
                ? "border-[var(--color-brand)]/40"
                : "border-[var(--color-border-subtle)]",
            )}
          >
            <p className="text-[11px] text-[var(--color-text-muted)]">
              {isDragOver ? "Drop here" : "Empty"}
            </p>
          </div>
        ) : (
          items.map((item) => (
            <InitiativeCard
              key={item.id}
              item={item}
              goals={goals}
              planId={planId}
              isOpen={openId === item.id}
              onOpen={onOpen}
            />
          ))
        )}
      </div>
    </div>
  );
}
