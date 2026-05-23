import type { FeatureRequest } from "@/types";

// ─────────────────────────────────────────────
// Date / display formatting utilities
// ─────────────────────────────────────────────

export function formatRelativeDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return "just now";
  if (diffHours < 1) return `${diffMinutes}m`;
  if (diffDays < 1) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatFullDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Precompute a stable KEL-NNN display ID map from all requests.
// Sort by submittedAt ascending so IDs are assigned chronologically.
export function buildDisplayIdMap(
  requests: FeatureRequest[],
): Record<string, string> {
  const sorted = [...requests].sort(
    (a, b) =>
      new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
  );
  return Object.fromEntries(
    sorted.map((r, i) => [r.id, `KEL-${String(i + 1).padStart(3, "0")}`]),
  );
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

// Deterministic avatar color from name string
const AVATAR_PALETTE = [
  "#5e5ce6", "#30a46c", "#f5a623", "#e5484d",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6",
];

export function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}
