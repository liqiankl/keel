"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

// ─────────────────────────────────────────────
// Button — variants: primary, secondary, ghost,
// icon. Heights match the 36px design token.
// ─────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize    = "sm" | "md" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium rounded-md " +
  "transition-colors duration-100 select-none " +
  "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-2 " +
  "disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-brand)] text-[var(--color-brand-foreground)] " +
    "hover:bg-[var(--color-brand-hover)] active:bg-[var(--color-brand-hover)]",
  secondary:
    "bg-transparent border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] " +
    "hover:bg-[var(--color-bg-hover)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] " +
    "hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
  danger:
    "bg-transparent border border-[var(--color-danger)] text-[var(--color-danger)] " +
    "hover:bg-[var(--color-danger)] hover:text-white",
};

const SIZES: Record<ButtonSize, string> = {
  md:   "h-9 px-4 text-sm",
  sm:   "h-7 px-3 text-xs",
  icon: "h-8 w-8 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "secondary",
      size = "md",
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(BASE, VARIANTS[variant], SIZES[size], className)}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
