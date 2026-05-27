/**
 * POST /api/invite
 *
 * Generates a signed JWT invite token and sends an invitation email
 * via Resend. No database — the token itself carries all invite state.
 *
 * MVP LIMITATIONS:
 * - No persistent invite record; revocation not possible without rotating JWT_SECRET.
 * - Duplicate invites are not server-prevented (UI layer deduplicates against local state).
 * - Rate limiting is not implemented.
 */

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { signInviteToken, type InviteRole } from "@/lib/invite";
import { inviteEmailHtml } from "./email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export interface InviteRequestBody {
  email: string;
  role: InviteRole;
  inviterName: string;
  workspaceId: string;
  workspaceName: string;
}

export interface InviteResponse {
  success: boolean;
  message: string;
  emailSent?: boolean;
  inviteUrl?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest): Promise<NextResponse<InviteResponse>> {
  // ── Parse body ──────────────────────────────────────────────────
  let body: Partial<InviteRequestBody>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, message: "Invalid request body." }, { status: 400 });
  }

  const { email, role, inviterName, workspaceId, workspaceName } = body;

  // ── Validate ────────────────────────────────────────────────────
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ success: false, message: "A valid email address is required." }, { status: 400 });
  }
  if (!role || !["admin", "member", "viewer"].includes(role)) {
    return NextResponse.json({ success: false, message: "Role must be admin, member, or viewer." }, { status: 400 });
  }
  if (!inviterName || !workspaceId || !workspaceName) {
    return NextResponse.json({ success: false, message: "Missing required invite parameters." }, { status: 400 });
  }

  // ── Check env vars ──────────────────────────────────────────────
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { success: false, message: "Email delivery is not configured. Set RESEND_API_KEY in .env.local." },
      { status: 503 },
    );
  }

  // ── Generate JWT invite token ────────────────────────────────────
  const token = await signInviteToken({ email, role, inviterName, workspaceId, workspaceName });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/invite?token=${token}`;

  // ── Send email ───────────────────────────────────────────────────
  const fromAddress = process.env.RESEND_FROM ?? "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from: fromAddress,
    to: email,
    subject: `${inviterName} invited you to join ${workspaceName} on Keel`,
    html: inviteEmailHtml({ email, role, inviterName, workspaceName, inviteUrl }),
  });

  if (error) {
    console.error("[invite] Resend error:", error);
    // Domain restriction: Resend free tier only allows sending to the account owner's
    // email. Return the invite URL so the admin can share it manually.
    const isDomainRestriction =
      error.message?.toLowerCase().includes("can only send") ||
      error.message?.toLowerCase().includes("verify a domain");
    if (isDomainRestriction) {
      return NextResponse.json({
        success: true,
        emailSent: false,
        inviteUrl,
        message: "Email delivery requires a verified Resend domain. Share this invite link manually.",
      });
    }
    return NextResponse.json(
      { success: false, message: `Failed to send invitation email: ${error.message}` },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, emailSent: true, message: "Invitation sent successfully." });
}
