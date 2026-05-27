"use client";

/**
 * InviteAcceptClient — renders the accept-invite UI.
 *
 * Flow:
 *  1. Read `token` from URL search params (client).
 *  2. Call GET /api/invite/verify to validate JWT server-side.
 *  3. Show workspace/role/inviter details.
 *  4. On "Accept", store membership in browser cookies via js-cookie, redirect to /.
 *
 * MVP LIMITATIONS:
 *  - Membership is stored in browser cookies only — not shared across devices.
 *  - Accepting again overwrites the prior session.
 *  - The Keel app store (Zustand) is not automatically updated; on redirect,
 *    the app re-mounts from persisted localStorage which is separate from cookies.
 *    A production system would merge the cookie session into the app state on boot.
 */

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Check, AlertCircle, Clock, Users, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { acceptWorkspaceMembership } from "@/lib/workspace-cookies";
import type { InviteTokenPayload, InviteRole } from "@/lib/invite";
import type { VerifyResponse } from "@/app/api/invite/verify/route";

type PageState =
  | { status: "loading" }
  | { status: "ready"; payload: InviteTokenPayload }
  | { status: "accepting" }
  | { status: "accepted" }
  | { status: "expired" }
  | { status: "invalid" }
  | { status: "missing" };

const ROLE_META: Record<InviteRole, { label: string; description: string; badgeBg: string; badgeText: string }> = {
  admin:  { label: "Admin",  description: "Full access — manage members, plans, and settings", badgeBg: "var(--color-admin-badge-bg)",  badgeText: "var(--color-admin-badge-text)"  },
  member: { label: "Member", description: "View",        badgeBg: "#f0faf4", badgeText: "#1a6b3c" },
  viewer: { label: "Viewer", description: "View shared roadmaps and quarterly plans",           badgeBg: "var(--color-bg-elevated)",    badgeText: "var(--color-text-secondary)"  },
};

