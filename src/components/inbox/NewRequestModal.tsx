"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Paperclip } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { DEMO_WORKSPACE } from "@/lib/constants";
import type { FeatureRequest, RequestSource, PrioritySignal } from "@/types";

// ─────────────────────────────────────────────
// NewRequestModal — create feature request.
// Mirrors Linear's "New Issue" modal pattern:
// large title input, metadata chips below,
// footer with submit + "Create more" toggle.
// ─────────────────────────────────────────────

interface NewRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (req: FeatureRequest) => void;
}

interface FormState {
  title: string;
  description: string;
  businessContext: string;
  source: RequestSource;
  prioritySignal: PrioritySignal;
  productArea: string;
  tags: string;
}

const DEFAULT_FORM: FormState = {
  title: "",
  description: "",
  businessContext: "",
  source: "internal",
  prioritySignal: "important",
  productArea: "",
  tags: "",
};

const SOURCE_OPTIONS: { value: RequestSource; label: string }[] = [
  { value: "customer",    label: "Customer" },
  { value: "engineering", label: "Engineering" },
  { value: "internal",    label: "Internal" },
];

const SIGNAL_OPTIONS: { value: PrioritySignal; label: string }[] = [
  { value: "critical",     label: "Critical" },
  { value: "important",    label: "Important" },
  { value: "nice_to_have", label: "Nice to have" },
];

