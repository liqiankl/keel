import { Suspense } from "react";
import { InviteAcceptClient } from "./InviteAcceptClient";

export const metadata = {
  title: "Accept Invitation — Keel",
};

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-4">
      <Suspense fallback={<InviteLoadingSkeleton />}>
        <InviteAcceptClient />
      </Suspense>
    </div>
  );
}

function InviteLoadingSkeleton() {
  return (
    <div className="w-full max-w-md rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-8 animate-pulse">
      <div className="h-10 w-10 rounded-lg bg-[var(--color-bg-elevated)] mb-6" />
      <div className="h-6 w-48 rounded bg-[var(--color-bg-elevated)] mb-3" />
      <div className="h-4 w-full rounded bg-[var(--color-bg-elevated)] mb-2" />
      <div className="h-4 w-3/4 rounded bg-[var(--color-bg-elevated)] mb-8" />
      <div className="h-10 w-full rounded-lg bg-[var(--color-bg-elevated)]" />
    </div>
  );
}
