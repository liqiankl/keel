"use client";

/**
 * GuestSessionContext — provides invited-user session state throughout the app.
 *
 * On mount, reads the `keel_workspace_session` cookie that was set when the
 * user accepted an invite at /invite?token=...  If present, `isGuest` is true
 * and the session payload is available.
 *
 * Guest restrictions (applied per-view, not here):
 *   - Global Inbox       → empty (they haven't submitted any requests)
 *   - My Issues          → empty (no personal issues yet)
 *   - Views              → empty (no shared links created yet)
 *   - Team content       → fully visible (Roadmap, Scoring, team Issues)
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getWorkspaceSession, type WorkspaceSession } from "@/lib/workspace-cookies";

interface GuestSessionValue {
  isGuest: boolean;
  session: WorkspaceSession | null;
}

const GuestSessionContext = createContext<GuestSessionValue>({
  isGuest: false,
  session: null,
});

export function GuestSessionProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState<GuestSessionValue>({ isGuest: false, session: null });

  useEffect(() => {
    const session = getWorkspaceSession();
    // Only treat as guest if the session was explicitly created via an invite link.
    // Workspace owners who tested the invite flow won't have isInvitedGuest set.
    if (session?.isInvitedGuest) {
      setValue({ isGuest: true, session });
    }
  }, []);

  return (
    <GuestSessionContext.Provider value={value}>
      {children}
    </GuestSessionContext.Provider>
  );
}

export function useGuestSession(): GuestSessionValue {
  return useContext(GuestSessionContext);
}
