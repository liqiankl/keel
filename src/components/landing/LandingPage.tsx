"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Inbox,
  BarChart2,
  Map,
  Share2,
  Check,
  ChevronRight,
  Layers,
  Zap,
  Target,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/cn";
export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [launching, setLaunching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 16); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleGetStarted = useCallback(() => {
    if (launching) return;
    setLaunching(true);
    setTimeout(() => router.push("/workspace"), 420);
  }, [launching, router]);

  return (
    <div className="min-h-screen bg-[#0d0d10] text-[#f0f0f2] overflow-x-hidden">
      <Nav scrolled={scrolled} />
      <Hero onGetStarted={handleGetStarted} launching={launching} />
      <Features />
      <HowItWorks />
      <FinalCta onGetStarted={handleGetStarted} launching={launching} />
      <Footer />
    </div>
  );
}

// ── Nav ────────────────────────────────────────

function Nav({ scrolled }: { scrolled: boolean }) {
  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#0d0d10]/90 backdrop-blur-md border-b border-white/5"
          : "bg-transparent",
      )}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded-md bg-[#5e5ce6] flex items-center justify-center">
            <Layers size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">Keel</span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {(["Features", "How it works"] as const).map((label) => {
            const id = label === "Features" ? "features" : "how-it-works";
            return (
              <button
                key={label}
                onClick={() =>
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
                }
                className="text-sm text-[#8888a0] hover:text-white transition-colors"
              >
                {label}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
}

// ── Hero ───────────────────────────────────────

function Hero({
  onGetStarted,
  launching,
}: {
  onGetStarted: () => void;
  launching: boolean;
}) {
  return (
    <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(94,92,230,0.25) 0%, transparent 70%)",
        }}
      />

      {/* Announcement pill */}
      <div className="inline-flex items-center gap-2 mb-6 h-7 px-3 rounded-full border border-[#5e5ce6]/30 bg-[#5e5ce6]/10 text-xs text-[#a8a8f0]">
        <span className="flex h-1.5 w-1.5 rounded-full bg-[#5e5ce6]" />
        Introducing Keel — Product planning, reimagined
      </div>

      {/* Headline */}
      <h1 className="mx-auto max-w-3xl text-5xl sm:text-6xl font-bold tracking-tight leading-[1.1] text-white">
        The PM workspace that{" "}
        <span
          className="text-transparent bg-clip-text"
          style={{
            backgroundImage: "linear-gradient(135deg, #5e5ce6 0%, #a78bfa 50%, #ec4899 100%)",
          }}
        >
          ships what matters
        </span>
      </h1>

      {/* Subheadline */}
      <p className="mx-auto mt-6 max-w-xl text-lg text-[#8888a0] leading-relaxed">
        Inbox requests, prioritize with RICE, MoSCoW, or WSJF, plan your quarter, and share
        beautiful roadmaps — all in one focused tool.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
        <button
          onClick={onGetStarted}
          disabled={launching}
          className={cn(
            "inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm font-semibold transition-all",
            "bg-[#5e5ce6] text-white hover:bg-[#4b49cc] shadow-lg shadow-[#5e5ce6]/20",
            "disabled:opacity-75 disabled:cursor-not-allowed",
            launching && "pl-4",
          )}
        >
          {launching ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Launching…
            </>
          ) : (
            <>
              Get started — it&apos;s free
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </div>

      {/* Trust line */}
      <p className="mt-6 text-xs text-[#55556a]">
        No credit card required &nbsp;·&nbsp; Free to use
      </p>

      {/* App UI Mockup */}
      <div className="relative mx-auto mt-16 max-w-5xl">
        {/* Glow under the card */}
        <div
          className="absolute inset-x-10 -bottom-4 h-16 blur-2xl opacity-40 rounded-full"
          style={{ background: "linear-gradient(90deg, #5e5ce6, #a78bfa, #ec4899)" }}
        />
        <AppMockup />
      </div>
    </section>
  );
}

