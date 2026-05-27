import type { InviteRole } from "@/lib/invite";

interface EmailTemplateProps {
  email: string;
  role: InviteRole;
  inviterName: string;
  workspaceName: string;
  inviteUrl: string;
}

const ROLE_COLORS: Record<InviteRole, { bg: string; text: string; label: string }> = {
  admin:  { bg: "#ededff", text: "#4340c7", label: "Admin"  },
  member: { bg: "#f0faf4", text: "#1a6b3c", label: "Member" },
  viewer: { bg: "#f5f5f8", text: "#55556a", label: "Viewer" },
};

export function inviteEmailHtml({
  role,
  inviterName,
  workspaceName,
  inviteUrl,
}: EmailTemplateProps): string {
  const roleStyle = ROLE_COLORS[role];

  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ${workspaceName} on Keel</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #e4e4ea;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#1b1b1f;padding:28px 36px;text-align:center;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;background:#5e5ce6;border-radius:8px;font-size:20px;font-weight:700;color:#ffffff;line-height:40px;">K</div>
              <p style="margin:10px 0 0;color:#8888a0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;">Keel · Product Planning</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px;">

              <!-- Title -->
              <h1 style="margin:0 0 10px;font-size:22px;font-weight:600;color:#111118;line-height:1.3;">
                You're invited to join<br/><span style="color:#5e5ce6;">${workspaceName}</span>
              </h1>
              <p style="margin:0 0 24px;color:#6b6b80;font-size:14px;line-height:1.7;">
                <strong style="color:#111118;">${inviterName}</strong> has invited you to collaborate on <strong style="color:#111118;">${workspaceName}</strong> as a workspace ${role}.
              </p>

              <!-- Role badge -->
              <div style="margin-bottom:32px;">
                <span style="display:inline-block;background:${roleStyle.bg};color:${roleStyle.text};font-size:12px;font-weight:600;padding:4px 14px;border-radius:100px;letter-spacing:0.02em;">
                  ${roleStyle.label}
                </span>
              </div>

              <!-- What you'll get -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f8;border-radius:8px;margin-bottom:32px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 10px;font-size:12px;font-weight:600;color:#55556a;text-transform:uppercase;letter-spacing:0.06em;">As a ${role} you can</p>
                    ${role === "admin" ? `
                    <p style="margin:4px 0;font-size:13px;color:#6b6b80;">✓ &nbsp;Manage workspace settings and members</p>
                    <p style="margin:4px 0;font-size:13px;color:#6b6b80;">✓ &nbsp;Create and lock quarterly plans</p>
                    <p style="margin:4px 0;font-size:13px;color:#6b6b80;">✓ &nbsp;Triage, prioritize, and close requests</p>
                    ` : role === "member" ? `
                    <p style="margin:4px 0;font-size:13px;color:#6b6b80;">✓ &nbsp;View</p>
                    ` : `
                    <p style="margin:4px 0;font-size:13px;color:#6b6b80;">✓ &nbsp;View shared roadmaps</p>
                    <p style="margin:4px 0;font-size:13px;color:#6b6b80;">✓ &nbsp;Read quarterly plans</p>
                    `}
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${inviteUrl}"
                       style="display:inline-block;background:#5e5ce6;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:13px 36px;border-radius:8px;letter-spacing:0.01em;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Fallback URL -->
              <p style="margin:0 0 4px;font-size:11px;color:#a0a0b5;text-align:center;">Or copy this link into your browser:</p>
              <p style="margin:0 0 24px;font-size:11px;color:#8888a0;text-align:center;word-break:break-all;">
                <a href="${inviteUrl}" style="color:#5e5ce6;text-decoration:none;">${inviteUrl}</a>
              </p>

              <!-- Footer note -->
              <p style="margin:0;font-size:12px;color:#a0a0b5;text-align:center;line-height:1.6;">
                This invitation expires in <strong>7 days</strong>.<br/>
                If you weren't expecting this email, you can safely ignore it.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f7f7f8;border-top:1px solid #e4e4ea;padding:16px 36px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#a0a0b5;">
                Keel · Product Planning Workspace &nbsp;·&nbsp;
                <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}" style="color:#8888a0;text-decoration:none;">keel.so</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
