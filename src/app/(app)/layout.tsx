import { Sidebar } from "@/components/layout/Sidebar";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { GuestSessionProvider } from "@/context/GuestSessionContext";

// ─────────────────────────────────────────────
// Authenticated app shell layout.
// All routes inside (app)/ share this shell:
//   sidebar (fixed 176px) + content area (flex-1)
// ─────────────────────────────────────────────

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <GuestSessionProvider>
      <div className="flex h-screen overflow-hidden bg-[var(--color-bg-base)]">
        <Sidebar />
        <main
          id="main-content"
          className="flex flex-1 flex-col overflow-hidden min-w-0"
          tabIndex={-1}
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
    </GuestSessionProvider>
  );
}
