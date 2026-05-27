"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowRight, Sparkles, Sun, Moon,
  MessageSquare, LayoutGrid,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useInboxStore } from "@/store/useInboxStore";
import { useRoadmapStore } from "@/store/useRoadmapStore";
import { TEAMS, CURRENT_QUARTER } from "@/lib/constants";
import { useTheme } from "@/hooks/useTheme";

export default function WorkspacePage() {
  const workspace = useAppStore((s) => s.workspace);
  const requests  = useInboxStore((s) => s.requests);
  const plans     = useRoadmapStore((s) => s.plans);
  const { theme, cycleTheme } = useTheme();

  const initials = workspace.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalRequests = useMemo(
    () => requests.filter((r) => r.status !== "archived").length,
    [requests],
  );

  const stats = [
    { label: "Teams",    value: TEAMS.length             },
    { label: "Members",  value: workspace.members.length },
    { label: "Feature Requests", value: totalRequests            },
  ];

  return (
    <div
      className="min-h-screen flex flex-col overflow-y-auto relative"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      {/* ── Background grid ── */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-text-primary) 1px, transparent 1px),
                            linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Ambient blobs ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: workspace.avatarColor }}
        />
        <div
          className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{ backgroundColor: "#5e5ce6" }}
        />
        <div
          className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10"
          style={{ backgroundColor: "#a78bfa" }}
        />
      </div>

      {/* ── Theme toggle ── */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={cycleTheme}
          aria-label={`Current theme: ${theme}. Click to toggle.`}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] backdrop-blur-md transition-colors"
          style={{
            color: "var(--color-text-muted)",
            backgroundColor: "var(--color-bg-surface)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          {theme === "dark" ? <Moon size={13} /> : <Sun size={13} />}
          <span className="capitalize">{theme}</span>
        </button>
      </div>

      {/* ── Hero ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16">

        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 h-7 px-3 rounded-full text-[11px] font-medium"
          style={{
            border: "1px solid color-mix(in srgb, var(--color-brand) 35%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--color-brand) 10%, transparent)",
            color: "color-mix(in srgb, var(--color-brand) 90%, var(--color-text-primary))",
          }}
        >
          <Sparkles size={11} />
          Product planning workspace
        </div>

        {/* Avatar with rings */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outermost pulse ring */}
          <div
            className="absolute h-40 w-40 rounded-3xl opacity-10 animate-pulse"
            style={{ backgroundColor: workspace.avatarColor }}
          />
          {/* Middle ring */}
          <div
            className="absolute h-28 w-28 rounded-2xl opacity-20"
            style={{
              backgroundColor: "transparent",
              border: `1px solid ${workspace.avatarColor}`,
            }}
          />
          {/* Avatar */}
          <div
            className="relative h-20 w-20 rounded-2xl flex items-center justify-center text-[30px] font-black text-white shadow-2xl"
            style={{
              backgroundColor: workspace.avatarColor,
              boxShadow: `0 0 40px ${workspace.avatarColor}55, 0 20px 40px rgba(0,0,0,0.4)`,
            }}
          >
            {initials}
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-[38px] sm:text-[46px] font-light leading-tight tracking-tight mb-3"
          style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          Welcome to{" "}
          <span
            className="text-transparent bg-clip-text"
            style={{
              backgroundImage: `linear-gradient(135deg, ${workspace.avatarColor} 0%, #a78bfa 100%)`,
            }}
          >
            {workspace.name}
          </span>
        </h1>
        <p
          className="text-[15px] max-w-sm leading-relaxed mb-10"
          style={{ color: "var(--color-text-muted)" }}
        >
          Your product planning Olympus hub — where ideas become shipped features.
        </p>

        {/* CTA */}
        <Link
          href="/inbox"
          className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-2xl text-[14px] font-semibold text-white transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${workspace.avatarColor} 0%, #a78bfa 100%)`,
            boxShadow: `0 0 30px ${workspace.avatarColor}55, 0 8px 24px rgba(0,0,0,0.3)`,
          }}
        >
          Open workspace
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* ── Body ── */}
      <div className="relative z-10 flex flex-col items-center px-4 sm:px-6 pb-16">
        <div className="w-full max-w-lg flex flex-col gap-8">

          {/* ── Stats ── */}
          <div
            className="flex items-center justify-around rounded-2xl px-6 py-4"
            style={{
              backgroundColor: "var(--color-bg-surface)",
              border: "1px solid var(--color-border-subtle)",
            }}
          >
            {stats.map(({ label, value }, i) => (
              <div key={label} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-0.5">
                  <span
                    className="text-[22px] font-bold tabular-nums leading-none"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {value}
                  </span>
                  <span
                    className="text-[11px] font-medium"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {label}
                  </span>
                </div>
                {i < stats.length - 1 && (
                  <div
                    className="w-px h-7 ml-4"
                    style={{ backgroundColor: "var(--color-border-subtle)" }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Teams ── */}
          <section className="flex flex-col gap-3">
            <h2
              className="text-[11px] font-bold uppercase tracking-widest px-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
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
                  className="group relative overflow-hidden flex items-center gap-4 px-5 py-4 rounded-2xl transition-all hover:-translate-y-0.5 cursor-default"
                  style={{
                    backgroundColor: "var(--color-bg-surface)",
                    border: "1px solid var(--color-border-subtle)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  }}
                >
                  {/* Left color bar */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ backgroundColor: team.color }}
                  />

                  {/* Background glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: `radial-gradient(ellipse 60% 80% at 10% 50%, ${team.color}0d, transparent)`,
                    }}
                  />

                  {/* Icon */}
                  <div
                    className="relative h-11 w-11 rounded-xl flex items-center justify-center text-[16px] font-black text-white flex-shrink-0 shadow-lg"
                    style={{
                      backgroundColor: team.color,
                      boxShadow: `0 4px 16px ${team.color}55`,
                    }}
                  >
                    {team.name[0]}
                  </div>

                  {/* Info */}
                  <div className="relative flex-1 min-w-0">
                    <p
                      className="text-[14px] font-bold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {team.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <MessageSquare size={10} />
                        {teamRequests} idea{teamRequests !== 1 ? "s" : ""}
                      </span>
                      <span style={{ color: "var(--color-border-strong)" }}>·</span>
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <LayoutGrid size={10} />
                        {initiativeCount} initiative{initiativeCount !== 1 ? "s" : ""} · {CURRENT_QUARTER.label}
                      </span>
                    </div>
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
