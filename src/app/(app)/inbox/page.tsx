"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { WorkflowBar } from "@/components/workflow/WorkflowBar";
import { NextPhaseBar } from "@/components/workflow/NextPhaseBar";
import { SourceBadge } from "@/components/inbox/SourceBadge";
import { Check, ArrowRightCircle, Trash2, Search, X, Minus, ThumbsUp, Folder, FolderOpen, ExternalLink, Clock, Zap, Info, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useInboxStore } from "@/store/useInboxStore";
import { useAppStore } from "@/store/useAppStore";
import { TEAMS } from "@/lib/constants";
import { getInitials, avatarColor } from "@/lib/format";
import { Tooltip } from "@/components/ui/Tooltip";
import type { FeatureRequest, PrioritySignal } from "@/types";

// ── Age helper ─────────────────────────────────

function waitingLabel(iso: string): { label: string; urgent: boolean } {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  const label = days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;
  return { label, urgent: days >= 30 };
}


// ── Priority signal config ─────────────────────

const PRIORITY_CONFIG: Record<PrioritySignal, { label: string; color: string }> = {
  critical:     { label: "Critical",     color: "#e5484d" },
  important:    { label: "Important",    color: "#f97316" },
  nice_to_have: { label: "Nice to have", color: "#30a46c" },
};

// ── Move to team modal ────────────────────────

