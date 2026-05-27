/**
 * MVP workspace membership cookies — client-side only via js-cookie.
 *
 * LIMITATIONS (by design):
 * - State lives in the browser; clearing cookies resets membership.
 * - No server-side session validation; anyone can craft these cookies locally.
 * - No shared persistence — another device/browser won't see the membership.
 * - No revoke functionality.
 * - Suitable for prototype/demo only.
 */

import Cookies from "js-cookie";
import type { InviteRole } from "./invite";

const COOKIE_SESSION   = "keel_workspace_session";
const COOKIE_ROLE      = "keel_workspace_role";
const COOKIE_EMAIL     = "keel_invited_email";
const COOKIE_WORKSPACE = "keel_workspace_id";

const SEVEN_DAYS = 7;

export interface WorkspaceSession {
  workspaceId: string;
  workspaceName: string;
  email: string;
  role: InviteRole;
  acceptedAt: string;
  isInvitedGuest?: boolean; // true only for users who joined via invite link
}

/** Persist accepted workspace membership in browser cookies. */
export function acceptWorkspaceMembership(session: WorkspaceSession): void {
  const opts: Cookies.CookieAttributes = {
    expires: SEVEN_DAYS,
    sameSite: "Lax",
    // httpOnly cannot be set via js-cookie (client JS) — that's a server-side cookie concern.
    // For an MVP this is acceptable; in production use HttpOnly cookies set by the server.
    secure: process.env.NODE_ENV === "production",
  };

  Cookies.set(COOKIE_SESSION,   JSON.stringify(session), opts);
  Cookies.set(COOKIE_ROLE,      session.role,            opts);
  Cookies.set(COOKIE_EMAIL,     session.email,           opts);
  Cookies.set(COOKIE_WORKSPACE, session.workspaceId,     opts);
}

/** Read the current workspace session from cookies (returns null if not set). */
export function getWorkspaceSession(): WorkspaceSession | null {
  const raw = Cookies.get(COOKIE_SESSION);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WorkspaceSession;
  } catch {
    return null;
  }
}

/** Clear all workspace session cookies (sign-out). */
export function clearWorkspaceSession(): void {
  Cookies.remove(COOKIE_SESSION);
  Cookies.remove(COOKIE_ROLE);
  Cookies.remove(COOKIE_EMAIL);
  Cookies.remove(COOKIE_WORKSPACE);
}
