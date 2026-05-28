import {
  MarketingShell,
  PageHero,
  Callout,
} from "@/components/landing/MarketingShell";
import { CheckCircle2, Circle } from "lucide-react";

export const metadata = {
  title: "Changelog — Keel",
  description: "What's new in Keel — every release, every fix.",
};

type ChangeType = "new" | "improved" | "fixed" | "removed";

interface ChangeEntry {
  type: ChangeType;
  text: string;
}

interface Release {
  version: string;
  date: string;
  tag?: "latest" | "beta";
  summary: string;
  changes: ChangeEntry[];
}

const RELEASES: Release[] = [
  {
    version: "1.2.0",
    date: "27 May 2026",
    tag: "latest",
    summary: "Workspace improvements with better theme controls and navigation fixes.",
    changes: [
      { type: "improved", text: "Appearance section wired to real theme hook — changes apply instantly" },
      { type: "fixed",    text: "Sidebar Settings link now highlights correctly when active" },
    ],
  },
  {
    version: "1.1.0",
    date: "24 May 2026",
    summary: "Deep links, shareable URLs, and the product tour.",
    changes: [
      { type: "new",      text: "Every view is URL-addressable: ?team=slug and ?tab=name params" },
      { type: "new",      text: "Full Settings page with Profile, Workspace, Members, and Appearance sections" },
      { type: "new",      text: "Product tour — 7-step guided walkthrough triggered from sidebar or landing CTA" },
      { type: "new",      text: "Landing page at / with hero, features, and how-it-works sections" },
      { type: "new",      text: "Smooth scroll navigation from landing nav links" },
      { type: "new",      text: "Feature cards animate in with staggered fade on scroll" },
      { type: "improved", text: "Workspace header now links back to landing page" },
      { type: "removed",  text: "Invite People from sidebar (moved into Settings → Members)" },
    ],
  },
  {
    version: "1.0.1",
    date: "23 May 2026",
    summary: "Stability fixes following the 1.0 launch.",
    changes: [
      { type: "fixed",    text: "Scoring undo/redo history preserved across team switches" },
      { type: "fixed",    text: "Roadmap capacity bar overflow on narrow viewports" },
      { type: "fixed",    text: "Share link token not invalidated correctly on revoke" },
      { type: "fixed",    text: "Theme flash on first load before localStorage is read" },
      { type: "improved", text: "Color picker outside-click now dismisses reliably" },
    ],
  },
  {
    version: "1.0.0",
    date: "21 May 2026",
    summary: "Initial public release of Keel.",
    changes: [
      { type: "new", text: "Unified feature request inbox with multi-team isolation" },
      { type: "new", text: "RICE, MoSCoW, and WSJF scoring frameworks" },
      { type: "new", text: "Quarterly planning board with capacity tracking" },
      { type: "new", text: "Token-based read-only share links for stakeholders" },
      { type: "new", text: "Dark and light themes with system preference detection" },
      { type: "new", text: "Full undo/redo history on inbox and roadmap" },
      { type: "new", text: "Filter tabs: Active, New, Triaged, Archived" },
    ],
  },
  {
    version: "0.9.0",
    date: "20 May 2026",
    tag: "beta",
    summary: "Private beta. Core inbox and scoring flows stabilised.",
    changes: [
      { type: "new",      text: "Request inbox with status, tags, priority, and effort fields" },
      { type: "new",      text: "RICE scoring with live formula preview" },
      { type: "new",      text: "Drag-to-rank initiatives on the roadmap board" },
      { type: "improved", text: "Tag autocomplete in request form" },
      { type: "fixed",    text: "Comment timestamps displayed in local timezone" },
    ],
  },
];

const TYPE_STYLES: Record<ChangeType, { label: string; color: string }> = {
  new:      { label: "New",      color: "#30a46c" },
  improved: { label: "Improved", color: "#5e5ce6" },
  fixed:    { label: "Fixed",    color: "#f5a623" },
  removed:  { label: "Removed",  color: "#e5484d" },
};

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Changelog"
        title="What's new in Keel"
        subtitle="Every release, shipped in production order. Oldest at the bottom."
      />

      <Callout>
        Notifications for new releases are coming in v2. Until then, bookmark this page or check back after major announcements.
      </Callout>

      <div className="mt-10 space-y-14">
        {RELEASES.map((release) => (
          <div key={release.version} className="relative pl-6 border-l border-white/8">
            {/* Version dot */}
            <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-[#5e5ce6] border-2 border-[#0d0d10]" />

            <div className="flex items-center gap-3 mb-1">
              <span className="text-lg font-bold text-white">v{release.version}</span>
              {release.tag === "latest" && (
                <span className="text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-[#5e5ce6]/20 text-[#a8a8f0]">
                  Latest
                </span>
              )}
              {release.tag === "beta" && (
                <span className="text-[11px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-[#55556a]">
                  Beta
                </span>
              )}
            </div>
            <p className="text-xs text-[#55556a] mb-3">{release.date}</p>
            <p className="text-sm text-[#8888a0] mb-5 leading-relaxed">{release.summary}</p>

            <ul className="space-y-2.5">
              {release.changes.map((c, i) => {
                const s = TYPE_STYLES[c.type];
                return (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span
                      className="mt-0.5 flex-shrink-0 text-[11px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${s.color}18`, color: s.color }}
                    >
                      {s.label}
                    </span>
                    <span className="text-[#8888a0]">{c.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-16 pt-10 border-t border-white/5 text-center">
        <p className="text-xs text-[#3a3a4a]">
          Older pre-beta releases are not listed here. Have a question about a specific change?{" "}
          <a href="mailto:hello@keel.so" className="text-[#5e5ce6] hover:underline">
            Email us
          </a>
          .
        </p>
      </div>
    </MarketingShell>
  );
}
