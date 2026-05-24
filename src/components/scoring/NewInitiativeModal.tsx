"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { DEMO_WORKSPACE, CURRENT_QUARTER } from "@/lib/constants";
import { SEED_PLAN } from "@/lib/seed";
import type { RoadmapItem, InitiativeStatus, Priority } from "@/types";

// ─────────────────────────────────────────────
// NewInitiativeModal — create a scoring initiative.
// Mirrors NewRequestModal's pattern: large title,
// metadata chips row, footer submit.
// ─────────────────────────────────────────────

interface NewInitiativeModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: RoadmapItem) => void;
}

interface FormState {
  title: string;
  description: string;
  productArea: string;
  status: InitiativeStatus;
  priority: Priority;
  effortPoints: string;
  goalIds: string[];
}

const DEFAULT_FORM: FormState = {
  title: "",
  description: "",
  productArea: "",
  status: "backlog",
  priority: "medium",
  effortPoints: "",
  goalIds: [],
};

const STATUS_OPTIONS: { value: InitiativeStatus; label: string }[] = [
  { value: "backlog",     label: "Backlog" },
  { value: "todo",        label: "Todo" },
  { value: "in_progress", label: "In Progress" },
  { value: "done",        label: "Done" },
  { value: "canceled",    label: "Canceled" },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: "urgent", label: "Urgent" },
  { value: "high",   label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low",    label: "Low" },
  { value: "none",   label: "None" },
];

const GOALS = SEED_PLAN.goals;

export function NewInitiativeModal({ open, onClose, onSubmit }: NewInitiativeModalProps) {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  function handleChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleGoal(goalId: string) {
    setForm((prev) => ({
      ...prev,
      goalIds: prev.goalIds.includes(goalId)
        ? prev.goalIds.filter((id) => id !== goalId)
        : [...prev.goalIds, goalId],
    }));
  }

  function handleSubmit() {
    if (!form.title.trim()) return;

    setSubmitting(true);

    const now = new Date().toISOString();
    const points = form.effortPoints ? parseInt(form.effortPoints, 10) : null;

    const newItem: RoadmapItem = {
      id: `init_${Date.now()}`,
      featureRequestId: null,
      title: form.title.trim(),
      description: form.description.trim(),
      assignedPmId: DEMO_WORKSPACE.currentUser.id,
      goalIds: form.goalIds,
      productArea: form.productArea || "Core Product",
      status: form.status,
      priority: form.priority,
      effort: {
        unit: "story_points",
        points: points && !isNaN(points) ? points : null,
        tshirt: null,
        weeks: null,
      },
      quarter: CURRENT_QUARTER,
      score: null,
      dependencies: [],
      jiraEpicId: null,
      linearProjectId: null,
      createdAt: now,
      updatedAt: now,
    };

    onSubmit(newItem);
    setForm(DEFAULT_FORM);
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
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-40 bg-[var(--color-bg-overlay)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />

        <Dialog.Content
          className={cn(
            "fixed z-50 left-1/2 top-[30%] -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-[580px] mx-4",
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
          {/* Header breadcrumb */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <div
              className="flex h-[18px] w-[18px] items-center justify-center rounded text-[9px] font-bold text-white flex-shrink-0"
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
                New initiative
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

          {/* Title */}
          <div className="px-4 pb-2">
            <textarea
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Initiative title"
              rows={1}
              className={cn(
                "w-full resize-none bg-transparent",
                "text-[16px] font-medium text-[var(--color-text-primary)]",
                "placeholder:text-[var(--color-text-muted)]",
                "outline-none border-none leading-snug min-h-[32px]",
              )}
              style={{ height: "auto" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
              autoFocus
              aria-label="Initiative title"
            />
          </div>

          {/* Description */}
          <div className="px-4 pb-3">
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Add description… (what outcome does this drive?)"
              rows={2}
              className={cn(
                "w-full resize-none bg-transparent",
                "text-[13px] text-[var(--color-text-secondary)]",
                "placeholder:text-[var(--color-text-muted)]",
                "outline-none border-none leading-relaxed",
              )}
              aria-label="Initiative description"
            />
          </div>

          {/* Metadata chips row */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-t border-[var(--color-border-subtle)]">
            {/* Status */}
            <ChipSelect
              value={form.status}
              onChange={(v) => handleChange("status", v as InitiativeStatus)}
              options={STATUS_OPTIONS}
              aria-label="Status"
            />

            {/* Priority */}
            <ChipSelect
              value={form.priority}
              onChange={(v) => handleChange("priority", v as Priority)}
              options={PRIORITY_OPTIONS}
              aria-label="Priority"
            />

            {/* Product area */}
            <input
              type="text"
              value={form.productArea}
              onChange={(e) => handleChange("productArea", e.target.value)}
              placeholder="Product area"
              list="initiative-product-areas"
              className={cn(
                "h-[26px] rounded-md px-2 text-[12px]",
                "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                "focus:outline-none focus:border-[var(--color-brand)]",
                "transition-colors w-28",
              )}
              aria-label="Product area"
            />
            <datalist id="initiative-product-areas">
              {DEMO_WORKSPACE.productAreas.map((area) => (
                <option key={area} value={area} />
              ))}
            </datalist>

            {/* Effort points */}
            <input
              type="number"
              value={form.effortPoints}
              onChange={(e) => handleChange("effortPoints", e.target.value)}
              placeholder="Points"
              min={0}
              className={cn(
                "h-[26px] rounded-md px-2 text-[12px] w-16",
                "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                "focus:outline-none focus:border-[var(--color-brand)]",
                "transition-colors [appearance:textfield]",
                "[&::-webkit-outer-spin-button]:appearance-none",
                "[&::-webkit-inner-spin-button]:appearance-none",
              )}
              aria-label="Effort in story points"
            />
          </div>

          {/* Goal links */}
          {GOALS.length > 0 && (
            <div className="px-4 py-2 border-t border-[var(--color-border-subtle)]">
              <p className="text-[11px] font-medium text-[var(--color-text-muted)] mb-1.5">
                Link to goals
              </p>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((goal) => {
                  const checked = form.goalIds.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      aria-pressed={checked}
                      className={cn(
                        "flex items-center gap-1.5 h-[22px] px-2 rounded-full text-[11px]",
                        "border transition-colors",
                        checked
                          ? "border-[var(--color-brand)] bg-[var(--color-brand)]/10 text-[var(--color-brand)]"
                          : "border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]",
                      )}
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: goal.color }}
                        aria-hidden="true"
                      />
                      {goal.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-[var(--color-border-subtle)]">
            <div className="flex-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!canSubmit}
              loading={submitting}
            >
              Create initiative
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Internal select chip ───────────────────

function ChipSelect<T extends string>({
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
