import {
  MarketingShell,
  PageHero,
  Section,
  SubSection,
  Prose,
  Callout,
} from "@/components/landing/MarketingShell";
import {
  Inbox,
  BarChart2,
  Map,
  Share2,
  Target,
  Users,
  Zap,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Product — Keel",
  description: "Everything Keel does, and why it's built the way it is.",
};

const PILLARS = [
  {
    icon: Inbox,
    color: "#5e5ce6",
    title: "Unified Request Inbox",
    body: "Every feature request, customer ask, internal idea, and sales signal flows into one structured inbox. Triage, tag, and route in seconds — no more Notion docs or scattered Slack threads.",
    points: [
      "Multi-team isolation with shared visibility",
      "Bulk triage: status, tag, assign in one action",
      "Source tracking: customer, internal, market, support",
      "Full comment threads with @mentions",
    ],
  },
  {
    icon: BarChart2,
    color: "#30a46c",
    title: "Flexible Scoring Frameworks",
    body: "Score initiatives using RICE, MoSCoW, WSJF, or build your own weighted framework. Every score is auditable — you can always see why something ranked where it did.",
    points: [
      "RICE: Reach × Impact × Confidence ÷ Effort",
      "MoSCoW: Must, Should, Could, Won't",
      "WSJF: Weighted shortest job first",
      "Custom dimensions with adjustable weights",
      "Override with a written justification",
      "Full undo/redo history",
    ],
  },
  {
    icon: Map,
    color: "#f97316",
    title: "Quarterly Planning Board",
    body: "Lay out your quarter on a capacity-aware roadmap. Set goals, assign effort, and track status across teams. Lock the plan when you're ready and share it without exporting anything.",
    points: [
      "Capacity bar with overcommit warnings",
      "Goal alignment tracking per initiative",
      "Status column: planned, in progress, shipped, cut",
      "One-click plan locking with a snapshot",
      "Multi-team view with per-team capacity",
    ],
  },
  {
    icon: Share2,
    color: "#ec4899",
    title: "Shareable Read-Only Views",
    body: "Generate a permanent link to your roadmap that stakeholders can view without creating an account. Control which fields are visible. Revoke at any time.",
    points: [
      "Token-based share links, no login required",
      "Toggle effort, score, and status visibility",
      "Revocable instantly from the share settings",
      "Auto-updates as your plan changes",
    ],
  },
];

const USE_CASES = [
  {
    title: "Early-stage startups",
    body: "When you're three people and a Notion doc, Keel gives you just enough structure without overhead. The inbox keeps signal from being lost; scoring keeps debates short.",
  },
  {
    title: "Growing product teams",
    body: "As headcount and request volume grow, the multi-team isolation and bulk triage tools keep things from becoming noise. Different teams, one workspace, no silos.",
  },
  {
    title: "PMs at larger companies",
    body: "Quarterly planning reviews get complicated fast. Keel's capacity-aware board, locking, and stakeholder sharing turn the QBR from a slide show into a live document.",
  },
];

export default function ProductPage() {
  return (
    <MarketingShell>
      <PageHero
        eyebrow="Product"
        title="The PM workspace built for clarity"
        subtitle="Keel is a focused tool that handles the full planning cycle — from raw requests to a published roadmap — without requiring five different tools to do it."
      />

      <Section>
        <Callout>
          Keel is designed around one belief: <strong>the best planning tools do less, not more.</strong> No wiki, no ticket system, no reporting dashboard. Just the four things that matter — collect, score, plan, share.
        </Callout>
      </Section>

      <Section title="Core capabilities">
        <div className="space-y-10">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="flex gap-5">
                <div
                  className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${p.color}18` }}
                >
                  <Icon size={16} style={{ color: p.color }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{p.title}</h3>
                  <p className="text-sm text-[#8888a0] leading-relaxed mb-3">{p.body}</p>
                  <ul className="space-y-1.5">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2 text-xs text-[#55556a]">
                        <CheckCircle2 size={11} style={{ color: p.color }} className="flex-shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Who it's for">
        <div className="grid sm:grid-cols-3 gap-4">
          {USE_CASES.map((uc) => (
            <div key={uc.title} className="rounded-lg border border-white/6 bg-[#17171a] p-5">
              <h3 className="text-sm font-semibold text-white mb-2">{uc.title}</h3>
              <p className="text-xs text-[#8888a0] leading-relaxed">{uc.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Design principles">
        <SubSection title="Opinionated, not rigid">
          <p>
            Keel ships with RICE, MoSCoW, and WSJF out of the box because most teams pick one and stick to it. But every framework can be overridden, and custom dimensions let you build your own. The tool adapts to your process, not the other way around.
          </p>
        </SubSection>
        <SubSection title="No hidden state">
          <p>
            Every score, every status change, every comment is visible to everyone on the team. There's no private note, no hidden column, no admin-only view that creates information asymmetry. Planning works better when it's transparent.
          </p>
        </SubSection>
        <SubSection title="Sharing without friction">
          <p>
            Stakeholders shouldn't need to create accounts to see a roadmap. Share links are permanent, token-based, and revocable. You control what they see — effort, scores, and internal status can all be toggled off.
          </p>
        </SubSection>
      </Section>

      <Section title="What Keel is not">
        <Prose>
          <p>Keel is not a project management tool. It doesn't replace Jira, Linear, or GitHub Issues — those track in-flight engineering work. Keel lives upstream: deciding <strong>what</strong> to build and <strong>when</strong>, before work begins.</p>
          <p>It's not a wiki. Notion, Confluence, and Coda are excellent at storing knowledge. Keel stores decisions — scored, time-boxed, and tied to a quarter.</p>
          <p>It's not a BI tool. Keel doesn't connect to your analytics stack or generate charts from user data. The data that matters here is qualitative: requests, context, and the reasoning behind prioritization calls.</p>
        </Prose>
      </Section>
    </MarketingShell>
  );
}
