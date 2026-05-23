"use client";

import { useState, useId } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import type { CustomDimension } from "@/types";

// ─────────────────────────────────────────────
// CustomDimensionsModal — add / remove custom
// scoring dimensions and configure scale + weight.
// ─────────────────────────────────────────────

interface CustomDimensionsModalProps {
  open: boolean;
  onClose: () => void;
  dimensions: CustomDimension[];
  onAdd: (dim: CustomDimension) => void;
  onRemove: (dimId: string) => void;
}

interface NewDimState {
  name: string;
  scale: 5 | 10;
  weight: number;
}

const EMPTY: NewDimState = { name: "", scale: 10, weight: 5 };

export function CustomDimensionsModal({
  open,
  onClose,
  dimensions,
  onAdd,
  onRemove,
}: CustomDimensionsModalProps) {
  const [newDim, setNewDim] = useState<NewDimState>(EMPTY);
  const nameId = useId();
  const scaleId = useId();
  const weightId = useId();

  function handleAdd() {
    if (!newDim.name.trim()) return;
    onAdd({
      id:     `dim_${Date.now()}`,
      name:   newDim.name.trim(),
      scale:  newDim.scale,
      weight: newDim.weight,
    });
    setNewDim(EMPTY);
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
            "outline-none focus:ring-0",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] px-5 py-4">
            <div>
              <Dialog.Title className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                Custom Dimensions
              </Dialog.Title>
              <Dialog.Description className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                Define weighted scoring dimensions for your team.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md",
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

          {/* Existing dimensions */}
          <div className="px-5 py-3 max-h-60 overflow-y-auto">
            {dimensions.length === 0 ? (
              <p className="text-[12px] text-[var(--color-text-muted)] text-center py-4">
                No custom dimensions yet. Add one below.
              </p>
            ) : (
              <div className="space-y-1">
                {dimensions.map((dim) => (
                  <div
                    key={dim.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2",
                      "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--color-text-primary)] truncate">
                        {dim.name}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        Scale 1–{dim.scale} · Weight {dim.weight}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(dim.id)}
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded",
                        "text-[var(--color-text-muted)] hover:text-[var(--color-danger)]",
                        "hover:bg-[var(--color-bg-hover)] transition-colors",
                        "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)]",
                      )}
                      aria-label={`Remove ${dim.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new dimension form */}
          <div className="border-t border-[var(--color-border-subtle)] px-5 py-4 space-y-3">
            <p className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
              New dimension
            </p>

            <div className="space-y-2">
              <div>
                <label htmlFor={nameId} className="block text-[12px] text-[var(--color-text-secondary)] mb-1">
                  Name
                </label>
                <input
                  id={nameId}
                  type="text"
                  placeholder="e.g. Strategic Alignment"
                  value={newDim.name}
                  onChange={(e) => setNewDim((s) => ({ ...s, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                  className={cn(
                    "w-full h-8 rounded-md px-3 text-[13px]",
                    "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                    "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                    "focus:outline-none focus:border-[var(--color-brand)]",
                  )}
                />
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor={scaleId} className="block text-[12px] text-[var(--color-text-secondary)] mb-1">
                    Scale
                  </label>
                  <select
                    id={scaleId}
                    value={newDim.scale}
                    onChange={(e) => setNewDim((s) => ({ ...s, scale: Number(e.target.value) as 5 | 10 }))}
                    className={cn(
                      "w-full h-8 rounded-md px-2 text-[13px] appearance-none",
                      "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                      "text-[var(--color-text-primary)]",
                      "focus:outline-none focus:border-[var(--color-brand)]",
                    )}
                  >
                    <option value={5}>1–5</option>
                    <option value={10}>1–10</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label htmlFor={weightId} className="block text-[12px] text-[var(--color-text-secondary)] mb-1">
                    Weight ({newDim.weight})
                  </label>
                  <input
                    id={weightId}
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={newDim.weight}
                    onChange={(e) => setNewDim((s) => ({ ...s, weight: Number(e.target.value) }))}
                    className="w-full mt-1.5 accent-[var(--color-brand)]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Done
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAdd}
                disabled={!newDim.name.trim()}
                className="gap-1.5"
              >
                <Plus size={12} />
                Add dimension
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