export function NewRequestModal({ open, onClose, onSubmit }: NewRequestModalProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [createMore, setCreateMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit() {
    if (!form.title.trim()) return;

    setSubmitting(true);

    const now = new Date().toISOString();
    const newRequest: FeatureRequest = {
      id: `req_${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      businessContext: form.businessContext.trim(),
      source: form.source,
      prioritySignal: form.prioritySignal,
      status: "new",
      tags: form.tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      productArea: form.productArea.trim() || null,
      goalIds: [],
      submittedBy: DEMO_WORKSPACE.currentUser.name,
      submittedAt: now,
      votes: [],
      comments: [],
      supportingLinks: [],
      mergedFromIds: [],
      externalRef: null,
    };

    onSubmit(newRequest);

    if (createMore) {
      setForm(DEFAULT_FORM);
    } else {
      onClose();
    }

    setSubmitting(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      onClose();
      setForm(DEFAULT_FORM);
    }
  }

  const canSubmit = form.title.trim().length > 0;

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-40",
            "bg-[var(--color-bg-overlay)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />

        {/* Panel */}
        <Dialog.Content
          className={cn(
            "fixed z-50 left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-[560px] mx-4",
            "rounded-xl border border-[var(--color-border-subtle)]",
            "bg-[var(--color-bg-elevated)] shadow-[var(--shadow-lg)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-top-4 data-[state=open]:slide-in-from-top-4",
            "focus:outline-none",
          )}
          aria-describedby={undefined}
        >
          {/* Breadcrumb header */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <div
              className="flex h-[18px] w-[18px] items-center justify-center rounded text-[10px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: DEMO_WORKSPACE.avatarColor }}
              aria-hidden="true"
            >
              {DEMO_WORKSPACE.name.charAt(0)}
            </div>
            <span className="text-[12px] text-[var(--color-text-muted)] flex items-center gap-1.5">
              <span className="text-[var(--color-text-secondary)] font-medium">
                {DEMO_WORKSPACE.name}
              </span>
              <span>›</span>
              <Dialog.Title className="text-[var(--color-text-muted)]">
                New request
              </Dialog.Title>
            </span>
            <div className="flex-1" />
            <Dialog.Close asChild>
              <button
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors rounded p-0.5 focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </Dialog.Close>
          </div>

          {/* Title input — large, no border */}
          <div className="px-4 pb-2">
            <textarea
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Request title"
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent",
                "text-[16px] font-medium text-[var(--color-text-primary)]",
                "placeholder:text-[var(--color-text-muted)]",
                "outline-none border-none leading-snug",
                "min-h-[32px]",
              )}
              style={{ height: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
              autoFocus
              aria-label="Request title"
            />
          </div>

          {/* Description */}
          <div className="px-4 pb-3">
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Add description… (what problem does this solve?)"
              rows={2}
              className={cn(
                "w-full resize-none bg-transparent",
                "text-[13px] text-[var(--color-text-secondary)]",
                "placeholder:text-[var(--color-text-muted)]",
                "outline-none border-none leading-relaxed",
              )}
              aria-label="Request description"
            />
          </div>

          {/* Metadata chips row */}
          <div className="flex items-center gap-2 px-4 py-2 border-t border-[var(--color-border-subtle)]">
            {/* Source */}
            <FieldSelect
              value={form.source}
              onChange={(v) => handleChange("source", v as RequestSource)}
              options={SOURCE_OPTIONS}
              aria-label="Source"
            />

            {/* Priority signal */}
            <FieldSelect
              value={form.prioritySignal}
              onChange={(v) => handleChange("prioritySignal", v as PrioritySignal)}
              options={SIGNAL_OPTIONS}
              aria-label="Priority signal"
            />

            {/* Product area */}
            <input
              type="text"
              value={form.productArea}
              onChange={(e) => handleChange("productArea", e.target.value)}
              placeholder="Product area"
              list="product-areas"
              className={cn(
                "h-[26px] rounded-md px-2 text-[12px]",
                "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                "focus:outline-none focus:border-[var(--color-brand)]",
                "transition-colors w-28",
              )}
              aria-label="Product area"
            />
            <datalist id="product-areas">
              {DEMO_WORKSPACE.productAreas.map((area) => (
                <option key={area} value={area} />
              ))}
            </datalist>

            {/* Tags */}
            <input
              type="text"
              value={form.tags}
              onChange={(e) => handleChange("tags", e.target.value)}
              placeholder="Tags (comma separated)"
              className={cn(
                "h-[26px] rounded-md px-2 text-[12px]",
                "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                "focus:outline-none focus:border-[var(--color-brand)]",
                "transition-colors flex-1 min-w-0",
              )}
              aria-label="Tags, comma separated"
            />
          </div>

          {/* Business context */}
          <div className="px-4 py-2 border-t border-[var(--color-border-subtle)]">
            <textarea
              value={form.businessContext}
              onChange={(e) => handleChange("businessContext", e.target.value)}
              placeholder="Business context… (why does this matter, what's the impact?)"
              rows={2}
              className={cn(
                "w-full resize-none bg-transparent",
                "text-[12px] text-[var(--color-text-secondary)]",
                "placeholder:text-[var(--color-text-muted)]",
                "outline-none border-none leading-relaxed",
              )}
              aria-label="Business context"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-border-subtle)]">
            <button
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
              aria-label="Attach file"
              title="Attach file (coming soon)"
            >
              <Paperclip size={14} />
            </button>

            <div className="flex-1" />

            {/* Create more toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div
                role="checkbox"
                aria-checked={createMore}
                tabIndex={0}
                onClick={() => setCreateMore((v) => !v)}
                onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") setCreateMore((v) => !v); }}
                className={cn(
                  "relative h-4 w-7 rounded-full transition-colors cursor-pointer",
                  "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
                  createMore
                    ? "bg-[var(--color-brand)]"
                    : "bg-[var(--color-border-strong)]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-sm",
                    "transition-transform duration-150",
                    createMore ? "translate-x-3.5" : "translate-x-0.5",
                  )}
                />
              </div>
              <span className="text-[12px] text-[var(--color-text-muted)]">Create more</span>
            </label>

            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit}
              loading={submitting}
            >
              Create request
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Internal field select chip ─────────────

function FieldSelect<T extends string>({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
}: {
  value: T;
  onChange: (v: string) => void;
  options: { value: T; label: string }[];
  "aria-label": string;
}) {
  const current = options.find((o) => o.value === value);
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className={cn(
        "h-[26px] rounded-md px-2 text-[12px] appearance-none",
        "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
        "text-[var(--color-text-primary)]",
        "focus:outline-none focus:border-[var(--color-brand)]",
        "transition-colors cursor-pointer",
      )}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
