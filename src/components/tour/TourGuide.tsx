"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────
// TourGuide — page-specific spotlight walkthrough.
// Picks the correct step set based on the current pathname.
// ─────────────────────────────────────────────

const TOUR_SEEN_KEY  = "keel-tour-seen";
export const TOUR_FORCE_KEY        = "keel-start-tour";       // sessionStorage — set by landing page CTA
export const WORKSPACE_ONBOARD_KEY = "keel-tour-workspace-onboard"; // sessionStorage — set by workspace page CTA

type Placement = "right" | "center" | "below";

interface TourStep {
  id: string;
  target?: string;               // value of data-tour="..." attribute
  title: string;
  body: string;
  placement: Placement;
  chip?: { label: string; color: string };
}

// ── Per-page step sets ─────────────────────────────────────────────────────

// Combined sidebar + inbox tour — used when landing on /inbox (especially from /workspace).
// Sidebar elements are always in the DOM so spotlighting them works from any (app)/ page.
const INBOX_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Keel",
    body: "Keel takes ideas from raw feature requests all the way to a locked quarterly roadmap. Let's walk through the whole workflow — starting right here in your Inbox.",
    placement: "center",
  },
  {
    id: "teams-section",
    target: "teams-section",
    title: "Your Teams",
    body: "Keel organises everything by team. Each team has its own Ideas backlog, Prioritization queue, and quarterly Roadmap — all independent.",
    placement: "right",
  },
  {
    id: "team-navigators",
    target: "team-navigators",
    title: "Navigators",
    body: "The Navigators team owns product strategy. Click the team name to expand and jump straight into their Ideas, Prioritization, or Roadmap.",
    placement: "right",
    chip: { label: "N", color: "#5e5ce6" },
  },
  {
    id: "nav-inbox",
    target: "nav-inbox",
    title: "Inbox — You're here",
    body: "All incoming requests land here first. Triage them, set priority signals, add tags, and decide which are worth pursuing.",
    placement: "right",
  },
  {
    id: "nav-prioritize",
    target: "nav-prioritize",
    title: "Prioritization",
    body: "Score shortlisted initiatives using RICE, MoSCoW, or WSJF. Rank them before committing capacity to the roadmap.",
    placement: "right",
  },
  {
    id: "nav-roadmap",
    target: "nav-roadmap",
    title: "Roadmap",
    body: "The quarterly plan shown as a timeline. Plans progress through Draft → In Review → Locked. Locking generates a shareable stakeholder link.",
    placement: "right",
  },
  {
    id: "nav-views",
    target: "nav-views",
    title: "Views",
    body: "Read-only share links for locked roadmaps. Stakeholders see the plan without needing workspace access — with optional password protection.",
    placement: "right",
  },
  {
    id: "inbox-filters",
    target: "inbox-filter-tabs",
    title: "Search",
    body: "Use the search bar to find any request by keyword instantly.",
    placement: "below",
  },
  {
    id: "inbox-list",
    target: "inbox-list",
    title: "Request Cards",
    body: "Each card shows the source, priority signal, and status. Click any card to open the full detail panel — where you can tag, vote, and triage.",
    placement: "below",
  },
  {
    id: "inbox-send",
    title: "Send to Prioritization",
    body: "When a request is worth pursuing, open it and click 'Send to Prioritization'. It lands in your team's scoring queue — one step closer to the roadmap.",
    placement: "center",
  },
  {
    id: "done",
    title: "You're all set",
    body: "That's the full Keel workflow. Explore the sidebar, score some initiatives, lock a plan, and share it. Happy planning!",
    placement: "center",
  },
];

