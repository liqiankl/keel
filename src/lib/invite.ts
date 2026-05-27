/**
 * MVP invite token utilities — JWT-based, no database.
 *
 * LIMITATIONS (by design):
 * - Tokens are self-contained; revocation requires changing JWT_SECRET (invalidates all tokens).
 * - No server-side pending-invite list; the in-store state is display-only.
 * - Not suitable for enterprise/multi-tenant production use.
 */

import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type InviteRole = "admin" | "member" | "viewer";

export interface InviteTokenPayload extends JWTPayload {
  email: string;
  workspaceId: string;
  workspaceName: string;
  role: InviteRole;
  inviterName: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Warn loudly in dev; production should always set this.
    console.warn("[invite] JWT_SECRET not set — using insecure fallback. Set it in .env.local.");
  }
  return new TextEncoder().encode(secret ?? "keel-dev-insecure-fallback-do-not-use-in-prod");
}

/** Sign a 7-day invite token. Server-side only. */
export async function signInviteToken(payload: Omit<InviteTokenPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

/** Verify and decode an invite token. Server-side only. */
export async function verifyInviteToken(token: string): Promise<InviteTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as InviteTokenPayload;
}
