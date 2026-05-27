"use client";

import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type ToastType = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastContainer = useCallback(() => {
    if (typeof window === "undefined" || toasts.length === 0) return null;
    return createPortal(
      <div className="fixed bottom-20 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastBubble key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>,
      document.body,
    );
  }, [toasts, dismiss]);

  return { showToast, ToastContainer };
}

function ToastBubble({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 16);
    return () => clearTimeout(t);
  }, []);

  const isSuccess = toast.type === "success";

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl",
        "min-w-[220px] max-w-[360px]",
        "bg-[var(--color-bg-elevated)] border-[var(--color-border-strong)]",
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className={cn(
          "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
          isSuccess ? "bg-[var(--color-success)]" : "bg-[var(--color-danger)]",
        )}
      >
        {isSuccess
          ? <Check size={11} className="text-white" />
          : <AlertCircle size={11} className="text-white" />
        }
      </span>
      <p className="flex-1 text-sm text-[var(--color-text-primary)]">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="flex-shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
        aria-label="Dismiss"
      >
        <X size={13} />
      </button>
    </div>
  );
}