const IDEAS_STEPS: TourStep[] = [
  {
    id: "ideas-welcome",
    title: "Team Ideas",
    body: "This is your team's private idea backlog — requests that have been triaged and are ready to score.",
    placement: "center",
  },
  {
    id: "ideas-filters",
    target: "inbox-filter-tabs",
    title: "Filter & Search",
    body: "Filter by status or search by keyword. Use multi-select to bulk-promote several ideas to Prioritization at once.",
    placement: "below",
  },
  {
    id: "ideas-list",
    target: "inbox-list",
    title: "Idea Cards",
    body: "Each card represents a candidate initiative. Click to open the detail, review context, and decide if it's worth scoring.",
    placement: "below",
  },
  {
    id: "ideas-send",
    title: "Send to Prioritization",
    body: "Select one or more ideas and hit 'Send to Prioritization'. They'll appear in the RICE / MoSCoW / WSJF scoring view.",
    placement: "center",
  },
];

const SCORING_STEPS: TourStep[] = [
  {
    id: "scoring-welcome",
    title: "Prioritization",
    body: "Score your initiatives before committing them to the roadmap. Pick the framework that matches how your team thinks.",
    placement: "center",
  },
  {
    id: "scoring-frameworks",
    target: "scoring-framework-tabs",
    title: "Scoring Frameworks",
    body: "RICE (Reach × Impact × Confidence ÷ Effort) gives a numeric score. MoSCoW classifies into Must / Should / Could / Won't. WSJF weights cost of delay against job size.",
    placement: "below",
  },
  {
    id: "scoring-cards",
    title: "Initiative Cards",
    body: "Each card shows the initiative title, priority dot, and current score. Edit values inline — click any number field to type directly.",
    placement: "center",
  },
  {
    id: "scoring-drag",
    title: "Drag to Reorder",
    body: "In RICE and WSJF views, drag the handle on the left side of a card to manually override the sort order.",
    placement: "center",
  },
  {
    id: "scoring-roadmap",
    title: "Send to Roadmap",
    body: "Hover a card and click 'Roadmap' to promote the initiative to your quarterly plan. In MoSCoW, use the column checkboxes to send an entire tier at once.",
    placement: "center",
  },
];

const ROADMAP_STEPS: TourStep[] = [
  {
    id: "roadmap-welcome",
    title: "Roadmap",
    body: "Your team's committed quarterly plan — shown as a timeline. Items flow here from Prioritization once scored and approved.",
    placement: "center",
  },
  {
    id: "roadmap-quarters",
    target: "roadmap-quarter-tabs",
    title: "Quarter Navigation",
    body: "Switch between Q2, Q3, Q4, or Full Year. Each quarter has its own plan, capacity budget, and status.",
    placement: "below",
  },
  {
    id: "roadmap-timeline",
    title: "Timeline View",
    body: "Initiatives appear as horizontal bars. The red line marks today. Click any bar to open the detail panel and edit status, effort, or priority.",
    placement: "center",
  },
  {
    id: "roadmap-status",
    target: "roadmap-plan-status",
    title: "Plan Status",
    body: "Move the plan from Draft → In Review → Locked. Locking generates a shareable, read-only link you can send to stakeholders.",
    placement: "below",
  },
  {
    id: "roadmap-share",
    title: "Lock & Share",
    body: "Once locked, a celebration modal appears with a copy-able share link. That link appears in the Views page for easy access later.",
    placement: "center",
  },
];

const VIEWS_STEPS: TourStep[] = [
  {
    id: "views-welcome",
    title: "Shareable Views",
    body: "Views are read-only snapshots of a locked roadmap — perfect for stakeholders who don't need full workspace access.",
    placement: "center",
  },
  {
    id: "views-list",
    target: "views-list",
    title: "Live View Cards",
    body: "Each card shows the plan label, live status, share URL, and creation date. Copy the link in one click — it's always up to date.",
    placement: "below",
  },
  {
    id: "views-create",
    title: "Create a View",
    body: "Lock a quarterly plan from the Roadmap page and a view is automatically created. Or hit 'New view' here to manually configure one.",
    placement: "center",
  },
  {
    id: "views-control",
    title: "Access Control",
    body: "Revoke a view instantly to cut off access without deleting it. Restore at any time. Optional passwords and field-hiding are available too.",
    placement: "center",
  },
];