export function InviteAcceptClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [state, setState] = useState<PageState>({ status: "loading" });

  // ── Verify token on mount ────────────────────────────────────────
  const verify = useCallback(async () => {
    if (!token) { setState({ status: "missing" }); return; }

    try {
      const res = await fetch(`/api/invite/verify?token=${encodeURIComponent(token)}`);
      const data: VerifyResponse = await res.json();

      if (data.valid) {
        setState({ status: "ready", payload: data.payload });
      } else {
        setState({ status: data.reason === "expired" ? "expired" : "invalid" });
      }
    } catch {
      setState({ status: "invalid" });
    }
  }, [token]);

  useEffect(() => { verify(); }, [verify]);

  // ── Accept invitation ────────────────────────────────────────────
  async function handleAccept() {
    if (state.status !== "ready") return;
    setState({ status: "accepting" });

    const { email, workspaceId, workspaceName, role } = state.payload;
    acceptWorkspaceMembership({ workspaceId, workspaceName, email, role, acceptedAt: new Date().toISOString(), isInvitedGuest: true });

    // Brief pause so the user sees the acceptance state.
    await new Promise((r) => setTimeout(r, 800));
    setState({ status: "accepted" });
    await new Promise((r) => setTimeout(r, 1200));
    router.push("/");
  }

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-md">
      {/* Brand header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-brand)] text-white font-bold text-lg select-none">
          K
        </div>
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Keel</span>
        <span className="text-[var(--color-text-muted)]">·</span>
        <span className="text-sm text-[var(--color-text-muted)]">Product Planning</span>
      </div>

      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] overflow-hidden">
        {state.status === "loading" && <LoadingState />}
        {state.status === "ready"    && <ReadyState payload={state.payload} onAccept={handleAccept} />}
        {state.status === "accepting" && <AcceptingState />}
        {state.status === "accepted"  && <AcceptedState />}
        {state.status === "expired"   && <ErrorState type="expired" />}
        {state.status === "invalid"   && <ErrorState type="invalid" />}
        {state.status === "missing"   && <ErrorState type="missing" />}
      </div>

      <p className="text-center text-[11px] text-[var(--color-text-muted)] mt-6">
        This is an MVP prototype. Membership is stored in browser cookies only.
      </p>
    </div>
  );
}

// ── Sub-states ─────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="p-8 flex flex-col items-center gap-3">
      <Loader2 size={28} className="text-[var(--color-brand)] animate-spin" />
      <p className="text-sm text-[var(--color-text-secondary)]">Verifying invitation…</p>
    </div>
  );
}

function ReadyState({ payload, onAccept }: { payload: InviteTokenPayload; onAccept: () => void }) {
  const role = payload.role;
  const meta = ROLE_META[role];

  return (
    <>
      {/* Top strip */}
      <div className="px-7 pt-7 pb-5 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
              Workspace invitation
            </p>
            <h1 className="text-xl font-semibold text-[var(--color-text-primary)] leading-tight">
              {payload.workspaceName}
            </h1>
          </div>
          <span
            className="flex-shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full mt-1"
            style={{ backgroundColor: meta.badgeBg, color: meta.badgeText }}
          >
            {meta.label}
          </span>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <span className="font-medium text-[var(--color-text-primary)]">{payload.inviterName}</span>
          {" "}has invited you to join <span className="font-medium text-[var(--color-text-primary)]">{payload.workspaceName}</span> as a {meta.label.toLowerCase()}.
        </p>
      </div>

      {/* Details */}
      <div className="px-7 py-5 space-y-3 border-b border-[var(--color-border-subtle)]">
        <DetailRow icon={Users} label="Your role" value={meta.description} />
        <DetailRow icon={Clock} label="Expires" value="7 days from when the invite was sent" />
      </div>

      {/* Action */}
      <div className="px-7 py-5">
        <button
          onClick={onAccept}
          className={cn(
            "w-full flex items-center justify-center gap-2 h-10 rounded-lg",
            "bg-[var(--color-brand)] text-white text-sm font-semibold",
            "hover:bg-[var(--color-brand-hover)] transition-colors",
            "focus-visible:outline-2 focus-visible:outline-[var(--color-brand)] focus-visible:outline-offset-2",
          )}
        >
          Accept Invitation
          <ChevronRight size={15} />
        </button>
        <p className="text-center text-xs text-[var(--color-text-muted)] mt-3">
          You'll be taken to the {payload.workspaceName} workspace.
        </p>
      </div>
    </>
  );
}

function AcceptingState() {
  return (
    <div className="p-8 flex flex-col items-center gap-3">
      <Loader2 size={28} className="text-[var(--color-brand)] animate-spin" />
      <p className="text-sm text-[var(--color-text-secondary)]">Setting up your workspace access…</p>
    </div>
  );
}

function AcceptedState() {
  return (
    <div className="p-8 flex flex-col items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-success)]">
        <Check size={22} className="text-white" />
      </div>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">Invitation accepted!</p>
      <p className="text-sm text-[var(--color-text-secondary)]">Redirecting you to the workspace…</p>
    </div>
  );
}

function ErrorState({ type }: { type: "expired" | "invalid" | "missing" }) {
  const messages: Record<typeof type, { title: string; body: string }> = {
    expired: {
      title: "Invitation expired",
      body:  "This invite link has expired. Ask the workspace admin to send a new invitation.",
    },
    invalid: {
      title: "Invalid invitation",
      body:  "This invite link is invalid or has already been used. Ask for a new invitation.",
    },
    missing: {
      title: "No invitation found",
      body:  "No invite token was found in this URL. Check the link in your email and try again.",
    },
  };
  const { title, body } = messages[type];

  return (
    <div className="p-8 flex flex-col items-center gap-3 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
        <AlertCircle size={22} className="text-[var(--color-danger)]" />
      </div>
      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
      <p className="text-sm text-[var(--color-text-secondary)] max-w-xs leading-relaxed">{body}</p>
      <a
        href="/"
        className="mt-2 text-sm font-medium text-[var(--color-brand)] hover:underline"
      >
        Back to Keel
      </a>
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={14} className="text-[var(--color-text-muted)] mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">{label}</p>
        <p className="text-sm text-[var(--color-text-secondary)]">{value}</p>
      </div>
    </div>
  );
}
