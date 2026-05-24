import {
  MarketingShell,
  PageHero,
  Section,
  SubSection,
  Prose,
  Callout,
} from "@/components/landing/MarketingShell";

export const metadata = {
  title: "Docs — Keel",
  description: "Get up and running with Keel in minutes.",
};

const SHORTCUTS = [
  { keys: ["N"],         action: "New request"           },
  { keys: ["⌘", "K"],   action: "Open command palette"  },
  { keys: ["E"],         action: "Edit selected request" },
  { keys: ["T"],         action: "Change status (triage)"},
  { keys: ["⌘", "Z"],   action: "Undo last action"      },
  { keys: ["⌘", "⇧", "Z"], action: "Redo"              },
  { keys: ["?"],         action: "Show keyboard shortcuts"},
  { keys: ["Esc"],       action: "Close panel or modal"  },
];

export default function DocsPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Documentation"
        title="Get started with Keel"
        subtitle="Everything you need to know to go from zero to a shipped quarterly roadmap."
      />

      <Callout>
        Keel is designed to be self-explanatory. If something isn't, that's a bug in the product — not a gap in the docs. <a href="mailto:hello@keel.so">Let us know</a>.
      </Callout>

      {/* Quick start */}
      <Section title="Quick start">
        <SubSection title="1. Set up your workspace">
          <p>
            Your workspace is pre-configured with a demo dataset. Head to <strong>Settings → Workspace</strong> to update the name, slug, and accent colour. The slug is used in shared roadmap links.
          </p>
          <p>
            Add your team members in <strong>Settings → Members</strong>. Enter their email and choose a role — Admin, Member, or Viewer. They'll receive an invite link to join.
          </p>
        </SubSection>

        <SubSection title="2. Collect requests in the Inbox">
          <p>
            The Inbox is the entry point for everything. Click <strong>New request</strong> (or press <kbd className="text-[#d0d0e0] bg-white/8 px-1.5 py-0.5 rounded text-xs font-mono">N</kbd>) to log a feature request, customer ask, or internal idea.
          </p>
          <p>
            Each request has a title, description, source (customer / internal / market / support), priority, tags, and effort estimate. Fill in what you know — you can always come back.
          </p>
          <p>
            Use <strong>bulk triage</strong> to change the status, tag, or assignee on multiple requests at once. Select rows with the checkbox, then use the action bar that appears at the bottom.
          </p>
        </SubSection>

        <SubSection title="3. Score your initiatives">
          <p>
            Head to <strong>Scoring</strong> to rank the requests that matter. Choose a framework from the tab bar — <strong>RICE</strong> is the default.
          </p>
          <p>
            RICE stands for Reach × Impact × Confidence ÷ Effort. Fill in each dimension and Keel computes a score in real time. Higher is better.
          </p>
          <p>
            Switch to <strong>MoSCoW</strong> to assign each initiative a priority bucket: Must have, Should have, Could have, or Won't have this quarter. Or use <strong>WSJF</strong> (Weighted Shortest Job First) if your team follows SAFe.
          </p>
          <p>
            If the score doesn't match your gut, you can override it with a written justification. The override is logged and visible to the whole team.
          </p>
        </SubSection>

        <SubSection title="4. Build your quarterly plan">
          <p>
            Open <strong>Roadmap</strong> and switch to the current quarter. Drag scored initiatives into the plan. The capacity bar tracks total effort — red means you're overcommitted.
          </p>
          <p>
            Set a <strong>goal</strong> for the quarter, then tag each initiative with the goal it supports. The goal column makes it easy to see if your plan is coherent.
          </p>
          <p>
            When the plan is final, click <strong>Lock plan</strong>. This takes a snapshot and prevents accidental edits. You can unlock at any time — the history is preserved.
          </p>
        </SubSection>

        <SubSection title="5. Share your roadmap">
          <p>
            Open <strong>Settings → Share</strong> on the roadmap view. Click <strong>Generate link</strong> to create a permanent read-only URL. Anyone with the link can view your roadmap without signing in.
          </p>
          <p>
            Use the toggles to show or hide effort estimates, scores, and internal status. Revoke the link at any time — the old URL will immediately stop working.
          </p>
        </SubSection>
      </Section>

      {/* Core concepts */}
      <Section title="Core concepts">
        <SubSection title="Teams">
          <p>
            Keel is organised around <strong>teams</strong>. Each team has its own inbox, scoring board, and roadmap. Members can belong to multiple teams. Use the team selector in the sidebar to switch context.
          </p>
          <p>
            Teams share the same workspace, so you can see across teams from the <strong>Views</strong> page. Filters let you slice by team, status, tag, or assignee.
          </p>
        </SubSection>

        <SubSection title="Request status">
          <p>Requests move through four statuses:</p>
          <ul className="mt-2 space-y-1.5 text-[#8888a0]">
            {[
              { s: "New",      d: "Just landed in the inbox — not yet reviewed." },
              { s: "Triaged",  d: "Reviewed and categorised. Ready to be scored." },
              { s: "Active",   d: "Selected for the current planning cycle." },
              { s: "Archived", d: "Won't be built, or already shipped." },
            ].map(({ s, d }) => (
              <li key={s} className="flex gap-2 text-sm">
                <span className="font-medium text-[#d0d0e0] w-16 flex-shrink-0">{s}</span>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </SubSection>

        <SubSection title="Tags">
          <p>
            Tags are workspace-scoped labels you assign to requests. They're useful for grouping by product area, theme, or engineering domain. Create and colour-code your tags in <strong>Settings → Workspace → Tags</strong>.
          </p>
        </SubSection>

        <SubSection title="Scoring frameworks">
          <p>
            All three frameworks (RICE, MoSCoW, WSJF) operate on the same set of requests — switching frameworks is non-destructive. Your RICE scores aren't deleted when you switch to MoSCoW; they're just not displayed.
          </p>
          <p>
            The <strong>ⓘ info icon</strong> next to each framework tab explains the formula in detail. Hover over any score field to see its definition.
          </p>
        </SubSection>
      </Section>

      {/* Keyboard shortcuts */}
      <Section title="Keyboard shortcuts">
        <div className="rounded-lg border border-white/6 bg-[#17171a] overflow-hidden">
          {SHORTCUTS.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3 border-b border-white/5 last:border-0"
            >
              <span className="text-sm text-[#8888a0]">{s.action}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded bg-white/8 border border-white/10 text-[11px] font-mono text-[#d0d0e0]"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section title="Frequently asked questions">
        {[
          {
            q: "Is there a data limit on requests?",
            a: "No hard limit. Keel stores all data in your browser's local storage during the beta. Cloud sync and per-seat storage are coming in v2.",
          },
          {
            q: "Can I import from Jira, Linear, or Notion?",
            a: "Import support is on the roadmap for v2. For now, you can paste request titles and descriptions directly into the new request form.",
          },
          {
            q: "Who can see shared roadmap links?",
            a: "Anyone with the link. There's no authentication on share links by design — stakeholders shouldn't have to create accounts to view a roadmap. Revoke the link if you need to restrict access.",
          },
          {
            q: "Can I use Keel across multiple teams?",
            a: "Yes. Create as many teams as you need within one workspace. Each team has isolated inbox, scoring, and roadmap views. Members can belong to multiple teams.",
          },
          {
            q: "How do I reset the demo data?",
            a: "Clear your browser's local storage for the Keel domain, or use the Reset option in Settings → Workspace (coming in v1.3).",
          },
        ].map(({ q, a }) => (
          <div key={q} className="mb-6 border-b border-white/5 pb-6 last:border-0 last:pb-0">
            <h4 className="text-sm font-semibold text-[#d0d0e0] mb-2">{q}</h4>
            <p className="text-sm text-[#8888a0] leading-relaxed">{a}</p>
          </div>
        ))}
      </Section>
    </MarketingShell>
  );
}