const GENERAL_STEPS: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to Keel",
    body: "Keel is your team's product planning workspace — from raw feature requests all the way to a locked quarterly roadmap. Let's take a 90-second tour.",
    placement: "center",
  },
  {
    id: "teams-section",
    target: "teams-section",
    title: "Your teams",
    body: "Keel organises everything by team. You have two teams in this workspace — each with fully independent ideas, prioritization, and quarterly plans.",
    placement: "right",
  },
  {
    id: "team-navigators",
    target: "team-navigators",
    title: "Navigators Team",
    body: "The Navigators team owns product strategy and roadmap planning. Their Q2 2026 plan has 5 active initiatives across Core Product, Growth, and Integrations.",
    placement: "right",
    chip: { label: "N", color: "#5e5ce6" },
  },
  {
    id: "team-hitchhiker",
    target: "team-hitchhiker",
    title: "Hitchhikers Team",
    body: "The Hitchhiker team focuses on platform reliability and developer experience. Their Q2 2026 plan is in review — 80 story points of capacity, 5 initiatives.",
    placement: "right",
    chip: { label: "H", color: "#30a46c" },
  },
  {
    id: "inbox",
    target: "nav-inbox",
    title: "Inbox",
    body: "All incoming feature requests from customers, internal stakeholders, and leadership land here. Triage, vote, tag, and promote them to the roadmap.",
    placement: "right",
  },
  {
    id: "prioritize",
    target: "nav-prioritize",
    title: "Prioritization",
    body: "Score your initiatives using RICE, MoSCoW, WSJF, or a custom weighted framework. Click the ⓘ icon beside each tab to understand the formula.",
    placement: "right",
  },
  {
    id: "roadmap",
    target: "nav-roadmap",
    title: "Roadmap",
    body: "Each team's quarterly plan is shown as a timeline. Plans can be drafted, reviewed, approved, and locked.",
    placement: "right",
  },
  {
    id: "views",
    target: "nav-views",
    title: "Shareable Views",
    body: "Generate read-only share links for your roadmap. Choose what stakeholders can see — hide effort estimates or internal scores — and optionally add a password.",
    placement: "right",
  },
  {
    id: "done",
    title: "You're all set",
    body: "Click any team in the sidebar to switch workspaces. Use the theme toggle at the bottom to switch between dark and light mode. Happy planning.",
    placement: "center",
  },
];

function getStepsForPath(pathname: string): TourStep[] {
  if (pathname.includes("/ideas"))          return IDEAS_STEPS;
  if (pathname === "/inbox" || pathname.startsWith("/inbox/")) return INBOX_STEPS;
  if (pathname.includes("/prioritization") || pathname.includes("/scoring")) return SCORING_STEPS;
  if (pathname.includes("/roadmap"))        return ROADMAP_STEPS;
  if (pathname === "/views")                return VIEWS_STEPS;
  return GENERAL_STEPS;
}

// ── Page label for the tour header chip ───────────────────────────────────

function getPageLabel(pathname: string): string {
  if (pathname.includes("/ideas"))          return "Ideas";
  if (pathname === "/inbox" || pathname.startsWith("/inbox/")) return "Inbox";
  if (pathname.includes("/prioritization") || pathname.includes("/scoring")) return "Prioritization";
  if (pathname.includes("/roadmap"))        return "Roadmap";
  if (pathname === "/views")                return "Views";
  return "Keel";
}

// ─────────────────────────────────────────────────────────────────────────────

interface Rect { top: number; left: number; width: number; height: number; }

