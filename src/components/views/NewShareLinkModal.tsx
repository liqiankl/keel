"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { useAppStore } from "@/store/useAppStore";
import { useViewsStore, type HiddenField, type ShareableView } from "@/store/useViewsStore";

// ─────────────────────────────────────────────
// NewShareLinkModal — create a shareable
// read-only roadmap link with optional password
// protection and field visibility controls.
// ─────────────────────────────────────────────

interface NewShareLinkModalProps {
  open: boolean;
  onClose: () => void;
}

function generateToken() {
  return Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 10);
}

export function NewShareLinkModal({ open, onClose }: NewShareLinkModalProps) {
  const plans = useRoadmapStore((s) => s.plans);
  const currentUser = useAppStore((s) => s.workspace.currentUser);
  const createView = useViewsStore((s) => s.createView);

  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id ?? "");
  const [passwordProtected, setPasswordProtected] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hiddenFields, setHiddenFields] = useState<Set<HiddenField>>(new Set());

  function toggleHiddenField(field: HiddenField) {
    setHiddenFields((prev) => {
      const next = new Set(prev);
      if (next.has(field)) next.delete(field);
      else next.add(field);
      return next;
    });
  }

  function handleSubmit() {
    const plan = plans.find((p) => p.id === selectedPlanId);
    if (!plan) return;

    const token = generateToken();
    const view: ShareableView = {
      id: `view_${Date.now()}`,
      planId: plan.id,
      planLabel: plan.quarter.label,
      token,
      url: `${window.location.origin}/share/${token}`,
      passwordProtected,
      password: passwordProtected && password ? password : null,
      hiddenFields: Array.from(hiddenFields),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      revokedAt: null,
    };

    createView(view);
    handleClose();
  }

  function handleClose() {
    setSelectedPlanId(plans[0]?.id ?? "");
    setPasswordProtected(false);
    setPassword("");
    setShowPassword(false);
    setHiddenFields(new Set());
    onClose();
  }

  const canSubmit = selectedPlanId && (!passwordProtected || password.length > 0);

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && handleClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-md rounded-xl border border-[var(--color-border-subtle)]",
            "bg-[var(--color-bg-surface)] shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2",
            "data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-4">
            <Dialog.Title className="text-sm font-semibold text-[var(--color-text-primary)]">
              New share link
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
                aria-label="Close"
              >
                <X size={15} />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            {/* Plan selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Roadmap plan
              </label>
              {plans.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)]">
                  No plans found. Create a plan in the Roadmap view first.
                </p>
              ) : (
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className={cn(
                    "w-full rounded-md border border-[var(--color-border-subtle)]",
                    "bg-[var(--color-bg-base)] px-3 py-2 text-sm",
                    "text-[var(--color-text-primary)]",
                    "focus:outline-2 focus:outline-[var(--color-brand)]",
                  )}
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.quarter.label} Plan
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Password protection */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setPasswordProtected((v) => !v);
                  setPassword("");
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors",
                  passwordProtected
                    ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5"
                    : "border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)]",
                )}
              >
                <div className="flex items-center gap-3">
                  <Lock
                    size={15}
                    className={
                      passwordProtected
                        ? "text-[var(--color-brand)]"
                        : "text-[var(--color-text-muted)]"
                    }
                  />
                  <div>
                    <p className="text-xs font-medium text-[var(--color-text-primary)]">
                      Password protect
                    </p>
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      Require a password to view this link
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0",
                    passwordProtected
                      ? "border-[var(--color-brand)] bg-[var(--color-brand)]"
                      : "border-[var(--color-border-subtle)]",
                  )}
                >
                  {passwordProtected && (
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </button>

              {passwordProtected && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                    className={cn(
                      "w-full rounded-md border border-[var(--color-border-subtle)]",
                      "bg-[var(--color-bg-base)] px-3 py-2 pr-9 text-sm",
                      "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                      "focus:outline-2 focus:outline-[var(--color-brand)]",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              )}
            </div>

            {/* Hidden fields */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                Hide from recipients
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { field: "effort" as HiddenField, label: "Effort estimates" },
                    { field: "scores" as HiddenField, label: "Internal scores" },
                  ] as const
                ).map(({ field, label }) => (
                  <button
                    key={field}
                    type="button"
                    onClick={() => toggleHiddenField(field)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      hiddenFields.has(field)
                        ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                        : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[var(--color-text-muted)]">
                Selected fields will not appear in the shared view.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border-subtle)] px-5 py-3">
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit || plans.length === 0}
            >
              Generate link
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
