"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { WorkflowBar } from "@/components/workflow/WorkflowBar";
import { SourceBadge } from "@/components/inbox/SourceBadge";
import { ArrowRightCircle, Lock, Search, X, Minus, ThumbsUp, Folder, FolderOpen, ExternalLink, Clock, Zap, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useInboxStore } from "@/store/useInboxStore";
import { useScoringStore } from "@/store/useScoringStore";
import { useWorkflowStore } from "@/store/useWorkflowStore";
import { CURRENT_QUARTER } from "@/lib/constants";
import { getInitials, avatarColor } from "@/lib/format";
import { Tooltip } from "@/components/ui/Tooltip";
import type { FeatureRequest, PrioritySignal, RoadmapItem } from "@/types";

function toRoadmapItem(req: FeatureRequest): RoadmapItem {
  return {
    id: req.id,
    featureRequestId: req.id,
    title: req.title,
    description: req.description,
    businessContext: req.businessContext,
    assignedPmId: "u_pm_01",
    goalIds: req.goalIds,
    productArea: req.productArea ?? "",
    status: "todo",
    priority:
      req.prioritySignal === "critical" ? "urgent"
      : req.prioritySignal === "important" ? "high"
      : "low",
    effort: { unit: "story_points", points: null, tshirt: null, weeks: null },
    quarter: CURRENT_QUARTER,
    score: null,
    dependencies: [],
    jiraEpicId: null,
    linearProjectId: null,
    createdAt: req.submittedAt,
    updatedAt: req.submittedAt,
    votes: req.votes,
    supportingLinks: req.supportingLinks,
  };
}

// ── Priority signal config ─────────────────────

const PRIORITY_CONFIG: Record<PrioritySignal, { label: string; color: string }> = {
  critical:     { label: "Critical",     color: "#e5484d" },
  important:    { label: "Important",    color: "#f97316" },
  nice_to_have: { label: "Nice to have", color: "#30a46c" },
};

// ── Main page ──────────────────────────────────