function MoveToTeamModal({
  feature,
  onSelect,
  onClose,
}: {
  feature:  { title: string };
  onSelect: (teamId: string) => void;
  onClose:  () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={cn(
        "w-[400px] rounded-xl border border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-elevated)] shadow-xl p-6 flex flex-col gap-5",
        "animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200",
      )}>
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug">
            Move to team
          </p>
          <p className="mt-1 text-[12px] text-[var(--color-text-muted)] truncate">
            {feature.title}
          </p>
        </div>

        <div className="flex gap-3">
          {TEAMS.map((team) => (
            <button
              key={team.id}
              onClick={() => onSelect(team.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl",
                "border border-[var(--color-border-subtle)]",
                "hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
                "transition-colors group",
              )}
            >
              <span
                className="h-10 w-10 rounded-lg flex items-center justify-center text-[17px] font-bold text-white"
                style={{ backgroundColor: team.color }}
              >
                {team.name[0]}
              </span>
              <span className="text-[13px] font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
                {team.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors self-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────

export default function InboxPage() {
  const requests      = useInboxStore((s) => s.requests);
  const updateRequest = useInboxStore((s) => s.updateRequest);
  const removeRequest = useInboxStore((s) => s.removeRequest);
  const phasesActed   = useAppStore((s) => s.phasesActed);
  const markPhaseActed = useAppStore((s) => s.markPhaseActed);
  const hasActed = phasesActed.includes("inbox");
  const router = useRouter();

  const [selected, setSelected]             = useState<Set<string>>(new Set());
  const [movedItems, setMovedItems]         = useState<{ title: string; teamName: string }[]>([]);
  const [hasMoved, setHasMoved]             = useState(false);
  const [lastMovedTeamSlug, setLastMovedTeamSlug] = useState<string | null>(null);
  const [moveModalFeature, setMoveModalFeature] = useState<FeatureRequest | null>(null);
  const [search, setSearch]                 = useState("");
  const [deletedToast, setDeletedToast]     = useState<string | null>(null);
  const [bulkMoveOpen, setBulkMoveOpen]     = useState(false);
  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [ageSort, setAgeSort]               = useState<"asc" | "desc" | null>(null);

  // Global inbox = requests with no teamId
  const features = useMemo(
    () => requests.filter((r) => r.teamId == null),
    [requests],
  );

  // Auto-navigate to the team's Ideas page when inbox is cleared after moves.
  const prevFeaturesLen = useRef(0);
  useEffect(() => {
    if (prevFeaturesLen.current > 0 && features.length === 0 && hasMoved && lastMovedTeamSlug) {
      const t = setTimeout(() => router.push(`/team/${lastMovedTeamSlug}/ideas`), 1200);
      return () => clearTimeout(t);
    }
    prevFeaturesLen.current = features.length;
  }, [features.length, hasMoved, lastMovedTeamSlug, router]);

  const oldestDays = features.length
    ? Math.max(...features.map((f) => Math.floor((Date.now() - new Date(f.submittedAt).getTime()) / 86_400_000)))
    : 0;

  const filteredFeatures = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? features.filter((f) =>
          f.title.toLowerCase().includes(q) ||
          f.source.toLowerCase().includes(q) ||
          f.submittedBy.toLowerCase().includes(q),
        )
      : [...features];
    if (ageSort) {
      result = result.sort((a, b) => {
        const ageA = Date.now() - new Date(a.submittedAt).getTime();
        const ageB = Date.now() - new Date(b.submittedAt).getTime();
        return ageSort === "desc" ? ageB - ageA : ageA - ageB;
      });
    }
    return result;
  }, [features, search, ageSort]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filteredFeatures.map((f) => f.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleBulkDelete() {
    const count = selected.size;
    const ids = [...selected];
    ids.forEach((id) => removeRequest(id));
    setSelected(new Set());
    setDeletedToast(`${count} feature${count !== 1 ? "s" : ""}`);
    setTimeout(() => setDeletedToast(null), 3500);
    markPhaseActed("inbox");
  }

  function handleDelete(id: string) {
    const title = features.find((f) => f.id === id)?.title ?? "Feature";
    removeRequest(id);
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setDeletedToast(title);
    setTimeout(() => setDeletedToast(null), 3500);
    markPhaseActed("inbox");
  }

  function moveFeatures(featureIds: string[], teamId: string) {
    const team = TEAMS.find((t) => t.id === teamId);
    if (!team) return;
    const targets = features.filter((f) => featureIds.includes(f.id));
    featureIds.forEach((id) => updateRequest(id, { teamId }));
    setSelected((prev) => { const next = new Set(prev); featureIds.forEach((id) => next.delete(id)); return next; });
    setHasMoved(true);
    setLastMovedTeamSlug(team.slug);
    setMovedItems((prev) => [
      ...prev,
      { title: `${targets.length} idea${targets.length !== 1 ? "s" : ""}`, teamName: team.name },
    ]);
    setTimeout(() => setMovedItems((prev) => prev.slice(1)), 4000);
    markPhaseActed("inbox");
  }

  function handleMoveToTeam(feature: FeatureRequest, teamId: string) {
    moveFeatures([feature.id], teamId);
  }

  const lastMoved = movedItems[movedItems.length - 1] ?? null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Inbox" />
      <WorkflowBar currentStage="inbox" />

      {/* ── Toolbar ── */}
      <div className="px-5 h-11 border-b border-[var(--color-border-subtle)] flex-shrink-0 flex items-center gap-4">
        {/* Stats */}
        <p className="text-[12px] text-[var(--color-text-muted)] flex-shrink-0">
          <span className="text-[var(--color-text-secondary)] font-medium">{features.length} request{features.length !== 1 ? "s" : ""}</span>
          {features.length > 0 && (
            <> • Oldest: <span className="text-[var(--color-warning)] font-medium">{oldestDays} days</span></>
          )}
        </p>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="search"
            placeholder="Search features…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); clearSelection(); }}
            className={cn(
              "h-7 w-52 rounded-md pl-7 pr-7 text-[12px]",
              "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
              "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
              "focus:outline-none focus:border-[var(--color-brand)] focus:w-64 transition-all duration-150",
            )}
            aria-label="Search features"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); clearSelection(); }}
              className="absolute right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {features.length === 0 ? (
          <div className="flex flex-1 h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center max-w-[320px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-success)]/12">
                <Check size={20} className="text-[var(--color-success)]" strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">Inbox cleared — great work!</p>
                <p className="text-[13px] text-[var(--color-text-muted)]">All features have been moved to teams.</p>
                <p className="text-[12px] text-[var(--color-text-muted)] leading-relaxed pt-1">
                  Your next step is to score and prioritize those features so your teams know what to build first.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full pt-1">
                {TEAMS.map((team) => (
                  <a
                    key={team.id}
                    href={`/team/${team.slug}/prioritization`}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-left w-full",
                      "border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]",
                      "hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
                      "transition-colors group",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.name[0]}
                      </span>
                      <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{team.name}</span>
                    </div>
                    <span className="text-[12px] text-[var(--color-text-muted)] group-hover:text-[var(--color-brand)] transition-colors">
                      Prioritize →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="flex flex-col flex-1 h-full items-center justify-center gap-2">
            <p className="text-[13px] text-[var(--color-text-secondary)]">No results for <span className="font-medium">&ldquo;{search}&rdquo;</span></p>
            <button onClick={() => setSearch("")} className="text-[12px] text-[var(--color-brand)] hover:underline">Clear search</button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              {selected.size > 0 && (
                <tr className="border-b border-[var(--color-border-subtle)]" style={{ background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-elevated))" }}>
                  <th colSpan={8}>
                    <div className="flex items-center gap-3 px-4 py-2">
                      {/* Indeterminate / clear checkbox */}
                      <button
                        type="button"
                        onClick={clearSelection}
                        aria-label="Clear selection"
                        className={cn(
                          "h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          "bg-[var(--color-brand)] border-[var(--color-brand)]",
                        )}
                      >
                        <Minus size={8} className="text-white" strokeWidth={3} />
                      </button>

                      <span className="text-[12px] font-semibold text-[var(--color-brand)]">
                        {selected.size} selected
                      </span>

                      {selected.size < filteredFeatures.length && (
                        <button
                          type="button"
                          onClick={selectAll}
                          className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] underline underline-offset-2 transition-colors"
                        >
                          Select all {filteredFeatures.length}
                        </button>
                      )}

                      <div className="flex-1" />

                      {selected.size > 1 && (
                        <>
                          {/* Bulk delete */}
                          <button
                            type="button"
                            onClick={handleBulkDelete}
                            className={cn(
                              "inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium",
                              "text-[var(--color-danger)] border border-[var(--color-danger)]/30",
                              "hover:bg-[var(--color-danger)]/10 transition-colors",
                            )}
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>

                          {/* Bulk move */}
                          <button
                            type="button"
                            onClick={() => setBulkMoveOpen(true)}
                            className={cn(
                              "inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium",
                              "text-[var(--color-brand)] border border-[var(--color-brand)]/30",
                              "hover:bg-[var(--color-brand)]/10 transition-colors",
                            )}
                          >
                            <ArrowRightCircle size={13} />
                            Move to team
                          </button>
                        </>
                      )}

                      {/* Dismiss */}
                      <button
                        type="button"
                        onClick={clearSelection}
                        aria-label="Clear selection"
                        className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                </tr>
              )}
              <tr className="bg-[var(--color-bg-elevated)] border-b-2 border-[var(--color-border-subtle)]">
                <th className="w-10 pl-4">
                  <button
                    type="button"
                    onClick={selected.size > 0 ? clearSelection : selectAll}
                    aria-label={selected.size > 0 ? "Clear selection" : "Select all"}
                    className={cn(
                      "h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
                      selected.size > 0
                        ? "bg-[var(--color-brand)] border-[var(--color-brand)] opacity-100"
                        : "border-[var(--color-border-strong)] opacity-0 hover:opacity-60",
                    )}
                  >
                    {selected.size > 0 && selected.size < filteredFeatures.length && (
                      <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
                        <path d="M1 1h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                    {selected.size > 0 && selected.size === filteredFeatures.length && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
                  <span className="inline-flex items-center gap-1">
                    Feature Request
                    <Tooltip content="The title and summary of the incoming feature request" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-36">
                  <span className="inline-flex items-center gap-1">
                    Product Area
                    <Tooltip content="The area of the product this request relates to" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-36">
                  <span className="inline-flex items-center gap-1">
                    Source
                    <Tooltip content="Where this request originated — customer, engineering, or internal" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-20">
                  <span className="inline-flex items-center justify-end gap-1">
                    Votes
                    <Tooltip content="Number of stakeholders who have upvoted this request" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-56">
                  <span className="inline-flex items-center gap-1">
                    Submitted By
                    <Tooltip content="The person or team who submitted this request" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-28">
                  <span className="inline-flex items-center justify-end gap-1">
                    Age
                    <Tooltip content="How long this request has been waiting in the inbox" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => setAgeSort((prev) => prev === "asc" ? "desc" : prev === "desc" ? null : "asc")}
                      aria-label={ageSort === "asc" ? "Sort oldest first" : ageSort === "desc" ? "Clear sort" : "Sort newest first"}
                      className={cn(
                        "flex items-center justify-center h-4 w-4 rounded transition-colors",
                        ageSort
                          ? "text-[var(--color-brand)]"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                      )}
                    >
                      {ageSort === "asc"
                        ? <ArrowUp size={11} />
                        : ageSort === "desc"
                        ? <ArrowDown size={11} />
                        : <ArrowUpDown size={11} />}
                    </button>
                  </span>
                </th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((feature) => {
                const isSelected = selected.has(feature.id);
                const { label: waitLabel, urgent: waitUrgent } = waitingLabel(feature.submittedAt);

                return (
                  <React.Fragment key={feature.id}>
                  <tr
                    onClick={() => toggleRow(feature.id)}
                    className={cn(
                      "group border-b border-[var(--color-border-subtle)] cursor-pointer transition-colors",
                      isSelected
                        ? "bg-[var(--color-brand)]/5"
                        : "hover:bg-[var(--color-bg-hover)]",
                    )}
                  >
                    {/* Checkbox */}
                    <td className="pl-4 w-10" onClick={(e) => e.stopPropagation()}>
                      <div
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={-1}
                        onClick={() => toggleRow(feature.id)}
                        className={cn(
                          "h-4 w-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                          isSelected
                            ? "bg-[var(--color-brand)] border-[var(--color-brand)]"
                            : "border-[var(--color-border-strong)] opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {isSelected && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </td>

                    {/* Feature title */}
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        "text-[14px] font-medium leading-snug",
                        isSelected ? "text-[var(--color-brand)]" : "text-[var(--color-text-primary)]",
                      )}>
                        {feature.title}
                      </span>
                    </td>

                    {/* Product area */}
                    <td className="px-4 py-3.5 w-36">
                      <span className="text-[13px] text-[var(--color-text-secondary)]">
                        {feature.productArea}
                      </span>
                    </td>

                    {/* Source badge */}
                    <td className="px-4 py-3.5 w-36">
                      <SourceBadge source={feature.source} />
                    </td>

                    {/* Votes */}
                    <td className="px-4 py-3.5 w-20 text-right">
                      {feature.votes.length > 0 ? (
                        <div className="flex items-center justify-end gap-1" aria-label={`${feature.votes.length} votes`}>
                          <ThumbsUp size={11} className="text-[var(--color-text-muted)]" />
                          <span className="text-[12px] text-[var(--color-text-muted)] tabular-nums">
                            {feature.votes.length}
                          </span>
                        </div>
                      ) : null}
                    </td>

                    {/* Submitted by */}
                    <td className="px-4 py-3.5 w-56">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="h-[22px] w-[22px] rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: avatarColor(feature.submittedBy) }}
                          aria-hidden="true"
                        >
                          {getInitials(feature.submittedBy)}
                        </div>
                        <span className="text-[12px] text-[var(--color-text-secondary)] truncate">
                          {feature.submittedBy}
                        </span>
                      </div>
                    </td>

                    {/* Waiting */}
                    <td className="px-4 py-3.5 w-28 text-right">
                      <span className={cn(
                        "text-[12px] font-medium tabular-nums",
                        waitUrgent
                          ? "text-[var(--color-warning)]"
                          : "text-[var(--color-text-muted)]",
                      )}>
                        {waitLabel}
                      </span>
                    </td>

                    {/* Row actions */}
                    <td
                      className="pr-4 w-28 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        {/* Folder — always visible */}
                        <button
                          onClick={() => setExpandedId((prev) => prev === feature.id ? null : feature.id)}
                          className={cn(
                            "inline-flex items-center justify-center h-7 px-2 gap-1.5 rounded-md transition-colors text-[11px] font-medium",
                            expandedId === feature.id
                              ? "text-[var(--color-brand)] bg-[var(--color-brand)]/12 border border-[var(--color-brand)]/30"
                              : "text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:text-[var(--color-brand)] hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-brand)]/6",
                          )}
                          aria-label="View details"
                          aria-expanded={expandedId === feature.id}
                        >
                          {expandedId === feature.id
                            ? <FolderOpen size={13} />
                            : <Folder size={13} />
                          }
                          Details
                        </button>
                        {/* Hover-only actions */}
                        <div className={cn(
                          "inline-flex items-center gap-1 transition-opacity",
                          "opacity-0 group-hover:opacity-100",
                          isSelected && "opacity-100",
                        )}>
                          <button
                            onClick={() => handleDelete(feature.id)}
                            className={cn(
                              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors",
                              "text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-bg-hover)]",
                            )}
                            aria-label="Delete feature"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            onClick={() => setMoveModalFeature(feature)}
                            className={cn(
                              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors",
                              "text-[var(--color-text-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-bg-hover)]",
                            )}
                            aria-label="Move to team"
                          >
                            <ArrowRightCircle size={15} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* ── Expanded decision panel ── */}
                  {expandedId === feature.id && (() => {
                    const cfg = PRIORITY_CONFIG[feature.prioritySignal];
                    return (
                      <tr>
                        <td colSpan={8} className="px-0 pb-0" onClick={(e) => e.stopPropagation()}>
                          <div className={cn(
                            "mx-4 mb-3 rounded-xl border border-[var(--color-border-subtle)]",
                            "bg-[var(--color-bg-elevated)] overflow-hidden",
                            "shadow-[0_4px_24px_rgba(0,0,0,0.08)]",
                            "animate-in fade-in slide-in-from-top-1 duration-150",
                          )}>
                            {/* Priority accent bar */}
                            <div className="h-[3px]" style={{ backgroundColor: cfg.color }} />

                            <div className="p-5">
                              {/* ── Hero metrics row ── */}
                              <div className="flex items-center gap-4 mb-5">
                                {/* Priority badge */}
                                <span
                                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-semibold border"
                                  style={{ color: cfg.color, backgroundColor: `${cfg.color}15`, borderColor: `${cfg.color}40` }}
                                >
                                  <Zap size={11} fill={cfg.color} />
                                  {cfg.label}
                                </span>

                                {/* Vote count — prominent */}
                                {feature.votes.length > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <ThumbsUp size={14} className="text-[var(--color-text-muted)]" />
                                    <span className="text-[15px] font-bold text-[var(--color-text-primary)] tabular-nums leading-none">
                                      {feature.votes.length}
                                    </span>
                                    <span className="text-[12px] text-[var(--color-text-muted)]">votes</span>
                                  </div>
                                )}

                                {/* Waiting time */}
                                <div className="flex items-center gap-1.5">
                                  <Clock size={13} className={waitUrgent ? "text-[var(--color-warning)]" : "text-[var(--color-text-muted)]"} />
                                  <span className={cn(
                                    "text-[12px] font-medium",
                                    waitUrgent ? "text-[var(--color-warning)]" : "text-[var(--color-text-muted)]",
                                  )}>
                                    {waitLabel} waiting
                                  </span>
                                </div>

                                <div className="flex-1" />

                                {/* Submitter */}
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                    style={{ backgroundColor: avatarColor(feature.submittedBy) }}
                                  >
                                    {getInitials(feature.submittedBy)}
                                  </div>
                                  <span className="text-[12px] text-[var(--color-text-secondary)]">{feature.submittedBy}</span>
                                </div>
                              </div>

                              {/* ── Content cards ── */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                                    Description
                                  </p>
                                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                                    {feature.description}
                                  </p>
                                </div>
                                <div className="rounded-lg border p-4" style={{ backgroundColor: `${cfg.color}08`, borderColor: `${cfg.color}25` }}>
                                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: cfg.color }}>
                                    Business Context
                                  </p>
                                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                                    {feature.businessContext}
                                  </p>
                                </div>
                              </div>

                              {/* ── Supporting links ── */}
                              {feature.supportingLinks.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {feature.supportingLinks.map((link, i) => (
                                    <a
                                      key={i}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className={cn(
                                        "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px]",
                                        "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                                        "text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:border-[var(--color-brand)]/40",
                                        "transition-colors",
                                      )}
                                    >
                                      <ExternalLink size={11} />
                                      {link.replace(/^https?:\/\//, "").split("/")[0]}
                                    </a>
                                  ))}
                                </div>
                              )}

                              {/* ── Decision footer ── */}
                              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]">
                                <button
                                  onClick={() => handleDelete(feature.id)}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium",
                                    "text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]",
                                    "hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/40 hover:bg-[var(--color-danger)]/6",
                                    "transition-colors",
                                  )}
                                >
                                  <Trash2 size={13} />
                                  Dismiss
                                </button>

                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[var(--color-text-muted)] mr-1">Send to →</span>
                                  {TEAMS.map((team) => (
                                    <button
                                      key={team.id}
                                      onClick={() => { moveFeatures([feature.id], team.id); setExpandedId(null); }}
                                      className={cn(
                                        "inline-flex items-center gap-2 h-8 px-3.5 rounded-lg text-[12px] font-semibold",
                                        "border transition-all duration-150",
                                        "hover:scale-[1.03] active:scale-[0.98]",
                                      )}
                                      style={{
                                        color: team.color,
                                        backgroundColor: `${team.color}12`,
                                        borderColor: `${team.color}40`,
                                      }}
                                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${team.color}22`; }}
                                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${team.color}12`; }}
                                    >
                                      <span
                                        className="h-4 w-4 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                        style={{ backgroundColor: team.color }}
                                      >
                                        {team.name[0]}
                                      </span>
                                      {team.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })()}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot><tr><td colSpan={8} className="h-20" /></tr></tfoot>
          </table>
        )}
      </div>

      {/* ── Next phase bar ── */}
      {hasMoved && features.length > 0 && (
        <NextPhaseBar
          nextPhase="Ideas"
          options={TEAMS.map((t) => ({
            label: `${t.name} · Ideas`,
            href: `/team/${t.slug}/ideas`,
            color: t.color,
          }))}
        />
      )}

      {/* ── Bulk move modal ── */}
      {bulkMoveOpen && (
        <MoveToTeamModal
          feature={{ title: `${selected.size} feature${selected.size !== 1 ? "s" : ""}` }}
          onSelect={(teamId) => {
            moveFeatures([...selected], teamId);
            setBulkMoveOpen(false);
          }}
          onClose={() => setBulkMoveOpen(false)}
        />
      )}

      {/* ── Move to team modal ── */}
      {moveModalFeature && (
        <MoveToTeamModal
          feature={moveModalFeature}
          onSelect={(teamId) => {
            handleMoveToTeam(moveModalFeature, teamId);
            setMoveModalFeature(null);
          }}
          onClose={() => setMoveModalFeature(null)}
        />
      )}

      {/* ── Delete toast ── */}
      {deletedToast && (
        <div
          className={cn(
            "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
            "flex items-center gap-2.5 px-4 py-2.5 rounded-xl",
            "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.18)]",
            "text-[12px] text-[var(--color-text-secondary)] max-w-sm",
            "animate-in fade-in slide-in-from-bottom-2 duration-200",
          )}
        >
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
            <Trash2 size={11} className="text-[var(--color-danger)]" />
          </div>
          <span className="truncate">
            <span className="font-medium text-[var(--color-text-primary)]">Deleted</span>
            {" · "}
            <span className="text-[var(--color-text-muted)]">{deletedToast}</span>
          </span>
        </div>
      )}

      {/* ── Move toast ── */}
      {lastMoved && (
        <div
          className={cn(
            "fixed bottom-20 left-1/2 -translate-x-1/2 z-50 mt-2",
            "flex items-center gap-2.5 px-4 py-2.5 rounded-xl",
            "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.18)] text-[12px] text-[var(--color-text-secondary)]",
            "animate-in fade-in slide-in-from-bottom-2 duration-200",
          )}
        >
          <Check size={13} className="text-[var(--color-success)]" />
          <span>
            Moved to{" "}
            <button
              onClick={() => {
                const team = TEAMS.find((t) => t.name === lastMoved.teamName);
                if (team) router.push(`/team/${team.slug}/ideas`);
              }}
              className="font-semibold text-[var(--color-text-primary)] underline underline-offset-2 hover:no-underline"
            >
              {lastMoved.teamName}
            </button>
            {" "}· Ideas
          </span>
        </div>
      )}
    </div>
  );
}
