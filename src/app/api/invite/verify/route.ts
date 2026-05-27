/**
 * GET /api/invite/verify?token=<jwt>
 *
 * Server-side JWT verification — keeps the signing secret off the client.
 * Returns the decoded invite payload or a structured error.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyInviteToken, type InviteTokenPayload } from "@/lib/invite";

export interface VerifySuccessResponse {
  valid: true;
  payload: InviteTokenPayload;
}
export interface VerifyErrorResponse {
  valid: false;
  reason: "expired" | "invalid" | "missing";
}
export type VerifyResponse = VerifySuccessResponse | VerifyErrorResponse;

export async function GET(req: NextRequest): Promise<NextResponse<VerifyResponse>> {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ valid: false, reason: "missing" }, { status: 400 });
  }

  try {
    const payload = await verifyInviteToken(token);
    return NextResponse.json({ valid: true, payload });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    const reason = message.includes("exp") || message.includes("expir") ? "expired" : "invalid";
    return NextResponse.json({ valid: false, reason }, { status: 401 });
  }
}