function measureTarget(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

// ── Main component ─────────────────────────────────────────────────────────

interface TourGuideProps {
  open: boolean;
  onClose: () => void;
}

export function TourGuide({ open, onClose }: TourGuideProps) {
  const pathname = usePathname();
  const steps    = useMemo(() => getStepsForPath(pathname), [pathname]);
  const pageLabel = getPageLabel(pathname);

  const [step, setStep]       = useState(0);
  const [rect, setRect]       = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  const current    = steps[Math.min(step, steps.length - 1)];
  const isCentered = current.placement === "center";
  const isFirst    = step === 0;
  const isLast     = step === steps.length - 1;

  useEffect(() => { setMounted(true); }, []);

  // Re-measure target whenever step changes
  useEffect(() => {
    if (!open || !current.target) { setRect(null); return; }
    const id = setTimeout(() => setRect(measureTarget(current.target!)), 60);
    return () => clearTimeout(id);
  }, [open, step, current.target]);

  // Reset to step 0 on open/close or page change
  useEffect(() => { setStep(0); }, [open, pathname]);

  const handleNext = useCallback(() => {
    if (isLast) { onClose(); }
    else setStep((s) => s + 1);
  }, [isLast, onClose]);

  const handlePrev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const handleClose = useCallback(() => {
    localStorage.setItem(TOUR_SEEN_KEY, "1");
    onClose();
  }, [onClose]);

  // ESC key — only closes if not locked (currently always closeable via ESC as a safety hatch)
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, handleClose]);
  // Note: backdrop click-to-close intentionally removed — use X button or Done to exit

  // Tooltip position
  const wrapperStyle = useMemo((): React.CSSProperties => {
    if (isCentered || !rect) {
      return {
        position: "fixed",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 9002,
      };
    }
    const GAP = 14;
    if (current.placement === "below") {
      return {
        position: "fixed",
        top: rect.top + rect.height + GAP,
        left: Math.min(
          Math.max(rect.left + rect.width / 2, 160),
          (typeof window !== "undefined" ? window.innerWidth : 1200) - 160,
        ),
        transform: "translateX(-50%)",
        zIndex: 9002,
      };
    }
    // "right"
    return {
      position: "fixed",
      top: rect.top + rect.height / 2,
      left: rect.left + rect.width + GAP,
      transform: "translateY(-50%)",
      zIndex: 9002,
    };
  }, [isCentered, rect, current.placement]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* ── Interaction-blocking layer (no click-to-close) ──────────── */}
          <motion.div
            key="tour-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0"
            style={{ zIndex: 9000 }}
            aria-hidden="true"
          />

          {/* ── Spotlight / dim layer ─────────────────── */}
          {isCentered || !rect ? (
            <motion.div
              key="tour-dim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 bg-black pointer-events-none"
              style={{ zIndex: 9001 }}
            />
          ) : (
            <motion.div
              key={`tour-spotlight-${step}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed pointer-events-none"
              style={{
                zIndex: 9001,
                borderRadius: 6,
                top: rect.top - 3,
                left: rect.left - 4,
                width: rect.width + 8,
                height: rect.height + 6,
                boxShadow: "0 0 0 9999px rgba(0,0,0,0.52)",
                outline: "2px solid rgba(99,102,241,0.6)",
                outlineOffset: 1,
              }}
            />
          )}

          {/* ── Tooltip card ─────────────────────────── */}
          <div style={wrapperStyle}>
            <motion.div
              key={`tour-card-${step}`}
              role="dialog"
              aria-modal="true"
              aria-live="polite"
              aria-label={current.title}
              initial={{ opacity: 0, x: isCentered ? 0 : -10, y: isCentered ? 8 : 0, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{    opacity: 0, x: isCentered ? 0 : -10, y: isCentered ? 8 : 0, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "w-[288px] rounded-xl overflow-hidden",
                "border border-[var(--color-border-subtle)]",
                "bg-[var(--color-bg-elevated)]",
                "shadow-[0_20px_60px_rgba(0,0,0,0.30),0_4px_16px_rgba(0,0,0,0.14)]",
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Page label chip */}
              {current.chip && (
                <div className="flex items-center gap-2 px-4 pt-4 pb-0">
                  <div
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[11px] font-bold text-white"
                    style={{ backgroundColor: current.chip.color }}
                  >
                    {current.chip.label}
                  </div>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider"
                    style={{ color: current.chip.color }}
                  >
                    {current.title}
                  </span>
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close tour"
                    className={cn(
                      "ml-auto flex h-6 w-6 items-center justify-center rounded-md",
                      "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                      "hover:bg-[var(--color-bg-hover)] transition-colors",
                    )}
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Header row (no chip) */}
              {!current.chip && (
                <div className="flex items-start justify-between px-4 pt-4 pb-0">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-brand)] opacity-80 block mb-0.5">
                      {pageLabel}
                    </span>
                    <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug">
                      {current.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Close tour"
                    className={cn(
                      "ml-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md",
                      "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                      "hover:bg-[var(--color-bg-hover)] transition-colors",
                    )}
                  >
                    <X size={13} />
                  </button>
                </div>
              )}

              {/* Body */}
              <div className="px-4 pt-2 pb-4">
                {current.chip && (
                  <p className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-1">
                    {current.title}
                  </p>
                )}
                <p className="text-[12px] leading-[1.65] text-[var(--color-text-secondary)]">
                  {current.body}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-[var(--color-border-subtle)] px-4 py-3">
                {/* Step progress pills */}
                <div className="flex items-center gap-[3px]">
                  {steps.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Go to step ${i + 1}`}
                      onClick={() => setStep(i)}
                      className={cn(
                        "h-[5px] rounded-full transition-all duration-200",
                        i === step
                          ? "w-[18px] bg-[var(--color-brand)]"
                          : i < step
                            ? "w-[5px] bg-[var(--color-brand)]/35"
                            : "w-[5px] bg-[var(--color-border-subtle)]",
                      )}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-1.5">
                  {!isFirst && (
                    <button
                      type="button"
                      onClick={handlePrev}
                      className={cn(
                        "flex items-center gap-0.5 h-7 px-2.5 rounded-md",
                        "text-[12px] font-medium text-[var(--color-text-secondary)]",
                        "hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
                        "transition-colors",
                      )}
                    >
                      <ChevronLeft size={12} />
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNext}
                    className={cn(
                      "flex items-center gap-1 h-7 px-3 rounded-md",
                      "text-[12px] font-medium text-white",
                      "bg-[var(--color-brand)] hover:opacity-90 transition-opacity",
                    )}
                  >
                    {isLast ? "Done" : (
                      <>Next <ChevronRight size={12} /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ── Auto-show helper ─────────────────────────────

export function useTourAutoShow() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Coming from the landing page "Get started" CTA — start immediately
    const forced = sessionStorage.getItem(TOUR_FORCE_KEY);
    if (forced) {
      sessionStorage.removeItem(TOUR_FORCE_KEY);
      localStorage.removeItem(TOUR_SEEN_KEY);
      const t = setTimeout(() => setOpen(true), 350);
      return () => clearTimeout(t);
    }

    // Coming from the /workspace page CTA — always start the full onboarding tour
    const onboard = sessionStorage.getItem(WORKSPACE_ONBOARD_KEY);
    if (onboard) {
      sessionStorage.removeItem(WORKSPACE_ONBOARD_KEY);
      const t = setTimeout(() => setOpen(true), 500);
      return () => clearTimeout(t);
    }

    // Normal auto-show for first-time visitors
    const seen = localStorage.getItem(TOUR_SEEN_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const openTour  = useCallback(() => setOpen(true),  []);
  const closeTour = useCallback(() => {
    localStorage.setItem(TOUR_SEEN_KEY, "1");
    setOpen(false);
  }, []);

  return { open, openTour, closeTour };
}
