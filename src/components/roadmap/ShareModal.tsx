"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Copy, Check, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

// ─────────────────────────────────────────────
// ShareModal — generates a read-only share link
// for stakeholder presentation. Access settings
// control who can view the link.
// ─────────────────────────────────────────────

interface ShareModalProps {
  open: boolean;
  planId: string;
  quarterLabel: string;
  onClose: () => void;
  onShareLinkGenerated?: (link: string) => void;
}

export function ShareModal({
  open,
  planId,
  quarterLabel,
  onClose,
  onShareLinkGenerated,
}: ShareModalProps) {
  const [copied, setCopied]       = useState(false);
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [requireAuth, setRequireAuth]     = useState(false);

  // Deterministic mock URL based on planId
  const shareLink = `https://keel.so/share/${planId.slice(-8)}`;

  function handleGenerate() {
    setLinkGenerated(true);
    onShareLinkGenerated?.(shareLink);
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareLink).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-[var(--color-bg-overlay)] backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md rounded-xl border border-[var(--color-border-subtle)]",
            "bg-[var(--color-bg-elevated)] shadow-[var(--shadow-lg)]",
            "outline-none",
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[var(--color-border-subtle)] px-5 py-4">
            <div>
              <Dialog.Title className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                Share roadmap
              </Dialog.Title>
              <Dialog.Description className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                {quarterLabel} · Read-only link for stakeholders
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md mt-0.5",
                  "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                  "hover:bg-[var(--color-bg-hover)] transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
                )}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            {/* Access mode toggle */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]">
              <div className="flex flex-col flex-1 gap-1">
                <span className="text-[13px] font-medium text-[var(--color-text-primary)]">
                  Link access
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  {requireAuth
                    ? "Only invited stakeholders can view"
                    : "Anyone with the link can view (read-only)"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRequireAuth((v) => !v)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium",
                  "border transition-colors",
                  requireAuth
                    ? "border-[var(--color-brand)] text-[var(--color-brand)] bg-[var(--color-brand-subtle)]"
                    : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
                )}
              >
                {requireAuth ? <Lock size={11} /> : <Globe size={11} />}
                {requireAuth ? "Restricted" : "Public"}
              </button>
            </div>

            {/* Link area */}
            {linkGenerated ? (
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                  Share link
                </label>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "flex-1 rounded-md border border-[var(--color-border-subtle)]",
                    "bg-[var(--color-bg-surface)] px-3 py-2",
                    "text-[12px] font-mono text-[var(--color-text-secondary)] truncate",
                  )}>
                    {shareLink}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-1.5 flex-shrink-0"
                  >
                    {copied ? <Check size={12} className="text-[var(--color-success)]" /> : <Copy size={12} />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  The link shows a live, read-only snapshot of this quarterly plan.
                  Stakeholders cannot make changes.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--color-border-subtle)] p-6 text-center">
                <Globe size={24} className="text-[var(--color-text-muted)] mx-auto mb-2" aria-hidden="true" />
                <p className="text-[13px] text-[var(--color-text-secondary)] mb-1">
                  No share link yet
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  Generate a link to share this roadmap with stakeholders.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border-subtle)] px-5 py-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {linkGenerated ? (
              <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-1.5">
                <Copy size={12} />
                Copy link
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleGenerate} className="gap-1.5">
                <Globe size={12} />
                Generate link
              </Button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
