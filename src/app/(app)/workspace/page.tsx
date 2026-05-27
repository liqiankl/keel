"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useInboxStore } from "@/store/useInboxStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { TEAMS, CURRENT_QUARTER } from "@/lib/constants";


export default function WorkspacePage() {
  const workspace = useAppStore((s) => s.workspace);
  const requests  = useInboxStore((s) => s.requests);
  const plans     = useRoadmapStore((s) => s.plans);

  const initials = workspace.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalRequests = useMemo(() => requests.length, [requests]);

  return (
    <div className="h-full bg-[var(--color-bg-base)] flex flex-col overflow-y-auto">

      {/* ── Hero band ── */}
      <div
        className="relative overflow-hidden px-6 pt-16 pb-14 flex flex-col items-center text-center"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in srgb, ${workspace.avatarColor} 18%, transparent), transparent)`,
        }}
      >
        {/* Glow ring behind avatar */}
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 h-32 w-32 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: workspace.avatarColor }}
        />

        {/* Avatar */}
        <div
          className="relative h-[72px] w-[72px] rounded-2xl flex items-center justify-center text-[26px] font-bold text-white shadow-xl mb-5"
          style={{ backgroundColor: workspace.avatarColor }}
        >
          {initials}
        </div>

        {/* Greeting */}
        <p className="text-[13px] font-medium text-[var(--color-text-muted)] mb-1 flex items-center gap-1.5">
          <Sparkles size={13} className="opacity-70" />
          Your product planning workspace
        </p>
        <h1 className="text-[28px] font-bold text-[var(--color-text-primary)] leading-tight tracking-tight">
          Welcome to {workspace.name}
        </h1>
        <p className="text-[14px] text-[var(--color-text-muted)] mt-2 max-w-sm leading-relaxed">
          Your product planning hub — where ideas become shipped features.
        </p>

        {/* CTA */}
        <Link
          href="/inbox"
          className="mt-7 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-brand)] text-white text-[14px] font-semibold shadow-lg hover:opacity-90 active:scale-95 transition-all"
        >
          Open workspace
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-lg flex flex-col gap-8">

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Teams",    value: TEAMS.length                 },
              { label: "Members",  value: workspace.members.length     },
              { label: "Requests", value: totalRequests                },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-0.5 py-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
              >
                <span className="text-[24px] font-bold text-[var(--color-text-primary)] leading-none tabular-nums">
                  {value}
                </span>
                <span className="text-[11px] text-[var(--color-text-muted)] font-medium mt-0.5">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* ── Teams ── */}
          <section className="flex flex-col gap-2.5">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--color-text-muted)] px-0.5">
              Your teams
            </h2>
            {TEAMS.map((team) => {
              const teamRequests    = requests.filter((r) => (r.teamId ?? "team_navigators") === team.id).length;
              const teamPlan        = plans.find(
                (p) => p.teamId === team.id &&
                       p.quarter.year === CURRENT_QUARTER.year &&
                       p.quarter.quarter === CURRENT_QUARTER.quarter,
              );
              const initiativeCount = teamPlan?.items.length ?? 0;

              return (
                <div
                  key={team.id}
                  className="flex items-center gap-4 px-4 py-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)]"
                  style={{ borderLeftColor: team.color, borderLeftWidth: 3 }}
                >
                  <div
                    className="h-9 w-9 rounded-xl flex items-center justify-center text-[14px] font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: team.color }}
                  >
                    {team.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">{team.name}</p>
                    <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5">
                      {teamRequests} idea{teamRequests !== 1 ? "s" : ""} · {initiativeCount} initiative{initiativeCount !== 1 ? "s" : ""} in {CURRENT_QUARTER.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </section>

        </div>
      </div>
    </div>
  );
}
