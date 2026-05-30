"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { WorkflowBar } from "@/components/workflow/WorkflowBar";
import { NextPhaseBar } from "@/components/workflow/NextPhaseBar";
import { SourceBadge } from "@/components/inbox/SourceBadge";
import { Check, ArrowRightCircle, Trash2, Search, X, Minus, ThumbsUp, Folder, FolderOpen, ExternalLink, Clock, Zap, Info, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useInboxStore } from "@/store/useInboxStore";
import { useAppStore } from "@/store/useAppStore";
import { TEAMS } from "@/lib/constants";
import { getInitials, avatarColor } from "@/lib/format";
import { Tooltip } from "@/components/ui/Tooltip";
import type { RequestSource, PrioritySignal } from "@/types";

// ── Types ──────────────────────────────────────

interface InboxVote {
  name: string;
  comment: string;
}

interface InboxFeature {
  id: string;
  title: string;
  productArea: string;
  source: RequestSource;
  votes: InboxVote[];
  submittedBy: string;
  submittedAt: string;
  description: string;
  businessContext: string;
  prioritySignal: PrioritySignal;
  supportingLinks: string[];
}

// ── Age helper ─────────────────────────────────

function waitingLabel(iso: string): { label: string; urgent: boolean } {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  const label = days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`;
  return { label, urgent: days >= 30 };
}

// ── Seed data ──────────────────────────────────

const INITIAL_FEATURES: InboxFeature[] = [
  {
    id: "f1", title: "Bulk CSV export for transaction reports", productArea: "Reporting", source: "customer",
    submittedBy: "Priya Nair, CFO @ Finstack", submittedAt: "2026-05-25",
    description: "Finance teams need to export large transaction datasets as CSV for reconciliation, auditing, and custom reporting in Excel or BI tools. Currently limited to 500 rows per export.",
    businessContext: "Blocking enterprise renewals worth ₹2.4Cr ARR. Four CFOs flagged this in QBRs this quarter.",
    prioritySignal: "critical",
    supportingLinks: ["https://finstack.notion.so/csv-export-req", "https://support.example.com/tickets/4821"],
    votes: [
      { name: "Priya Nair, CFO @ Finstack",        comment: "We're manually extracting data row-by-row for month-end close — blocking our audit prep and taking 8 hours every cycle." },
      { name: "Ravi Kumar, Finance Lead @ ClearPay", comment: "Our reconciliation team hits the 500-row cap daily. We've resorted to splitting exports and stitching them back in Excel." },
      { name: "Deepa Menon, VP Finance @ RetailX",  comment: "Four of my enterprise clients flagged this in QBRs. One is already evaluating a competitor specifically over this gap." },
      { name: "Vikram Das, Enterprise Sales",        comment: "Lost two renewal conversations because the export limit came up. It's table stakes for any finance team." },
      { name: "Arun B., Controller @ FinopsHub",     comment: "500 rows doesn't cover a single day of transactions for us. We need full-history bulk export to meet compliance obligations." },
    ],
  },
  {
    id: "f2", title: "Webhook retry with exponential backoff", productArea: "API", source: "engineering",
    submittedBy: "Shankar P., Backend Lead", submittedAt: "2026-05-19",
    description: "When a merchant endpoint is temporarily unavailable, webhook events are dropped after a single retry. We need configurable retry schedules with exponential backoff to improve reliability.",
    businessContext: "Three enterprise merchants reported missed payment events last quarter. Reliability SLAs are at risk.",
    prioritySignal: "important",
    supportingLinks: ["https://github.com/example/issues/1024"],
    votes: [
      { name: "Shankar P., Backend Lead",             comment: "We lost ₹40k in payment events last month due to single-retry failures. Ops manually replayed 200+ events after the fact." },
      { name: "Arun Dev, Platform Architect @ TechMerch", comment: "A flapping endpoint caused a 2-hour outage during a peak sale. Backoff would have degraded gracefully instead of hard-failing." },
      { name: "Deepika Nair, CTO @ D2C Brand",        comment: "Every dropped webhook is a missed order confirmation. Reliability is non-negotiable once you're above 10k orders/day." },
      { name: "Sai Rajan, Engineering Lead @ PayBridge", comment: "We've built our own retry logic on top of the API as a workaround. This should be a platform primitive, not a per-customer hack." },
    ],
  },
  {
    id: "f3", title: "One-click payment link sharing via WhatsApp", productArea: "Payments", source: "customer",
    submittedBy: "Rohan Mehta, Sales Lead", submittedAt: "2026-05-12",
    description: "Merchants selling via WhatsApp Business need to share payment links directly inside the chat without copy-pasting. A native share button would streamline collection for D2C brands.",
    businessContext: "High-demand segment — 60% of our SMB merchants use WhatsApp as primary sales channel.",
    prioritySignal: "important",
    supportingLinks: [],
    votes: [
      { name: "Rohan Mehta, Sales Lead",             comment: "SMB sellers are losing orders mid-conversation because the multi-step share process breaks the chat flow entirely." },
      { name: "Meena T., Owner @ GiftsByMeena",      comment: "I close 80% of my orders on WhatsApp. Copy-pasting links kills momentum right when the customer is ready to pay." },
      { name: "Shyam Sundar, Head of SMB Growth",    comment: "WhatsApp commerce is our fastest-growing segment. This is a must-have to stay competitive with Razorpay and Cashfree." },
      { name: "Lata Patel, Reseller @ HandmadeByLata", comment: "Customers ask for the link mid-chat. By the time I find and paste it, half have already dropped off." },
      { name: "Prashant V., Regional Sales @ SMB Desk", comment: "Every SMB merchant I onboard asks about this within the first week. It's the single biggest friction point in the segment." },
    ],
  },
  {
    id: "f4", title: "File Application Console Enhancement", productArea: "Developer Tools", source: "engineering",
    submittedBy: "Karan Desai, Platform Engineering Lead", submittedAt: "2026-05-05",
    description: "The file application console lacks essential developer tooling — no real-time log streaming, no structured error output, and no support for bulk file operations. Engineers are context-switching to external tools for tasks that should be native to the console.",
    businessContext: "Slowing down 3 active integrations and generating 15+ support escalations a month. Internal teams have flagged this as the top developer-experience gap for Q2.",
    prioritySignal: "critical",
    supportingLinks: ["https://github.com/example/issues/2047", "https://internal.wiki/file-console-gaps"],
    votes: [
      { name: "Karan Desai, Platform Engineering Lead", comment: "We spend 40 minutes per deployment switching between the console and external log tools. Real-time streaming alone would save hours a week." },
      { name: "Sneha Iyer, Senior Developer @ FileOps", comment: "Structured error output is non-negotiable for debugging. Right now errors are buried in unformatted blobs — it's a productivity killer." },
      { name: "Arjun Pillai, DevOps Engineer",          comment: "Bulk file operations are manual and error-prone. One misfire last quarter corrupted a staging environment and cost us a full day." },
      { name: "Meera Nandan, Integration Engineer",     comment: "Every new integration onboarding involves a workaround for the console's limitations. This is the first thing engineers complain about." },
      { name: "Rahul Srinivasan, VP Engineering",       comment: "This is blocking two enterprise integrations we committed to for Q2. It needs to be fixed before we can unblock those teams." },
    ],
  },
  {
    id: "f5", title: "Smart dispute auto-categorisation", productArea: "Disputes", source: "internal",
    submittedBy: "Ananya S., Head of Support", submittedAt: "2026-04-28",
    description: "Support agents manually tag every dispute by type (fraud, product, service). An ML-based tagger trained on historical resolutions could auto-classify disputes and route them to the right queue.",
    businessContext: "Support handles 400+ disputes/month. Auto-categorisation could cut resolution time by 35% and reduce agent cost.",
    prioritySignal: "nice_to_have",
    supportingLinks: [],
    votes: [
      { name: "Ananya S., Head of Support",         comment: "Manual tagging is error-prone — wrong categories delay resolutions by 2–3 days and spike our SLA breach rate." },
      { name: "Karan Malhotra, Customer Success Lead", comment: "Auto-categorisation would let us route disputes instantly instead of having an agent triage every single one before routing." },
      { name: "Nidhi Jain, Operations Manager",     comment: "We handle 400+ disputes a month. Even a 30% auto-classification rate would free up meaningful agent capacity." },
    ],
  },
  {
    id: "f6", title: "Saved card management for returning customers", productArea: "Payments", source: "customer",
    submittedBy: "Multiple — 34 support tickets", submittedAt: "2026-04-14",
    description: "Returning customers want to manage their saved cards — view, delete, or set a default — without re-entering details each transaction. Currently there's no self-serve card vault UI.",
    businessContext: "Top requested feature in NPS surveys for 3 consecutive quarters. Directly impacts checkout conversion rate.",
    prioritySignal: "critical",
    supportingLinks: ["https://nps-dashboard.example.com/q1-themes"],
    votes: [
      { name: "Ritika Sharma, Enterprise Customer",   comment: "I've entered my card details 12 times this month. A vault would save 30 seconds per checkout — and I'd actually complete more purchases." },
      { name: "Pavan Kumar, VP Product @ FastCart",   comment: "Cart abandonment at the payment step is 34% above industry average. We attribute this directly to the lack of saved cards." },
      { name: "Sonal Mehta, NPS Respondent",          comment: "This is the single feature I'd pay a premium for. Every checkout feels like the first time, which erodes trust in the platform." },
      { name: "Arjun Reddy, Head of Checkout @ BigBazaarOnline", comment: "Our A/B prototype with saved cards showed a 22% lift in completed transactions. The data is unambiguous." },
      { name: "Isha Nair, Customer Experience Lead",  comment: "43% of our repeat-customer complaints this quarter were about re-entering payment details. Top NPS driver by far." },
      { name: "Dev Mehta, VP Engineering @ ShopLocal", comment: "We've jury-rigged browser autofill as a workaround, but it's fragile and breaks on mobile. Native card vault is the right fix." },
    ],
  },
  {
    id: "f7", title: "Refund SLA tracker with merchant-facing status page", productArea: "Disputes", source: "internal",
    submittedBy: "Customer Success Team", submittedAt: "2026-04-01",
    description: "Merchants have no visibility into refund processing timelines. A status page showing refund stages (initiated → bank processing → credited) would reduce support volume around refund queries.",
    businessContext: "Refund-related tickets account for 28% of CS volume. A status page alone could deflect ~300 tickets/month.",
    prioritySignal: "important",
    supportingLinks: [],
    votes: [
      { name: "Customer Success Team",               comment: "We field 300+ 'where's my refund' tickets monthly. A self-serve status page would deflect nearly all of them instantly." },
      { name: "Madhuri P., Merchant @ HomeBrew",     comment: "Had to email every customer individually during a bank outage. A live refund tracker would have handled that automatically." },
      { name: "Arjun Kapoor, CS Agent",              comment: "25% of my shift is answering refund status questions. A status page would free me to work on higher-value issues." },
      { name: "Preethi R., Operations Lead @ PayReceive", comment: "Merchants need transparency into refund timelines to manage their own customers. Right now they're completely in the dark." },
    ],
  },
  {
    id: "f8", title: "API rate limit visibility in dashboard", productArea: "API", source: "engineering",
    submittedBy: "Developer community forum", submittedAt: "2026-03-20",
    description: "Developers hitting rate limits get opaque 429 errors with no visibility into current usage vs limits. The dashboard should show live API consumption, remaining quota, and reset windows.",
    businessContext: "Frequent complaint in developer community forum and onboarding calls. Affects developer experience score.",
    prioritySignal: "important",
    supportingLinks: ["https://community.example.com/rate-limit-thread"],
    votes: [
      { name: "Suhail Ahmed, Developer @ Integrations.io", comment: "Hit a 429 with zero warning and no dashboard indicator. Spent 45 minutes diagnosing an outage that was just a rate limit." },
      { name: "Devraj N., Lead Engineer @ StartupPay",     comment: "Our monitoring is blind to rate limit headroom. We discover throttling after the fact, never before it causes an incident." },
      { name: "Ankit Shah, Platform Engineer @ APIConnect", comment: "Live consumption with reset windows is table stakes for any API-first product. This is basic developer tooling." },
      { name: "Pooja Jain, Developer Community Moderator", comment: "Rate limit confusion is the most-asked topic in our forum. Visibility alone would cut 40% of support escalations." },
    ],
  },
  {
    id: "f9", title: "Scheduled payouts for marketplace sellers", productArea: "Payouts", source: "customer",
    submittedBy: "Vikram Das, Enterprise Sales", submittedAt: "2026-03-05",
    description: "Marketplace operators need to schedule payouts to sellers on weekly or monthly cycles rather than triggering them manually. This includes configurable payout dates, hold periods, and auto-split rules.",
    businessContext: "Blocking a ₹1.8Cr ACV marketplace deal. Competitor already offers scheduled payouts.",
    prioritySignal: "critical",
    supportingLinks: ["https://docs.example.com/payouts/scheduling"],
    votes: [
      { name: "Vikram Das, Enterprise Sales",         comment: "A ₹1.8Cr ACV deal is blocked entirely on this. The competitor they're evaluating already ships weekly scheduled payouts." },
      { name: "Sai Gopal, CTO @ MarketNow",           comment: "Our sellers expect payouts every Friday. Manual triggering has failed twice this quarter, directly causing seller churn." },
      { name: "Neha Gupta, Finance Lead @ HubSell",   comment: "200+ sellers, manual payout runs each cycle — takes a full workday. Automation would reclaim that time entirely." },
      { name: "Rahul Kapoor, Head of Marketplace @ BazaarPro", comment: "Scheduled payouts are how we build seller trust. Right now we're managing expectations over Slack instead of shipping a feature." },
      { name: "Aisha Mehta, Seller @ CraftCircle",    comment: "I plan inventory purchases around payout dates. When a manual run gets delayed, my whole supply chain is affected." },
    ],
  },
  {
    id: "f10", title: "Dark mode for merchant dashboard", productArea: "Dashboard", source: "customer",
    submittedBy: "NPS Responses Q1 — 47 mentions", submittedAt: "2026-02-18",
    description: "Many merchants operate late-night shifts in warehouses and prefer dark UI to reduce eye strain. A system-preference-aware dark mode would improve usability and NPS among high-volume merchants.",
    businessContext: "47 unprompted NPS mentions in Q1. Low engineering effort relative to sentiment impact.",
    prioritySignal: "nice_to_have",
    supportingLinks: [],
    votes: [
      { name: "Kavya Reddy, Warehouse Supervisor @ NightOps", comment: "My team runs 10pm–6am shifts. The bright white dashboard is the first complaint every single night — eye strain is real." },
      { name: "Amit Joshi, NPS Respondent",           comment: "Dark mode is table stakes for any modern B2B tool. This would genuinely make me enjoy using the product more." },
      { name: "Sriram V., Operations Manager @ 24x7Logistics", comment: "Night-shift staff use mobile with dark mode enabled just to avoid the bright UI. Please build this natively." },
      { name: "Deepa Kumar, Merchant @ LateNightMart", comment: "47 of us mentioned this unprompted in the Q1 NPS survey. It's a recurring pain point, not a niche request." },
      { name: "Rajan P., Finance Controller @ NightOwlPharma", comment: "I do month-end close at midnight. A dark interface would reduce fatigue and help me work more accurately during late sessions." },
    ],
  },
  {
    id: "f11", title: "Inbox DLQ Capability", productArea: "Platform", source: "engineering",
    submittedBy: "Platform Engineering Team", submittedAt: "2026-05-27",
    description: "Add Dead Letter Queue support, RSDs (Retry Strategy Definitions), and Inbox Operator tooling to Hub Inbox. Enables developers to handle failed inbox messages without manual platform team intervention.",
    businessContext: "All failed inbox messages currently require platform team intervention to investigate and replay. This is a growing support bottleneck — averaging 20+ escalations a week — and slows incident resolution across Hub tenants.",
    prioritySignal: "critical",
    supportingLinks: ["https://github.com/example/issues/3102", "https://internal.wiki/hub-inbox-dlq-rfc"],
    votes: [
      { name: "Suresh Nair, Staff Engineer @ Hub Platform",  comment: "We're manually replaying failed messages multiple times a week. DLQ support would let app teams own their own failure handling without paging us." },
      { name: "Divya Krishnan, Engineering Manager",         comment: "The lack of RSDs means every retry strategy is bespoke per application. Standardising this would cut incident triage time by at least half." },
      { name: "Aditya Rao, Backend Developer @ TenantOps",  comment: "Every time a message fails we raise a ticket and wait. With Inbox Operator tooling we could self-serve investigations and replays immediately." },
      { name: "Priya Venkat, SRE Lead",                     comment: "Hub Inbox failures are in our top-5 on-call triggers. DLQ visibility would let us detect and resolve issues before they escalate to production incidents." },
    ],
  },
  {
    id: "f12", title: "Credentials Management", productArea: "Security", source: "engineering",
    submittedBy: "Dia Platform Team", submittedAt: "2026-05-24",
    description: "Secure handling of secrets and credentials for Hub applications via Dia. Provides a managed credential store that applications can reference without embedding secrets in manifests or source code.",
    businessContext: "Secrets embedded in manifests are a security liability flagged in the last internal audit. Several Hub applications are currently non-compliant with the organisation's secret management policy, creating audit and breach risk.",
    prioritySignal: "critical",
    supportingLinks: ["https://internal.wiki/dia-credentials-spec", "https://github.com/example/issues/2891"],
    votes: [
      { name: "Rohan Joshi, Security Architect",            comment: "Hardcoded secrets in manifests are the number-one finding in our quarterly security reviews. This needs to be solved at the platform level, not per-app." },
      { name: "Ananya Rao, Compliance Lead",                comment: "We're carrying audit risk on every Hub application that still embeds credentials. A managed credential store would close the gap across the board." },
      { name: "Kiran Mehta, Senior Developer @ AppHub",    comment: "Rotating secrets manually across manifests is error-prone and has caused two outages. A centralised store with automatic rotation would remove that risk entirely." },
      { name: "Siddharth V., DevOps Engineer",             comment: "Without managed credentials, every CI pipeline has its own bespoke secret injection. Dia-native support would standardise and secure the entire deploy chain." },
      { name: "Nisha Patel, VP Engineering",               comment: "This is a pre-requisite for two enterprise customer certifications we're targeting in Q3. We can't proceed without it." },
    ],
  },
  {
    id: "f13", title: "Customer Onboarding Enablement", productArea: "Customer Success", source: "internal",
    submittedBy: "Preethi Sharma, Head of Customer Success", submittedAt: "2026-05-20",
    description: "Dedicated bandwidth to help customers onboard onto Hub applications. Root cause of onboarding friction is poor developer experience — this initiative bridges the gap with guided onboarding, enablement support, and activation tracking.",
    businessContext: "Time-to-first-value for new Hub customers is averaging 6 weeks, double the 3-week target. Onboarding drop-off is the top contributor to early-stage churn and delayed revenue recognition.",
    prioritySignal: "important",
    supportingLinks: ["https://internal.wiki/onboarding-metrics-q1", "https://internal.notion.so/hub-activation-report"],
    votes: [
      { name: "Preethi Sharma, Head of Customer Success",  comment: "We're losing customers in the first 30 days not because the product is bad, but because the onboarding path is unclear. Guided enablement would change that." },
      { name: "Lakshmi R., Customer Success Manager",      comment: "I spend 60% of my time filling gaps in the onboarding experience manually. Structured activation tracking would let me focus on relationship-building instead." },
      { name: "Arvind Kumar, New Customer @ FinBridge",    comment: "We went 4 weeks without a working Hub integration because we couldn't figure out the correct setup sequence. A guided flow would have cut that to days." },
      { name: "Tanvi Mehta, Solutions Engineer",           comment: "Activation data is scattered across spreadsheets and Slack threads. A proper tracking layer would give us early signals on at-risk accounts before they churn." },
    ],
  },
  {
    id: "f14", title: "PCI Data Management", productArea: "Compliance", source: "internal",
    submittedBy: "Compliance & Security Team", submittedAt: "2026-05-22",
    description: "Establish a framework for managing PCI-scoped data within Hub applications, including data classification, access controls, audit logging, and tokenisation support for cardholder data environments.",
    businessContext: "PCI DSS v4.0 compliance deadline is approaching and formal data management controls are required. Three enterprise customers are blocked from production go-live pending PCI certification of the Hub platform.",
    prioritySignal: "critical",
    supportingLinks: ["https://internal.wiki/pci-dss-v4-readiness", "https://internal.notion.so/hub-pci-gap-analysis"],
    votes: [
      { name: "Vikram Pillai, Chief Compliance Officer",   comment: "PCI DSS v4.0 requires controls we don't have today. Without this we cannot certify Hub for cardholder data environments — full stop." },
      { name: "Ananya Rao, Compliance Lead",               comment: "The gap analysis shows 7 open controls. Data classification and access controls are the two highest-risk items we need to close first." },
      { name: "Rajesh Kumar, Enterprise Account @ PaySecure", comment: "Our legal team has put our Hub go-live on hold until PCI certification is confirmed. This is blocking ₹3Cr in contracted ARR." },
      { name: "Sonal Iyer, Security Engineer",             comment: "Without tokenisation support, every team touching cardholder data is building their own controls. Standardising at the platform level is the only scalable fix." },
      { name: "Deepak Nair, CTO @ CardVault Inc",          comment: "We chose Hub on the premise that PCI compliance would be handled at the infrastructure layer. That expectation needs to be met before we can go live." },
    ],
  },
];




// ── Priority signal config ─────────────────────

const PRIORITY_CONFIG: Record<PrioritySignal, { label: string; color: string }> = {
  critical:     { label: "Critical",     color: "#e5484d" },
  important:    { label: "Important",    color: "#f97316" },
  nice_to_have: { label: "Nice to have", color: "#30a46c" },
};

// ── Move to team modal ────────────────────────

function MoveToTeamModal({
  feature,
  onSelect,
  onClose,
}: {
  feature:  InboxFeature;
  onSelect: (teamId: string) => void;
  onClose:  () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-150"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={cn(
        "w-[400px] rounded-xl border border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-elevated)] shadow-xl p-6 flex flex-col gap-5",
        "animate-in fade-in zoom-in-95 slide-in-from-bottom-3 duration-200",
      )}>
        <div>
          <p className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug">
            Move to team
          </p>
          <p className="mt-1 text-[12px] text-[var(--color-text-muted)] truncate">
            {feature.title}
          </p>
        </div>

        <div className="flex gap-3">
          {TEAMS.map((team) => (
            <button
              key={team.id}
              onClick={() => onSelect(team.id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-2.5 py-4 px-3 rounded-xl",
                "border border-[var(--color-border-subtle)]",
                "hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
                "transition-colors group",
              )}
            >
              <span
                className="h-10 w-10 rounded-lg flex items-center justify-center text-[17px] font-bold text-white"
                style={{ backgroundColor: team.color }}
              >
                {team.name[0]}
              </span>
              <span className="text-[13px] font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)]">
                {team.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors self-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────

export default function InboxPage() {
  const [features, setFeatures]             = useState<InboxFeature[]>(INITIAL_FEATURES);
  const [selected, setSelected]             = useState<Set<string>>(new Set());
  const [movedItems, setMovedItems]         = useState<{ title: string; teamName: string }[]>([]);
  const [hasMoved, setHasMoved]             = useState(false);
  const [lastMovedTeamSlug, setLastMovedTeamSlug] = useState<string | null>(null);
  const [moveModalFeature, setMoveModalFeature] = useState<InboxFeature | null>(null);
  const [search, setSearch]                 = useState("");
  const [deletedToast, setDeletedToast]     = useState<string | null>(null);
  const [bulkMoveOpen, setBulkMoveOpen]     = useState(false);
  const [expandedId, setExpandedId]         = useState<string | null>(null);
  const [ageSort, setAgeSort]               = useState<"asc" | "desc" | null>(null);

  const addRequest = useInboxStore((s) => s.addRequest);
  const phasesActed   = useAppStore((s) => s.phasesActed);
  const markPhaseActed = useAppStore((s) => s.markPhaseActed);
  const hasActed = phasesActed.includes("inbox");
  const router = useRouter();

  // Auto-navigate to the team's Ideas page when inbox is cleared after moves.
  const prevFeaturesLen = useRef(INITIAL_FEATURES.length);
  useEffect(() => {
    if (prevFeaturesLen.current > 0 && features.length === 0 && hasMoved && lastMovedTeamSlug) {
      const t = setTimeout(() => router.push(`/team/${lastMovedTeamSlug}/ideas`), 1200);
      return () => clearTimeout(t);
    }
    prevFeaturesLen.current = features.length;
  }, [features.length, hasMoved, lastMovedTeamSlug, router]);

  const oldestDays = features.length
    ? Math.max(...features.map((f) => Math.floor((Date.now() - new Date(f.submittedAt).getTime()) / 86_400_000)))
    : 0;

  const filteredFeatures = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? features.filter((f) =>
          f.title.toLowerCase().includes(q) ||
          f.source.toLowerCase().includes(q) ||
          f.submittedBy.toLowerCase().includes(q),
        )
      : [...features];
    if (ageSort) {
      result = result.sort((a, b) => {
        const ageA = Date.now() - new Date(a.submittedAt).getTime();
        const ageB = Date.now() - new Date(b.submittedAt).getTime();
        return ageSort === "desc" ? ageB - ageA : ageA - ageB;
      });
    }
    return result;
  }, [features, search, ageSort]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(filteredFeatures.map((f) => f.id)));
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleBulkDelete() {
    const count = selected.size;
    const ids = [...selected];
    setFeatures((prev) => prev.filter((f) => !ids.includes(f.id)));
    setSelected(new Set());
    setDeletedToast(`${count} feature${count !== 1 ? "s" : ""}`);
    setTimeout(() => setDeletedToast(null), 3500);
    markPhaseActed("inbox");
  }

  function handleDelete(id: string) {
    const title = features.find((f) => f.id === id)?.title ?? "Feature";
    setFeatures((prev) => prev.filter((f) => f.id !== id));
    setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
    setDeletedToast(title);
    setTimeout(() => setDeletedToast(null), 3500);
    markPhaseActed("inbox");
  }

  function moveFeatures(featureIds: string[], teamId: string) {
    const team = TEAMS.find((t) => t.id === teamId);
    if (!team) return;
    const targets = features.filter((f) => featureIds.includes(f.id));
    targets.forEach((feature) => {
      addRequest({
        id:              `inbox_${feature.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        teamId,
        title:           feature.title,
        description:     feature.description,
        businessContext: feature.businessContext,
        source:          feature.source,
        prioritySignal:  feature.prioritySignal,
        status:          "new",
        tags:            [],
        productArea:     feature.productArea,
        goalIds:         [],
        submittedBy:     feature.submittedBy,
        submittedAt:     feature.submittedAt,
        votes:           feature.votes.map((v, i) => ({
          stakeholderId:   `stakeholder_${feature.id}_${i}`,
          stakeholderName: v.name,
          comment:         v.comment,
          votedAt:         feature.submittedAt,
        })),
        comments:        [],
        supportingLinks: feature.supportingLinks,
        mergedFromIds:   [],
        externalRef:     null,
      });
    });
    const movedIds = new Set(featureIds);
    setFeatures((prev) => prev.filter((f) => !movedIds.has(f.id)));
    setSelected((prev) => { const next = new Set(prev); featureIds.forEach((id) => next.delete(id)); return next; });
    setHasMoved(true);
    setLastMovedTeamSlug(team.slug);
    setMovedItems((prev) => [
      ...prev,
      { title: `${targets.length} idea${targets.length !== 1 ? "s" : ""}`, teamName: team.name },
    ]);
    setTimeout(() => setMovedItems((prev) => prev.slice(1)), 4000);
    markPhaseActed("inbox");
  }

  function handleMoveToTeam(feature: InboxFeature, teamId: string) {
    moveFeatures([feature.id], teamId);
  }

  const lastMoved = movedItems[movedItems.length - 1] ?? null;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="Inbox" />
      <WorkflowBar currentStage="inbox" />

      {/* ── Toolbar ── */}
      <div className="px-5 h-11 border-b border-[var(--color-border-subtle)] flex-shrink-0 flex items-center gap-4">
        {/* Stats */}
        <p className="text-[12px] text-[var(--color-text-muted)] flex-shrink-0">
          <span className="text-[var(--color-text-secondary)] font-medium">{features.length} request{features.length !== 1 ? "s" : ""}</span>
          {features.length > 0 && (
            <> • Oldest: <span className="text-[var(--color-warning)] font-medium">{oldestDays} days</span></>
          )}
        </p>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-[var(--color-text-muted)] pointer-events-none" />
          <input
            type="search"
            placeholder="Search features…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); clearSelection(); }}
            className={cn(
              "h-7 w-52 rounded-md pl-7 pr-7 text-[12px]",
              "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
              "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
              "focus:outline-none focus:border-[var(--color-brand)] focus:w-64 transition-all duration-150",
            )}
            aria-label="Search features"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); clearSelection(); }}
              className="absolute right-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
              aria-label="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {features.length === 0 ? (
          <div className="flex flex-1 h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center max-w-[320px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-success)]/12">
                <Check size={20} className="text-[var(--color-success)]" strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">Inbox cleared — great work!</p>
                <p className="text-[13px] text-[var(--color-text-muted)]">All features have been moved to teams.</p>
                <p className="text-[12px] text-[var(--color-text-muted)] leading-relaxed pt-1">
                  Your next step is to score and prioritize those features so your teams know what to build first.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full pt-1">
                {TEAMS.map((team) => (
                  <a
                    key={team.id}
                    href={`/team/${team.slug}/prioritization`}
                    className={cn(
                      "flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-left w-full",
                      "border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]",
                      "hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-hover)]",
                      "transition-colors group",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: team.color }}
                      >
                        {team.name[0]}
                      </span>
                      <span className="text-[13px] font-medium text-[var(--color-text-primary)]">{team.name}</span>
                    </div>
                    <span className="text-[12px] text-[var(--color-text-muted)] group-hover:text-[var(--color-brand)] transition-colors">
                      Prioritize →
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : filteredFeatures.length === 0 ? (
          <div className="flex flex-col flex-1 h-full items-center justify-center gap-2">
            <p className="text-[13px] text-[var(--color-text-secondary)]">No results for <span className="font-medium">&ldquo;{search}&rdquo;</span></p>
            <button onClick={() => setSearch("")} className="text-[12px] text-[var(--color-brand)] hover:underline">Clear search</button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              {selected.size > 0 && (
                <tr className="border-b border-[var(--color-border-subtle)]" style={{ background: "color-mix(in srgb, var(--color-brand) 6%, var(--color-bg-elevated))" }}>
                  <th colSpan={8}>
                    <div className="flex items-center gap-3 px-4 py-2">
                      {/* Indeterminate / clear checkbox */}
                      <button
                        type="button"
                        onClick={clearSelection}
                        aria-label="Clear selection"
                        className={cn(
                          "h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          "bg-[var(--color-brand)] border-[var(--color-brand)]",
                        )}
                      >
                        <Minus size={8} className="text-white" strokeWidth={3} />
                      </button>

                      <span className="text-[12px] font-semibold text-[var(--color-brand)]">
                        {selected.size} selected
                      </span>

                      {selected.size < filteredFeatures.length && (
                        <button
                          type="button"
                          onClick={selectAll}
                          className="text-[12px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] underline underline-offset-2 transition-colors"
                        >
                          Select all {filteredFeatures.length}
                        </button>
                      )}

                      <div className="flex-1" />

                      {selected.size > 1 && (
                        <>
                          {/* Bulk delete */}
                          <button
                            type="button"
                            onClick={handleBulkDelete}
                            className={cn(
                              "inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium",
                              "text-[var(--color-danger)] border border-[var(--color-danger)]/30",
                              "hover:bg-[var(--color-danger)]/10 transition-colors",
                            )}
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>

                          {/* Bulk move */}
                          <button
                            type="button"
                            onClick={() => setBulkMoveOpen(true)}
                            className={cn(
                              "inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-[12px] font-medium",
                              "text-[var(--color-brand)] border border-[var(--color-brand)]/30",
                              "hover:bg-[var(--color-brand)]/10 transition-colors",
                            )}
                          >
                            <ArrowRightCircle size={13} />
                            Move to team
                          </button>
                        </>
                      )}

                      {/* Dismiss */}
                      <button
                        type="button"
                        onClick={clearSelection}
                        aria-label="Clear selection"
                        className="ml-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                </tr>
              )}
              <tr className="bg-[var(--color-bg-elevated)] border-b-2 border-[var(--color-border-subtle)]">
                <th className="w-10 pl-4">
                  <button
                    type="button"
                    onClick={selected.size > 0 ? clearSelection : selectAll}
                    aria-label={selected.size > 0 ? "Clear selection" : "Select all"}
                    className={cn(
                      "h-4 w-4 rounded border-2 flex items-center justify-center transition-all",
                      selected.size > 0
                        ? "bg-[var(--color-brand)] border-[var(--color-brand)] opacity-100"
                        : "border-[var(--color-border-strong)] opacity-0 hover:opacity-60",
                    )}
                  >
                    {selected.size > 0 && selected.size < filteredFeatures.length && (
                      <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
                        <path d="M1 1h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                    {selected.size > 0 && selected.size === filteredFeatures.length && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)]">
                  <span className="inline-flex items-center gap-1">
                    Feature Request
                    <Tooltip content="The title and summary of the incoming feature request" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-36">
                  <span className="inline-flex items-center gap-1">
                    Product Area
                    <Tooltip content="The area of the product this request relates to" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-36">
                  <span className="inline-flex items-center gap-1">
                    Source
                    <Tooltip content="Where this request originated — customer, engineering, or internal" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-20">
                  <span className="inline-flex items-center justify-end gap-1">
                    Votes
                    <Tooltip content="Number of stakeholders who have upvoted this request" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-56">
                  <span className="inline-flex items-center gap-1">
                    Submitted By
                    <Tooltip content="The person or team who submitted this request" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                  </span>
                </th>
                <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-secondary)] w-28">
                  <span className="inline-flex items-center justify-end gap-1">
                    Age
                    <Tooltip content="How long this request has been waiting in the inbox" placement="bottom" width={200}>
                      <Info size={11} className="text-[var(--color-text-muted)] flex-shrink-0" />
                    </Tooltip>
                    <button
                      type="button"
                      onClick={() => setAgeSort((prev) => prev === "asc" ? "desc" : prev === "desc" ? null : "asc")}
                      aria-label={ageSort === "asc" ? "Sort oldest first" : ageSort === "desc" ? "Clear sort" : "Sort newest first"}
                      className={cn(
                        "flex items-center justify-center h-4 w-4 rounded transition-colors",
                        ageSort
                          ? "text-[var(--color-brand)]"
                          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                      )}
                    >
                      {ageSort === "asc"
                        ? <ArrowUp size={11} />
                        : ageSort === "desc"
                        ? <ArrowDown size={11} />
                        : <ArrowUpDown size={11} />}
                    </button>
                  </span>
                </th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {filteredFeatures.map((feature) => {
                const isSelected = selected.has(feature.id);
                const { label: waitLabel, urgent: waitUrgent } = waitingLabel(feature.submittedAt);

                return (
                  <React.Fragment key={feature.id}>
                  <tr
                    onClick={() => toggleRow(feature.id)}
                    className={cn(
                      "group border-b border-[var(--color-border-subtle)] cursor-pointer transition-colors",
                      isSelected
                        ? "bg-[var(--color-brand)]/5"
                        : "hover:bg-[var(--color-bg-hover)]",
                    )}
                  >
                    {/* Checkbox */}
                    <td className="pl-4 w-10" onClick={(e) => e.stopPropagation()}>
                      <div
                        role="checkbox"
                        aria-checked={isSelected}
                        tabIndex={-1}
                        onClick={() => toggleRow(feature.id)}
                        className={cn(
                          "h-4 w-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                          isSelected
                            ? "bg-[var(--color-brand)] border-[var(--color-brand)]"
                            : "border-[var(--color-border-strong)] opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {isSelected && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    </td>

                    {/* Feature title */}
                    <td className="px-4 py-3.5">
                      <span className={cn(
                        "text-[14px] font-medium leading-snug",
                        isSelected ? "text-[var(--color-brand)]" : "text-[var(--color-text-primary)]",
                      )}>
                        {feature.title}
                      </span>
                    </td>

                    {/* Product area */}
                    <td className="px-4 py-3.5 w-36">
                      <span className="text-[13px] text-[var(--color-text-secondary)]">
                        {feature.productArea}
                      </span>
                    </td>

                    {/* Source badge */}
                    <td className="px-4 py-3.5 w-36">
                      <SourceBadge source={feature.source} />
                    </td>

                    {/* Votes */}
                    <td className="px-4 py-3.5 w-20 text-right">
                      {feature.votes.length > 0 ? (
                        <div className="flex items-center justify-end gap-1" aria-label={`${feature.votes.length} votes`}>
                          <ThumbsUp size={11} className="text-[var(--color-text-muted)]" />
                          <span className="text-[12px] text-[var(--color-text-muted)] tabular-nums">
                            {feature.votes.length}
                          </span>
                        </div>
                      ) : null}
                    </td>

                    {/* Submitted by */}
                    <td className="px-4 py-3.5 w-56">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="h-[22px] w-[22px] rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: avatarColor(feature.submittedBy) }}
                          aria-hidden="true"
                        >
                          {getInitials(feature.submittedBy)}
                        </div>
                        <span className="text-[12px] text-[var(--color-text-secondary)] truncate">
                          {feature.submittedBy}
                        </span>
                      </div>
                    </td>

                    {/* Waiting */}
                    <td className="px-4 py-3.5 w-28 text-right">
                      <span className={cn(
                        "text-[12px] font-medium tabular-nums",
                        waitUrgent
                          ? "text-[var(--color-warning)]"
                          : "text-[var(--color-text-muted)]",
                      )}>
                        {waitLabel}
                      </span>
                    </td>

                    {/* Row actions */}
                    <td
                      className="pr-4 w-28 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-center gap-1">
                        {/* Folder — always visible */}
                        <button
                          onClick={() => setExpandedId((prev) => prev === feature.id ? null : feature.id)}
                          className={cn(
                            "inline-flex items-center justify-center h-7 px-2 gap-1.5 rounded-md transition-colors text-[11px] font-medium",
                            expandedId === feature.id
                              ? "text-[var(--color-brand)] bg-[var(--color-brand)]/12 border border-[var(--color-brand)]/30"
                              : "text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] hover:text-[var(--color-brand)] hover:border-[var(--color-brand)]/40 hover:bg-[var(--color-brand)]/6",
                          )}
                          aria-label="View details"
                          aria-expanded={expandedId === feature.id}
                        >
                          {expandedId === feature.id
                            ? <FolderOpen size={13} />
                            : <Folder size={13} />
                          }
                          Details
                        </button>
                        {/* Hover-only actions */}
                        <div className={cn(
                          "inline-flex items-center gap-1 transition-opacity",
                          "opacity-0 group-hover:opacity-100",
                          isSelected && "opacity-100",
                        )}>
                          <button
                            onClick={() => handleDelete(feature.id)}
                            className={cn(
                              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors",
                              "text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-bg-hover)]",
                            )}
                            aria-label="Delete feature"
                          >
                            <Trash2 size={15} />
                          </button>
                          <button
                            onClick={() => setMoveModalFeature(feature)}
                            className={cn(
                              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors",
                              "text-[var(--color-text-muted)] hover:text-[var(--color-brand)] hover:bg-[var(--color-bg-hover)]",
                            )}
                            aria-label="Move to team"
                          >
                            <ArrowRightCircle size={15} />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* ── Expanded decision panel ── */}
                  {expandedId === feature.id && (() => {
                    const cfg = PRIORITY_CONFIG[feature.prioritySignal];
                    return (
                      <tr>
                        <td colSpan={8} className="px-0 pb-0" onClick={(e) => e.stopPropagation()}>
                          <div className={cn(
                            "mx-4 mb-3 rounded-xl border border-[var(--color-border-subtle)]",
                            "bg-[var(--color-bg-elevated)] overflow-hidden",
                            "shadow-[0_4px_24px_rgba(0,0,0,0.08)]",
                            "animate-in fade-in slide-in-from-top-1 duration-150",
                          )}>
                            {/* Priority accent bar */}
                            <div className="h-[3px]" style={{ backgroundColor: cfg.color }} />

                            <div className="p-5">
                              {/* ── Hero metrics row ── */}
                              <div className="flex items-center gap-4 mb-5">
                                {/* Priority badge */}
                                <span
                                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px] font-semibold border"
                                  style={{ color: cfg.color, backgroundColor: `${cfg.color}15`, borderColor: `${cfg.color}40` }}
                                >
                                  <Zap size={11} fill={cfg.color} />
                                  {cfg.label}
                                </span>

                                {/* Vote count — prominent */}
                                {feature.votes.length > 0 && (
                                  <div className="flex items-center gap-1.5">
                                    <ThumbsUp size={14} className="text-[var(--color-text-muted)]" />
                                    <span className="text-[15px] font-bold text-[var(--color-text-primary)] tabular-nums leading-none">
                                      {feature.votes.length}
                                    </span>
                                    <span className="text-[12px] text-[var(--color-text-muted)]">votes</span>
                                  </div>
                                )}

                                {/* Waiting time */}
                                <div className="flex items-center gap-1.5">
                                  <Clock size={13} className={waitUrgent ? "text-[var(--color-warning)]" : "text-[var(--color-text-muted)]"} />
                                  <span className={cn(
                                    "text-[12px] font-medium",
                                    waitUrgent ? "text-[var(--color-warning)]" : "text-[var(--color-text-muted)]",
                                  )}>
                                    {waitLabel} waiting
                                  </span>
                                </div>

                                <div className="flex-1" />

                                {/* Submitter */}
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                    style={{ backgroundColor: avatarColor(feature.submittedBy) }}
                                  >
                                    {getInitials(feature.submittedBy)}
                                  </div>
                                  <span className="text-[12px] text-[var(--color-text-secondary)]">{feature.submittedBy}</span>
                                </div>
                              </div>

                              {/* ── Content cards ── */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] p-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
                                    Description
                                  </p>
                                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                                    {feature.description}
                                  </p>
                                </div>
                                <div className="rounded-lg border p-4" style={{ backgroundColor: `${cfg.color}08`, borderColor: `${cfg.color}25` }}>
                                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: cfg.color }}>
                                    Business Context
                                  </p>
                                  <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed">
                                    {feature.businessContext}
                                  </p>
                                </div>
                              </div>

                              {/* ── Supporting links ── */}
                              {feature.supportingLinks.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {feature.supportingLinks.map((link, i) => (
                                    <a
                                      key={i}
                                      href={link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className={cn(
                                        "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-[12px]",
                                        "bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)]",
                                        "text-[var(--color-text-secondary)] hover:text-[var(--color-brand)] hover:border-[var(--color-brand)]/40",
                                        "transition-colors",
                                      )}
                                    >
                                      <ExternalLink size={11} />
                                      {link.replace(/^https?:\/\//, "").split("/")[0]}
                                    </a>
                                  ))}
                                </div>
                              )}

                              {/* ── Decision footer ── */}
                              <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]">
                                <button
                                  onClick={() => handleDelete(feature.id)}
                                  className={cn(
                                    "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-medium",
                                    "text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]",
                                    "hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/40 hover:bg-[var(--color-danger)]/6",
                                    "transition-colors",
                                  )}
                                >
                                  <Trash2 size={13} />
                                  Dismiss
                                </button>

                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-[var(--color-text-muted)] mr-1">Send to →</span>
                                  {TEAMS.map((team) => (
                                    <button
                                      key={team.id}
                                      onClick={() => { moveFeatures([feature.id], team.id); setExpandedId(null); }}
                                      className={cn(
                                        "inline-flex items-center gap-2 h-8 px-3.5 rounded-lg text-[12px] font-semibold",
                                        "border transition-all duration-150",
                                        "hover:scale-[1.03] active:scale-[0.98]",
                                      )}
                                      style={{
                                        color: team.color,
                                        backgroundColor: `${team.color}12`,
                                        borderColor: `${team.color}40`,
                                      }}
                                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${team.color}22`; }}
                                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${team.color}12`; }}
                                    >
                                      <span
                                        className="h-4 w-4 rounded flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                                        style={{ backgroundColor: team.color }}
                                      >
                                        {team.name[0]}
                                      </span>
                                      {team.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })()}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot><tr><td colSpan={8} className="h-20" /></tr></tfoot>
          </table>
        )}
      </div>

      {/* ── Next phase bar ── */}
      {hasMoved && features.length > 0 && (
        <NextPhaseBar
          nextPhase="Ideas"
          options={TEAMS.map((t) => ({
            label: `${t.name} · Ideas`,
            href: `/team/${t.slug}/ideas`,
            color: t.color,
          }))}
        />
      )}

      {/* ── Bulk move modal ── */}
      {bulkMoveOpen && (
        <MoveToTeamModal
          feature={{
            id: "bulk",
            title: `${selected.size} feature${selected.size !== 1 ? "s" : ""}`,
            productArea: "",
            source: "customer",
            votes: [],
            submittedBy: "",
            submittedAt: "",
            description: "",
            businessContext: "",
            prioritySignal: "important",
            supportingLinks: [],
          }}
          onSelect={(teamId) => {
            moveFeatures([...selected], teamId);
            setBulkMoveOpen(false);
          }}
          onClose={() => setBulkMoveOpen(false)}
        />
      )}

      {/* ── Move to team modal ── */}
      {moveModalFeature && (
        <MoveToTeamModal
          feature={moveModalFeature}
          onSelect={(teamId) => {
            handleMoveToTeam(moveModalFeature, teamId);
            setMoveModalFeature(null);
          }}
          onClose={() => setMoveModalFeature(null)}
        />
      )}

      {/* ── Delete toast ── */}
      {deletedToast && (
        <div
          className={cn(
            "fixed bottom-20 left-1/2 -translate-x-1/2 z-50",
            "flex items-center gap-2.5 px-4 py-2.5 rounded-xl",
            "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.18)]",
            "text-[12px] text-[var(--color-text-secondary)] max-w-sm",
            "animate-in fade-in slide-in-from-bottom-2 duration-200",
          )}
        >
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-danger)]/10">
            <Trash2 size={11} className="text-[var(--color-danger)]" />
          </div>
          <span className="truncate">
            <span className="font-medium text-[var(--color-text-primary)]">Deleted</span>
            {" · "}
            <span className="text-[var(--color-text-muted)]">{deletedToast}</span>
          </span>
        </div>
      )}

      {/* ── Move toast ── */}
      {lastMoved && (
        <div
          className={cn(
            "fixed bottom-20 left-1/2 -translate-x-1/2 z-50 mt-2",
            "flex items-center gap-2.5 px-4 py-2.5 rounded-xl",
            "bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)]",
            "shadow-[0_8px_32px_rgba(0,0,0,0.18)] text-[12px] text-[var(--color-text-secondary)]",
            "animate-in fade-in slide-in-from-bottom-2 duration-200",
          )}
        >
          <Check size={13} className="text-[var(--color-success)]" />
          <span>
            Moved to{" "}
            <button
              onClick={() => {
                const team = TEAMS.find((t) => t.name === lastMoved.teamName);
                if (team) router.push(`/team/${team.slug}/ideas`);
              }}
              className="font-semibold text-[var(--color-text-primary)] underline underline-offset-2 hover:no-underline"
            >
              {lastMoved.teamName}
            </button>
            {" "}· Ideas
          </span>
        </div>
      )}
    </div>
  );
}
