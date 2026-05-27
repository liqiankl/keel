"use client";

import { useState, useEffect } from "react";
import {
  Link2, Plus, Copy, Check, Lock,
  Globe, EyeOff, Trash2, RotateCcw,
  Share2, Zap, Eye, ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { NewShareLinkModal } from "./NewShareLinkModal";
import { useViewsStore, type ShareableView } from "@/store/useViewsStore";
import { useGuestSession } from "@/context/GuestSessionContext";
import { cn } from "@/lib/cn";

export function ViewsView() {
  const { views, revokeView, restoreView, deleteView } = useViewsStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isGuest } = useGuestSession();

  useEffect(() => { setMounted(true); }, []);

  const effectiveViews = isGuest ? [] : views;
  const liveViews    = effectiveViews.filter((v) => !v.revokedAt);
  const revokedViews = effectiveViews.filter((v) =>  v.revokedAt);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Views" />

      <div className="flex-1 overflow-y-auto relative">
        {mounted && effectiveViews.length === 0 && (
          <EmptyViews isGuest={isGuest} onNew={() => setModalOpen(true)} />
        )}
        {mounted && effectiveViews.length > 0 && (
          <div className="p-6 space-y-6 max-w-3xl">
            {liveViews.length > 0 && (
              <section className="space-y-2">
                <SectionLabel>Live · {liveViews.length}</SectionLabel>
                <div className="space-y-2">
                  {liveViews.map((view) => (
                    <ViewCard key={view.id} view={view} onRevoke={() => revokeView(view.id)} onDelete={() => deleteView(view.id)} />
                  ))}
                </div>
              </section>
            )}
            {revokedViews.length > 0 && (
              <section className="space-y-2">
                <SectionLabel>Revoked · {revokedViews.length}</SectionLabel>
                <div className="space-y-2">
                  {revokedViews.map((view) => (
                    <ViewCard key={view.id} view={view} onRestore={() => restoreView(view.id)} onDelete={() => deleteView(view.id)} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <NewShareLinkModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

// ── Empty state ────────────────────────────

const FEATURES = [
  { Icon: Zap,         title: "Always live",   body: "Links update instantly as your roadmap changes." },
  { Icon: Eye,         title: "Read-only",      body: "Stakeholders see your plan without workspace access." },
  { Icon: ShieldCheck, title: "Access control", body: "Optional password protection and field hiding." },
];

const STEPS = [
  { n: "1", text: "Choose a quarterly plan" },
  { n: "2", text: "Configure visibility" },
  { n: "3", text: "Copy & share the link" },
];

function EmptyViews({ isGuest, onNew }: { isGuest: boolean; onNew: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-16">
      <div className="w-full max-w-md flex flex-col items-center">

        {/* Icon */}
        <Share2
          size={20}
          className="mb-6"
          style={{ color: "var(--color-text-muted)", opacity: 0.4 }}
        />

        {/* Headline */}
        <h2
          className="text-[18px] font-medium tracking-tight text-center mb-2"
          style={{ color: "var(--color-text-primary)" }}
        >
          Share your roadmap
        </h2>

        {/* Subtext */}
        <p
          className="text-[13px] text-center leading-relaxed mb-10 max-w-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          {isGuest
            ? "No links shared yet — once created, your shared roadmap links will appear here."
            : "No links shared yet — create one and give your stakeholders a window into your roadmap in seconds."}
        </p>

        {/* Features */}
        <div className="w-full flex flex-col mb-10">
          {FEATURES.map(({ Icon, title, body }, i) => (
            <div key={title}>
              {i > 0 && (
                <div className="flex justify-center gap-1 py-2">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className="h-[3px] w-[3px] rounded-full"
                      style={{ backgroundColor: "var(--color-border-strong)" }}
                    />
                  ))}
                </div>
              )}
              <div className="flex items-start gap-4 py-2">
                <Icon
                  size={14}
                  className="mt-0.5 flex-shrink-0"
                  style={{ color: "var(--color-text-muted)", opacity: 0.5 }}
                />
                <div>
                  <p className="text-[13px] font-medium mb-0.5" style={{ color: "var(--color-text-primary)" }}>
                    {title}
                  </p>
                  <p className="text-[12px] leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                    {body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        {!isGuest && (
          <div className="w-full mb-10">
            <p
              className="text-[11px] font-medium uppercase tracking-widest mb-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              How it works
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-2">
              {STEPS.map(({ n, text }, i) => (
                <div key={n} className="flex items-center gap-2 flex-1">
                  <div className="flex items-start gap-2 flex-1">
                    <span
                      className="h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5"
                      style={{
                        backgroundColor: "var(--color-bg-surface)",
                        border: "1px solid var(--color-border-strong)",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {n}
                    </span>
                    <span className="text-[12px] leading-snug" style={{ color: "var(--color-text-secondary)" }}>
                      {text}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="h-px w-4 flex-shrink-0 mt-2.5" style={{ backgroundColor: "var(--color-border-subtle)" }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        {!isGuest && (
          <button
            onClick={onNew}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-medium text-white transition-all hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "var(--color-brand)" }}
          >
            <Plus size={13} />
            New share link
          </button>
        )}

      </div>
    </div>
  );
}

// ── Section label ──────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-[11px] font-semibold uppercase tracking-widest px-1"
      style={{ color: "var(--color-text-muted)" }}
    >
      {children}
    </h2>
  );
}

// ── ViewCard ───────────────────────────────

interface ViewCardProps {
  view: ShareableView;
  onRevoke?: () => void;
  onRestore?: () => void;
  onDelete: () => void;
}

function ViewCard({ view, onRevoke, onRestore, onDelete }: ViewCardProps) {
  const [copied, setCopied] = useState(false);
  const isRevoked = !!view.revokedAt;

  function copyUrl() {
    navigator.clipboard.writeText(view.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const createdDate = new Date(view.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <div
      className={cn("rounded-xl border p-4 transition-all", isRevoked ? "opacity-50" : "hover:border-[var(--color-border-strong)]")}
      style={{ backgroundColor: "var(--color-bg-surface)", border: "1px solid var(--color-border-subtle)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full"
            style={{ backgroundColor: isRevoked ? "var(--color-text-muted)" : "var(--color-success)" }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {view.planLabel} Plan
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {isRevoked
                  ? <Badge variant="muted">Revoked</Badge>
                  : <Badge variant="success">Live</Badge>}
                {view.passwordProtected && (
                  <Badge variant="default" icon={<Lock size={10} />}>Password</Badge>
                )}
                {view.hiddenFields.map((f) => (
                  <Badge key={f} variant="default" icon={<EyeOff size={10} />}>
                    {f === "effort" ? "Effort hidden" : "Scores hidden"}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              {isRevoked
                ? <Globe size={11} className="flex-shrink-0" />
                : <Link2 size={11} className="flex-shrink-0" />}
              <span className="font-mono truncate max-w-[340px]">{view.url}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {!isRevoked && (
            <button
              onClick={copyUrl}
              title={copied ? "Copied!" : "Copy link"}
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--color-bg-hover)]"
              style={{ color: "var(--color-text-muted)" }}
            >
              {copied
                ? <Check size={13} style={{ color: "var(--color-success)" }} />
                : <Copy size={13} />}
            </button>
          )}
          {onRestore && (
            <button
              onClick={onRestore}
              title="Restore link"
              className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--color-bg-hover)]"
              style={{ color: "var(--color-text-muted)" }}
            >
              <RotateCcw size={13} />
            </button>
          )}
          {onRevoke && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRevoke}
              className="h-7 px-2 text-xs"
            >
              Revoke
            </Button>
          )}
          <button
            onClick={onDelete}
            title="Delete"
            className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-[var(--color-danger)]/10"
            style={{ color: "var(--color-text-muted)" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <div
        className="mt-3 pt-3 flex items-center gap-3 text-[11px]"
        style={{ color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border-subtle)" }}
      >
        <span>Created {createdDate} by {view.createdBy}</span>
        {isRevoked && view.revokedAt && (
          <>
            <span className="h-3 w-px" style={{ backgroundColor: "var(--color-border-subtle)" }} />
            <span>
              Revoked {new Date(view.revokedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Badge ──────────────────────────────────

function Badge({ children, variant = "default", icon }: {
  children: React.ReactNode;
  variant?: "default" | "success" | "muted";
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        variant === "success" && "bg-[var(--color-success)]/10 text-[var(--color-success)]",
        variant === "muted"   && "bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]",
        variant === "default" && "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]",
      )}
    >
      {icon}
      {children}
    </span>
  );
}