function AppMockup() {
  return (
    <div
      className="relative rounded-xl overflow-hidden border border-white/8 shadow-2xl text-left"
      style={{ background: "#1b1b1f" }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 h-9 border-b border-white/6 bg-[#17171a]">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex-1 mx-4">
          <div className="mx-auto h-5 w-44 rounded bg-white/5 flex items-center justify-center">
            <span className="text-[10px] text-[#55556a]">keel-kappa.vercel.app/inbox</span>
          </div>
        </div>
      </div>

      {/* App shell */}
      <div className="flex" style={{ height: 400 }}>

        {/* ── Sidebar ── */}
        <div className="w-[148px] border-r border-white/5 bg-[#17171a] flex flex-col py-2 flex-shrink-0">
          {/* Workspace */}
          <div className="flex items-center gap-2 px-3 h-9 border-b border-white/5 mb-1">
            <div className="h-5 w-5 rounded-md bg-[#5e5ce6] flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">K</div>
            <span className="text-[11px] font-semibold text-white/80 truncate">Keel</span>
          </div>
          {/* Primary nav */}
          <div className="px-1.5 flex flex-col gap-0.5 mb-2">
            {[
              { label: "Inbox", active: true },
              { label: "Views", active: false },
            ].map(({ label, active }) => (
              <div key={label} className={cn("flex items-center gap-2 h-7 px-2 rounded text-[11px]", active ? "bg-[#5e5ce6] text-white" : "text-[#55556a]")}>
                <div className={cn("h-3.5 w-3.5 rounded-sm border flex-shrink-0", active ? "bg-white/20 border-white/20" : "border-white/10")} />
                {label}
              </div>
            ))}
          </div>
          {/* Divider */}
          <div className="mx-3 border-t border-white/5 mb-1" />
          {/* Teams */}
          <div className="text-[8px] font-semibold uppercase tracking-widest text-[#3a3a4a] px-3 mb-1">Teams</div>
          <div className="px-1.5 flex flex-col gap-0.5">
            {[
              { name: "Navigators",   color: "#5e5ce6", open: true  },
              { name: "Hitchhikers",  color: "#30a46c", open: false },
            ].map(({ name, color, open }) => (
              <div key={name}>
                <div className="flex items-center gap-1.5 h-6 px-2 text-[11px] text-white/50">
                  <div className="h-3.5 w-3.5 rounded flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0" style={{ backgroundColor: color }}>{name[0]}</div>
                  <span className="truncate">{name}</span>
                </div>
                {open && (
                  <div className="pl-6 flex flex-col">
                    {["Ideas", "Prioritize", "Roadmap"].map((s) => (
                      <div key={s} className="h-5 flex items-center text-[10px] text-[#3a3a4a] px-1">{s}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Main ── */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* Header */}
          <div className="flex items-center px-4 h-10 border-b border-white/5 flex-shrink-0">
            <span className="text-[12px] font-semibold text-white/90">Inbox</span>
          </div>

          {/* View tabs */}
          <div className="flex items-center gap-0 border-b border-white/5 flex-shrink-0">
            {[
              { label: "Inbox",         active: true  },
              { label: "Ideas",         active: false },
              { label: "Prioritization",active: false },
              { label: "Roadmap",       active: false },
            ].map(({ label, active }) => (
              <span key={label} className={cn("text-[10px] h-8 flex items-center px-3 border-b-[1.5px]", active ? "text-white border-[#5e5ce6]" : "text-[#3a3a4a] border-transparent")}>
                {label}
              </span>
            ))}
          </div>

          {/* Group: New */}
          <div className="flex items-center gap-2 px-4 h-7 bg-[#17171a]/60 flex-shrink-0">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-[#55556a]">New</span>
            <span className="text-[9px] text-[#3a3a4a]">· 3</span>
          </div>

          {/* New rows */}
          {NEW_ROWS.map((r, i) => (
            <MockRow key={i} row={r} highlight={i === 0} />
          ))}

          {/* Group: Triaged */}
          <div className="flex items-center gap-2 px-4 h-7 bg-[#17171a]/60 flex-shrink-0">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-[#55556a]">Triaged</span>
            <span className="text-[9px] text-[#3a3a4a]">· 2</span>
          </div>

          {/* Triaged rows */}
          {TRIAGED_ROWS.map((r, i) => (
            <MockRow key={i} row={r} highlight={false} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MockRowData {
  id: string;
  title: string;
  signal: string;
  source: string;
  sourceColor: string;
  votes: number;
  date: string;
  initials: string;
  avatarColor: string;
}

function MockRow({ row, highlight }: { row: MockRowData; highlight: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 px-4 h-8 border-b border-white/[0.03] flex-shrink-0", highlight && "bg-white/[0.03]")}>
      {/* Priority dot */}
      <div className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", row.signal === "critical" ? "bg-[#e5484d]" : row.signal === "important" ? "bg-[#f97316]" : "bg-[#3a3a4a]")} />
      {/* ID */}
      <span className="text-[9px] text-[#3a3a4a] w-10 flex-shrink-0 font-mono">{row.id}</span>
      {/* Status circle */}
      <div className="h-3 w-3 rounded-full border border-white/15 flex-shrink-0" />
      {/* Title */}
      <span className="text-[11px] text-white/70 flex-1 truncate">{row.title}</span>
      {/* Source */}
      <span className="text-[8px] px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${row.sourceColor}18`, color: row.sourceColor }}>
        {row.source}
      </span>
      {/* Votes */}
      <div className="flex items-center gap-0.5 text-[9px] text-[#3a3a4a] flex-shrink-0 w-5">
        <span>↑</span><span>{row.votes}</span>
      </div>
      {/* Date */}
      <span className="text-[9px] text-[#3a3a4a] flex-shrink-0 w-10 text-right">{row.date}</span>
      {/* Avatar */}
      <div className="h-4 w-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white flex-shrink-0" style={{ backgroundColor: row.avatarColor }}>
        {row.initials}
      </div>
    </div>
  );
}

const NEW_ROWS: MockRowData[] = [
  { id: "REQ-001", title: "Bulk status update for feature requests", signal: "important", source: "internal", sourceColor: "#5e5ce6", votes: 2, date: "May 20", initials: "SK", avatarColor: "#5e5ce6" },
  { id: "REQ-004", title: "Export roadmap to PDF / CSV",             signal: "critical",  source: "customer", sourceColor: "#30a46c", votes: 6, date: "May 15", initials: "AR", avatarColor: "#30a46c" },
  { id: "REQ-006", title: "Stakeholder voting rounds",               signal: "low",       source: "internal", sourceColor: "#5e5ce6", votes: 1, date: "May 12", initials: "LM", avatarColor: "#f97316" },
];

const TRIAGED_ROWS: MockRowData[] = [
  { id: "REQ-002", title: "WSJF scoring framework support",          signal: "important", source: "internal", sourceColor: "#5e5ce6", votes: 1, date: "May 18", initials: "JR", avatarColor: "#8b5cf6" },
  { id: "REQ-005", title: "Quarterly capacity planning board",       signal: "critical",  source: "customer", sourceColor: "#30a46c", votes: 5, date: "May 10", initials: "PN", avatarColor: "#ec4899" },
];

// ── Logo strip ─────────────────────────────────

const LOGOS = ["Figma", "Stripe", "Notion", "Vercel", "Linear", "GitHub", "Slack", "Jira"];

function LogoStrip() {
  return (
    <section className="py-14 px-6 border-y border-white/5">
      <p className="text-center text-xs text-[#3a3a4a] uppercase tracking-widest mb-8">
        Trusted by product teams at
      </p>
      <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
        {LOGOS.map((name) => (
          <span key={name} className="text-sm font-semibold text-[#3a3a4a] tracking-tight">
            {name}
          </span>
        ))}
      </div>
    </section>
  );
}

// ── Features ───────────────────────────────────

const FEATURES = [
  {
    icon: Inbox,
    color: "#5e5ce6",
    title: "Unified request inbox",
    body: "Every feature request, customer ask, and internal idea flows into one structured inbox. Triage, tag, and route in seconds — never lose signal again.",
    points: ["Multi-team isolation", "Bulk triage actions", "Source tracking (customer / internal / market)"],
  },
  {
    icon: BarChart2,
    color: "#30a46c",
    title: "Flexible scoring frameworks",
    body: "Score initiatives with RICE, MoSCoW, WSJF, or your own custom dimensions. Compare across frameworks and override with a reason when gut matters.",
    points: ["RICE, MoSCoW, WSJF built-in", "Custom weighted dimensions", "Undo/redo with full history"],
  },
  {
    icon: Map,
    color: "#f97316",
    title: "Quarterly planning board",
    body: "Lay out your quarter on a capacity-aware roadmap. Set goals, assign effort, track status across teams — then lock and publish when you're ready.",
    points: ["Capacity bar with warnings", "Goal alignment tracking", "One-click plan locking"],
  },
  {
    icon: Share2,
    color: "#ec4899",
    title: "Shareable read-only views",
    body: "Generate a permanent link to your roadmap that stakeholders can view without an account. Control which fields are visible — no messy slide exports.",
    points: ["Token-based share links", "Revocable at any time", "Hidden effort / score options"],
  },
];

function Features() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [visibleCards, setVisibleCards]   = useState<Set<number>>(new Set());
  const headerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs  = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (entry.target === headerRef.current) {
            setHeaderVisible(true);
          } else {
            const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx >= 0) setVisibleCards((prev) => new Set([...prev, idx]));
          }
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    if (headerRef.current) observer.observe(headerRef.current);
    cardRefs.current.forEach((c) => { if (c) observer.observe(c); });
    return () => observer.disconnect();
  }, []);

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div
          ref={headerRef}
          className="text-center mb-16 transition-all duration-700"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-xs text-[#5e5ce6] uppercase tracking-widest font-semibold mb-3">
            Everything you need
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Built for the entire planning cycle
          </h2>
          <p className="mt-4 text-[#8888a0] max-w-lg mx-auto">
            From raw requests to a shipped roadmap — Keel handles every step without requiring five different tools.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map((f, i) => {
            const Icon    = f.icon;
            const visible = visibleCards.has(i);
            return (
              <div
                key={f.title}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="group rounded-xl border border-white/6 bg-[#17171a] p-6 hover:border-white/10 transition-all duration-700"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0) scale(1)" : "translateY(28px) scale(0.98)",
                  transitionDelay: `${i * 90}ms`,
                }}
              >
                <div
                  className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${f.color}20` }}
                >
                  <Icon size={17} style={{ color: f.color }} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#8888a0] leading-relaxed mb-4">{f.body}</p>
                <ul className="space-y-1.5">
                  {f.points.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs text-[#55556a]">
                      <Check size={11} className="text-[#5e5ce6] flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── How it works ───────────────────────────────

const STEPS = [
  {
    n: "01",
    icon: Inbox,
    color: "#5e5ce6",
    title: "Inbox",
    body: "Feature requests land in your team's inbox from any source — customers, internal Slack, support tickets, or leadership. Every signal in one place.",
  },
  {
    n: "02",
    icon: BarChart2,
    color: "#30a46c",
    title: "Prioritization",
    body: "Score each initiative using your preferred framework. RICE gives you a formula; MoSCoW gives you speed. Either way, the ranking is defensible.",
  },
  {
    n: "03",
    icon: Target,
    color: "#f97316",
    title: "Plan",
    body: "Drag initiatives into your quarterly plan. Watch the capacity bar fill up. Lock the plan when it's ready and kick off stakeholder review.",
  },
  {
    n: "04",
    icon: Share2,
    color: "#ec4899",
    title: "Ship",
    body: "Share a live roadmap link with stakeholders. No slides. No PDFs. As the quarter progresses, the view updates automatically.",
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs text-[#5e5ce6] uppercase tracking-widest font-semibold mb-3">
            How it works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Four steps from idea to shipped
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.n} className="relative">
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-5 left-[calc(100%+0px)] w-6 h-px bg-white/6" />
                )}

                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border"
                  style={{ borderColor: `${s.color}40`, backgroundColor: `${s.color}12` }}
                >
                  <Icon size={16} style={{ color: s.color }} />
                </div>
                <div className="text-[11px] font-mono text-[#3a3a4a] mb-1">{s.n}</div>
                <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-[#8888a0] leading-relaxed">{s.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Final CTA ──────────────────────────────────

function FinalCta({ onGetStarted, launching }: { onGetStarted?: () => void; launching?: boolean }) {
  return (
    <section className="py-28 px-6 border-t border-white/5 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 60% at 50% 100%, rgba(94,92,230,0.18) 0%, transparent 70%)",
        }}
      />
      <div className="max-w-2xl mx-auto text-center relative">
        <div
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl mx-auto"
          style={{ backgroundColor: "#5e5ce6" }}
        >
          <Zap size={20} className="text-white" />
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Ready to plan your next quarter?
        </h2>
        <p className="text-[#8888a0] mb-10 max-w-md mx-auto">
          Keel is free to use. No account required for the demo. Open the app and start
          triaging in under 60 seconds.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onGetStarted}
            disabled={launching}
            className={cn(
              "inline-flex items-center gap-2 h-12 px-8 rounded-full text-base font-semibold transition-all",
              "bg-[#5e5ce6] text-white hover:bg-[#4b49cc] shadow-lg shadow-[#5e5ce6]/25",
              "disabled:opacity-75 disabled:cursor-not-allowed",
            )}
          >
            {launching ? (
              <><Loader2 size={17} className="animate-spin" /> Launching…</>
            ) : (
              <>Open Keel free <ArrowRight size={17} /></>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/5 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-[#5e5ce6] flex items-center justify-center">
            <Layers size={11} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Keel</span>
        </div>

        <div className="flex items-center gap-6 flex-wrap justify-center">
          {[
            { label: "Product",   href: "/product"   },
            { label: "Changelog", href: "/changelog" },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="text-xs text-[#3a3a4a] hover:text-[#8888a0] transition-colors">
              {label}
            </Link>
          ))}
        </div>

        <p className="text-xs text-[#3a3a4a]">© 2026 Keel. All rights reserved.</p>
      </div>
    </footer>
  );
}
