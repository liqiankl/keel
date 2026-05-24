"use client";

import { useState } from "react";
import {
  Link2,
  Plus,
  Copy,
  Check,
  Lock,
  Globe,
  EyeOff,
  Trash2,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewShareLinkModal } from "./NewShareLinkModal";
import { useViewsStore, type ShareableView } from "@/store/useViewsStore";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────
// ViewsView — manage shareable read-only
// roadmap links (User Story 5.2).
// ─────────────────────────────────────────────

export function ViewsView() {
  const { views, revokeView, restoreView, deleteView } = useViewsStore();
  const [modalOpen, setModalOpen] = useState(false);

  const liveViews = views.filter((v) => !v.revokedAt);
  const revokedViews = views.filter((v) => v.revokedAt);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title="Views"
        rightSlot={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
            className="gap-1.5"
          >
            <Plus size={13} />
            New share link
          </Button>
        }
      />

      <div className="flex-1 overflow-y-auto">
        {views.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <EmptyState
              Icon={Share2}
              title="No shareable views yet"
              description="Generate a read-only link to your roadmap for stakeholders who don't have access. Links stay live and always reflect the current plan."
              action={{ label: "New share link", onClick: () => setModalOpen(true) }}
            />
          </div>
        ) : (
          <div className="p-6 space-y-6 max-w-3xl">
            {liveViews.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-1">
                  Live — {liveViews.length}
                </h2>
                <div className="space-y-2">
                  {liveViews.map((view) => (
                    <ViewCard
                      key={view.id}
                      view={view}
                      onRevoke={() => revokeView(view.id)}
                      onDelete={() => deleteView(view.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {revokedViews.length > 0 && (
              <section className="space-y-2">
                <h2 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider px-1">
                  Revoked — {revokedViews.length}
                </h2>
                <div className="space-y-2">
                  {revokedViews.map((view) => (
                    <ViewCard
                      key={view.id}
                      view={view}
                      onRestore={() => restoreView(view.id)}
                      onDelete={() => deleteView(view.id)}
                    />
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
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-colors",
        isRevoked
          ? "border-[var(--color-border-subtle)] bg-[var(--color-bg-base)] opacity-60"
          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] hover:border-[var(--color-border-default)]",
      )}
    >
      {/* Top row: plan label + status badge + actions */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Status dot */}
          <span
            className={cn(
              "mt-0.5 h-2 w-2 flex-shrink-0 rounded-full",
              isRevoked
                ? "bg-[var(--color-text-muted)]"
                : "bg-[var(--color-success)]",
            )}
            aria-label={isRevoked ? "Revoked" : "Live"}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {view.planLabel} Plan
              </span>
              {/* Badges */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {isRevoked ? (
                  <Badge variant="muted">Revoked</Badge>
                ) : (
                  <Badge variant="success">Live</Badge>
                )}
                {view.passwordProtected && (
                  <Badge variant="default" icon={<Lock size={10} />}>
                    Password
                  </Badge>
                )}
                {view.hiddenFields.map((f) => (
                  <Badge key={f} variant="default" icon={<EyeOff size={10} />}>
                    {f === "effort" ? "Effort hidden" : "Scores hidden"}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              {isRevoked ? (
                <Globe size={11} className="flex-shrink-0" />
              ) : (
                <Link2 size={11} className="flex-shrink-0" />
              )}
              <span className="font-mono truncate max-w-[320px]">{view.url}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isRevoked && (
            <button
              onClick={copyUrl}
              title={copied ? "Copied!" : "Copy link"}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
              )}
              aria-label="Copy link"
            >
              {copied ? <Check size={13} className="text-[var(--color-success)]" /> : <Copy size={13} />}
            </button>
          )}
          {onRestore && (
            <button
              onClick={onRestore}
              title="Restore link"
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
              )}
              aria-label="Restore link"
            >
              <RotateCcw size={13} />
            </button>
          )}
          {onRevoke && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRevoke}
              className="h-7 px-2 text-xs text-[var(--color-text-muted)]"
            >
              Revoke
            </Button>
          )}
          <button
            onClick={onDelete}
            title="Delete"
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
              "text-[var(--color-text-muted)] hover:bg-[var(--color-danger)]/10 hover:text-[var(--color-danger)]",
            )}
            aria-label="Delete"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Footer: metadata */}
      <div className="mt-3 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
        <span>Created {createdDate} by {view.createdBy}</span>
        {isRevoked && view.revokedAt && (
          <>
            <span className="h-3 w-px bg-[var(--color-border-subtle)]" />
            <span>
              Revoked{" "}
              {new Date(view.revokedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

// ── Badge ──────────────────────────────────

function Badge({
  children,
  variant = "default",
  icon,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "muted";
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        variant === "success" &&
          "bg-[var(--color-success)]/10 text-[var(--color-success)]",
        variant === "muted" &&
          "bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]",
        variant === "default" &&
          "bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]",
      )}
    >
      {icon}
      {children}
    </span>
  );
}
