"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────
// TourGuide — step-by-step spotlight walkthrough.
// Renders via portal so z-index always wins.
// Highlights DOM elements via data-tour attributes.
// ─────────────────────────────────────────────

const TOUR_SEEN_KEY  = "keel-tour-seen";
export const TOUR_FORCE_KEY = "keel-start-tour"; // sessionStorage — set by landing page CTA

interface TourStep {
  id: string;
  target?: string;               // value of data-tour="..." attribute
  title: string;
  body: string;
  placement: "right" | "center"; // right = anchored to sidebar element
  chip?: { label: string; color: string };
}

const STEPS: TourStep[] = [
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
    body: "Keel organises everything by team. You have two teams in this workspace — each with fully independent issues, prioritization, and quarterly plans.",
    placement: "right",
  },
  {
    id: "team-navigators",
    target: "team-navigators",
    title: "Navigators",
    body: "The Navigators team owns product strategy and roadmap planning. Their Q2 2026 plan has 5 active initiatives across Core Product, Growth, and Integrations.",
    placement: "right",
    chip: { label: "N", color: "#5e5ce6" },
  },
  {
    id: "team-hitchhiker",
    target: "team-hitchhiker",
    title: "Hitchhiker",
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
    title: "Prioritize",
    body: "Score your initiatives using RICE, MoSCoW, WSJF, or a custom weighted framework. Click the ⓘ icon beside each tab to understand the formula.",
    placement: "right",
  },
  {
    id: "roadmap",
    target: "nav-roadmap",
    title: "Roadmap",
    body: "Each team's quarterly plan is shown as a kanban board — Backlog → Planned → In Progress → Done. Plans can be drafted, reviewed, approved, and locked.",
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

interface Rect { top: number; left: number; width: number; height: number; }

function measureTarget(target: string): Rect | null {
  const el = document.querySelector(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

// ── Main component ─────────────────────────────

interface TourGuideProps {
  open: boolean;
  onClose: () => void;
}

export function TourGuide({ open, onClose }: TourGuideProps) {
  const [step, setStep]       = useState(0);
  const [rect, setRect]       = useState<Rect | null>(null);
  const [mounted, setMounted] = useState(false);

  const current    = STEPS[step];
  const isCentered = current.placement === "center";
  const isFirst    = step === 0;
  const isLast     = step === STEPS.length - 1;

  useEffect(() => { setMounted(true); }, []);

  // Re-measure target whenever step changes
  useEffect(() => {
    if (!open || !current.target) { setRect(null); return; }
    const id = setTimeout(() => setRect(measureTarget(current.target!)), 60);
    return () => clearTimeout(id);
  }, [open, step, current.target]);

  // Reset to step 0 on close
  useEffect(() => { if (!open) setStep(0); }, [open]);

  const handleNext = useCallback(() => {
    if (isLast) { onClose(); }
    else setStep((s) => s + 1);
  }, [isLast, onClose]);

  const handlePrev = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  const handleClose = useCallback(() => {
    localStorage.setItem(TOUR_SEEN_KEY, "1");
    onClose();
  }, [onClose]);

  // ESC key
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, handleClose]);

  // Tooltip anchor position (right of sidebar element)
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
    return {
      position: "fixed",
      top: rect.top + rect.height / 2,
      left: rect.left + rect.width + GAP,
      transform: "translateY(-50%)",
      zIndex: 9002,
    };
  }, [isCentered, rect]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* ── Click-outside capture layer ──────────── */}
          <motion.div
            key="tour-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0"
            style={{ zIndex: 9000 }}
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* ── Spotlight / dim layer ─────────────────── */}
          {isCentered ? (
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
            rect && (
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
            )
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
              {/* Team chip row */}
              {current.chip && (
                <div className="flex items-center gap-2 px-4 pt-4 pb-0">
                  <div
                    className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
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
                  <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug">
                    {current.title}
                  </h3>
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
                  {STEPS.map((_, i) => (
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
      // Clear "seen" so the tour isn't suppressed for returning users who clicked CTA again
      localStorage.removeItem(TOUR_SEEN_KEY);
      const t = setTimeout(() => setOpen(true), 350); // short delay for the app to paint
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