export default function IdeasPage() {
  const requests         = useInboxStore((s) => s.requests);
  const updateRequest    = useInboxStore((s) => s.updateRequest);
  const removeRequest    = useInboxStore((s) => s.removeRequest);
  const addInitiative    = useScoringStore((s) => s.addInitiative);
  const scoringInitiatives = useScoringStore((s) => s.initiatives);
  const scoringStarted   = useWorkflowStore((s) => s.scoringStarted);
  const router           = useRouter();

  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [search, setSearch]       = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletedToast, setDeletedToast] = useState<string | null>(null);
  const [movedToast, setMovedToast]     = useState<number | null>(null);

  const ideas = useMemo(
    () => requests.filter((r) => r.workflowStage === "ideas"),
    [requests],
  );

  const filteredIdeas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? ideas.filter((f) =>
          f.title.toLowerCase().includes(q) ||
          f.source.toLowerCase().includes(q) ||
          f.submittedBy.toLowerCase().includes(q),
        )
      : ideas;
  }, [ideas, search]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll()    { setSelected(new Set(filteredIdeas.map((f) => f.id))); }
  function clearSelection() { setSelected(new Set()); }

  function handleDelete(id: string) {
    if (scoringStarted) return;
    const title = ideas.find((f) => f.id === id)?.title ?? "Idea";
    removeRequest(id);
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setDeletedToast(title);
    setTimeout(() => setDeletedToast(null), 3500);
  }

  function moveToPrioritization(featureIds: string[]) {
    if (scoringStarted) return;
    featureIds.forEach((id) => updateRequest(id, { workflowStage: "prioritization" }));
    // Sync into scoring store for items not already there
    const existingIds = new Set(scoringInitiatives.map((i) => i.featureRequestId));
    featureIds.forEach((id) => {
      if (!existingIds.has(id)) {
        const req = ideas.find((r) => r.id === id);
        if (req) addInitiative(toRoadmapItem(req));
      }
    });
    setSelected((prev) => { const next = new Set(prev); featureIds.forEach((id) => next.delete(id)); return next; });
    setMovedToast(featureIds.length);
    setTimeout(() => setMovedToast(null), 4000);
    if (ideas.length - featureIds.length === 0) {
      setTimeout(() => router.push("/scoring"), 1200);
    }
  }

  function handleBulkDelete() {
    if (scoringStarted) return;
    const count = selected.size;
    const ids = [...selected];
    ids.forEach((id) => removeRequest(id));
    setSelected(new Set());
    setDeletedToast(`${count} idea${count !== 1 ? "s" : ""}`);
    setTimeout(() => setDeletedToast(null), 3500);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Ideas" />
      <WorkflowBar currentStage="ideas" />

      {/* ── Lock banner ── */}
      {scoringStarted && (
        <div className={cn(
          "flex items-start gap-3 px-5 py-3 border-b border-[var(--color-warning)]/30",
          "bg-[var(--color-warning)]/8",
        )}>
          <Lock size={15} className="text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[var(--color-warning)] leading-snug">
              Ideas Locked
            </p>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
              Prioritization scoring has already started. Ideas can be reviewed but cannot be modified.{" "}
              <button
                onClick={() => router.push("/scoring")}
                className="text-[var(--color-brand)] underline underline-offset-2 hover:no-underline"
              >
                Go to Prioritization
              </button>
              {" "}to reset if needed.
            </p>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="px-5 h-11 border-b border-[var(--color-border-subtle)] flex-shrink-0 flex items-center gap-4">
        <p className="text-[12px] text-[var(--color-text-muted)] flex-shrink-0">
          <span className="text-[var(--color-text-secondary)] font-medium">{ideas.length} idea{ideas.length !== 1 ? "s" : ""}</span>
        </p>

        <div className="flex-1" />

        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="search"
            placeholder="Search ideas…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); clearSelection(); }}
            className={cn(
              "h-7 w-52 rounded-md pl-7 pr-7 text-[12px]",
              "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
              "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
              "focus:outline-none focus:border-[var(--color-brand)] focus:w-64 transition-all duration-150",
            )}
          />
          {search && (
            <button onClick={() => { setSearch(""); clearSelection(); }} className="absolute right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {ideas.length === 0 ? (
          <div className="flex flex-1 h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-center max-w-[300px]">
              <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">No ideas yet</p>
              <p className="text-[13px] text-[var(--color-text-muted)]">Move feature requests from Inbox to start reviewing ideas here.</p>
              <a href="/inbox" className={cn(
                "inline-flex items-center gap-2 h-8 px-3.5 rounded-lg text-[12px] font-medium",
                "border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)]",
                "hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)] transition-colors",
              )}>← Back to Inbox</a>
            </div>
          </div>
        ) : filteredIdeas.length === 0 ? (
          <div className="flex flex-col flex-1 h-full items-center justify-center gap-2">
            <p className="text-[13px] text-[var(--color-text-secondary)]">No results for <span className="font-medium">&ldquo;{search}&rdquo;</span></p>
            <button onClick={() => setSearch("")} className="text-[12px] text-[var(--color-brand)] hover:underline">Clear search</button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              {selected.size > 0 && (
                <tr className="border-b border-[var(--color-border-subtle)]" style={{ background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-elevated))" }}>
                  <th colSpan={7}>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 bg-[var(--color-brand)] border-[var(--color-brand)]"
                      >
                        <Minus size={8} className="text-white" strokeWidth={3} />
                      </button>

                      <span className="text-[12px] font-semibold text-[var(--color-brand)]">{selected.size} selected</span>

                      {selected.size < filteredIdeas.length && (
                        <button type="button" onClick={selectAll} className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] underline underline-offset-2">
                          Select all {filteredIdeas.length}
                        </button>
                      )}

                      <div className="flex-1" />

                      {selected.size >= 1 && !scoringStarted && (
                        <>
                          <button
                            type="button"
                            onClick={handleBulkDelete}
                            className={cn(
                              "inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium",
                              "text-[var(--color-danger)] border border-[var(--color-danger)]/30 hover:bg-[var(--color-danger)]/10 transition-colors",
                            )}
                          >
                            <Trash2 size={13} />Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => moveToPrioritization([...selected])}
                            className={cn(
                              "inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium",
                              "text-[var(--color-brand)] border border-[var(--color-brand)]/30 hover:bg-[var(--color-brand)]/10 transition-colors",
                            )}
                          >
                            <ArrowRightCircle size={13} />Move to Prioritization
                          </button>
                        </>
                      )}

                      {scoringStarted && selected.size >= 1 && (
                        <Tooltip content="Ideas are locked — scoring has started." placement="top" width={220}>
                          <span className={cn(
                            "inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium",
                            "text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] cursor-not-allowed",
                          )}>
                            <Lock size={12} />Actions locked
                          </span>
                        </Tooltip>
                      )}

                      <button type="button" onClick={clearSelection} className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]">
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
                    className={cn(
                      "h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
                      selected.size > 0
                        ? "bg-[var(--color-brand)] border-[var(--color-brand)] opacity-100"
                        : "border-[var(--color-border-strong)] opacity-0 hover:opacity-60",
                    )}
                  >
                    {selected.size > 0 && selected.size < filteredIdeas.length && (
                      <svg width="8" height="2" viewBox="0 0 8 2" fill="none"><path d="M1 1h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
                    )}
                    {selected.size > 0 && selected.size === filteredIdeas.length && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">Idea</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-36">Product Area</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-36">Source</th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-20">Votes</th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-56">Submitted By</th>
                <th className="w-36" />
              </tr>
            </thead>
            <tbody>
              {filteredIdeas.map((idea) => {
                const isSelected = selected.has(idea.id);

                return (
                  <React.Fragment key={idea.id}>
                  <tr
                    onClick={() => toggleRow(idea.id)}
                    className={cn(
                      "group border-b border-[var(--color-border-subtle)] cursor-pointer transition-colors",
                      isSelected ? "bg-[var(--color-brand)]/5" : "hover:bg-[var(--color-bg-hover)]",
                    )}
                  >
                    <td className="pl-4 w-10" onClick={(e) => e.stopPropagation()}>
                      <div
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={-1}
                        onClick={() => toggleRow(idea.id)}
                        className={cn(
                          "h-4 w-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                          isSelected
                            ? "bg-[var(--color-brand)] border-[var(--color-brand)]"
                            : "border-[var(--color-border-strong)] opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {isSelected && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={cn(
                        "text-[14px] font-medium leading-snug",
                        isSelected ? "text-[var(--color-brand)]" : "text-[var(--color-text-primary)]",
                      )}>
                        {idea.title}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 w-36">
                      <span className="text-[13px] text-[var(--color-text-secondary)]">{idea.productArea}</span>
                    </td>

                    <td className="px-4 py-3.5 w-36">
                      <SourceBadge source={idea.source} />
                    </td>

                    <td className="px-4 py-3.5 w-20 text-right">
                      {idea.votes.length > 0 && (
                        <div className="flex items-center justify-end gap-1">
                          <ThumbsUp size={11} className="text-[var(--color-text-muted)]" />
                          <span className="text-[12px] text-[var(--color-text-muted)] tabular-nums">{idea.votes.length}</span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3.5 w-56">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="h-[22px] w-[22px] rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: avatarColor(idea.submittedBy) }}
                        >
                          {getInitials(idea.submittedBy)}
                        </div>
                        <span className="text-[12px] text-[var(--color-text-secondary)] truncate">{idea.submittedBy}</span>
                      </div>
                    </td>

                    <td className="pr-4 w-36 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setExpandedId((prev) => prev === idea.id ? null : idea.id)}
                          className={cn(
                            "inline-flex items-center justify-center h-7 px-2 gap-1.5 rounded-md transition-colors text-[11px] font-medium",
                            expandedId === idea.id
                              ? "text-[var(--color-brand)] bg-[var(--color-brand)]/12 border border-[var(--color-brand)]/30"
                              : "text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:text-[var(--color-brand)] hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-brand)]/6",
                          )}
                        >
                          {expandedId === idea.id ? <FolderOpen size={13} /> : <Folder size={13} />}
                          Details
                        </button>
                        {!scoringStarted && (
                          <div className={cn("inline-flex items-center gap-1 transition-opacity opacity-0 group-hover:opacity-100", isSelected && "opacity-100")}>
                            <button
                              onClick={() => handleDelete(idea.id)}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-bg-hover)]"
                              aria-label="Delete idea"
                            >
                              <Trash2 size={15} />
                            </button>
                            <button
                              onClick={() => moveToPrioritization([idea.id])}
                              className="inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors text-[var(--color-text-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-bg-hover)]"
                              aria-label="Move to Prioritization"
                            >
                              <ArrowRightCircle size={15} />
                            </button>
                          </div>
                        )}
                        {scoringStarted && (
                          <div className={cn("inline-flex items-center gap-1 transition-opacity opacity-0 group-hover:opacity-100")}>
                            <Tooltip content="Scoring has started — this idea is read-only." placement="top" width={220}>
                              <span className="inline-flex items-center justify-center h-7 w-7 text-[var(--color-text-muted)] cursor-not-allowed">
                                <Lock size={13} />
                              </span>
                            </Tooltip>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* ── Expanded detail panel ── */}
                  {expandedId === idea.id && (() => {
                    const cfg = PRIORITY_CONFIG[idea.prioritySignal];
                    return (
                      <tr>
                        <td colSpan={7} className="px-0 pb-0" onClick={(e) => e.stopPropagation()}>
                          <div className={cn(
                            "mx-4 mb-3 rounded-xl border border-[var(--color-border-subtle)]",
                            "bg-[var(--color-bg-elevated)] overflow-hidden",
                            "shadow-[0_4px_24px_rgba(0,0,0,0.08)]",
                            "animate-in fade-in slide-in-from-top-1 duration-150",
                          )}>
                            <div className="h-[3px]" style={{ backgroundColor: cfg.color }} />
                            <div className="p-5">
                              {/* Hero metrics */}
                              <div className="flex items-center gap-4 mb-5">
                                <span
                                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-semibold border"
                                  style={{ color: cfg.color, backgroundColor: `${cfg.color}15`, borderColor: `${cfg.color}40` }}
                                >
                                  <Zap size={11} fill={cfg.color} />
                                  {cfg.label}
                                </span>
                                {idea.votes.length > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <ThumbsUp size={14} className="text-[var(--color-text-muted)]" />
                                    <span className="text-[15px] font-bold text-[var(--color-text-primary)] tabular-nums leading-none">{idea.votes.length}</span>
                                    <span className="text-[12px] text-[var(--color-text-muted)]">votes</span>
                                  </div>
                                )}
                                <div className="flex-1" />
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                    style={{ backgroundColor: avatarColor(idea.submittedBy) }}
                                  >
                                    {getInitials(idea.submittedBy)}
                                  </div>
                                  <span className="text-[12px] text-[var(--color-text-secondary)]">{idea.submittedBy}</span>
                                </div>
                              </div>

                              {/* Content cards */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">Description</p>
                                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">{idea.description}</p>
                                </div>
                                <div className="rounded-lg border p-4" style={{ backgroundColor: `${cfg.color}08`, borderColor: `${cfg.color}25` }}>
                                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: cfg.color }}>Business Context</p>
                                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">{idea.businessContext}</p>
                                </div>
                              </div>

                              {/* Supporting links */}
                              {idea.supportingLinks.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {idea.supportingLinks.map((link, idx) => (
                                    <a
                                      key={idx}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className={cn(
                                        "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px]",
                                        "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                                        "text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:border-[var(--color-brand)]/40 transition-colors",
                                      )}
                                    >
                                      <ExternalLink size={11} />
                                      {link.replace(/^https?:\/\//, "").split("/")[0]}
                                    </a>
                                  ))}
                                </div>
                              )}

                              {/* Decision footer */}
                              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]">
                                {scoringStarted ? (
                                  <div className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px]",
                                    "bg-[var(--color-warning)]/8 border border-[var(--color-warning)]/25",
                                    "text-[var(--color-warning)]",
                                  )}>
                                    <Lock size={12} />
                                    Scoring in progress — ideas are read-only
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => handleDelete(idea.id)}
                                      className={cn(
                                        "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium",
                                        "text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]",
                                        "hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/40 hover:bg-[var(--color-danger)]/6 transition-colors",
                                      )}
                                    >
                                      <Trash2 size={13} />
                                      Remove
                                    </button>
                                    <button
                                      onClick={() => { moveToPrioritization([idea.id]); setExpandedId(null); }}
                                      className={cn(
                                        "inline-flex items-center gap-2 h-8 px-4 rounded-lg text-[12px] font-semibold",
                                        "bg-[var(--color-brand)]/10 text-[var(--color-brand)] border border-[var(--color-brand)]/30",
                                        "hover:bg-[var(--color-brand)]/18 hover:border-[var(--color-brand)]/50 transition-colors",
                                      )}
                                    >
                                      <ArrowRightCircle size={13} />
                                      Move to Prioritization
                                    </button>
                                  </>
                                )}
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
            <tfoot><tr><td colSpan={7} className="h-20" /></tr></tfoot>
          </table>
        )}
      </div>

      {/* ── Delete toast ── */}
      {deletedToast && (
        <div className={cn(
          "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2.5 px-4 py-2.5 rounded-xl",
          "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.18)] text-[12px] text-[var(--color-text-secondary)] max-w-sm",
          "animate-in fade-in slide-in-from-bottom-2 duration-200",
        )}>
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
            <Trash2 size={11} className="text-[var(--color-danger)]" />
          </div>
          <span className="truncate">
            <span className="font-medium text-[var(--color-text-primary)]">Removed</span>{" · "}
            <span className="text-[var(--color-text-muted)]">{deletedToast}</span>
          </span>
        </div>
      )}

      {/* ── Move toast ── */}
      {movedToast !== null && (
        <div className={cn(
          "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
          "flex items-center gap-2.5 px-4 py-2.5 rounded-xl",
          "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
          "shadow-[0_8px_32px_rgba(0,0,0,0.18)] text-[12px] text-[var(--color-text-secondary)]",
          "animate-in fade-in slide-in-from-bottom-2 duration-200",
        )}>
          <Check size={13} className="text-[var(--color-success)]" />
          <span>
            <span className="font-medium text-[var(--color-text-primary)]">{movedToast} idea{movedToast !== 1 ? "s" : ""}</span>
            {" moved to "}
            <a href="/scoring" className="font-semibold text-[var(--color-brand)] underline underline-offset-2 hover:no-underline">
              Prioritization
            </a>
          </span>
        </div>
      )}
    </div>
  );
}
