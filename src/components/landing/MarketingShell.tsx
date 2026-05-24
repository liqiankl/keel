"use client";

import Link from "next/link";
import { Layers, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/cn";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0d0d10] text-[#f0f0f2]">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0d0d10]/90 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-6 w-6 rounded-md bg-[#5e5ce6] flex items-center justify-center">
              <Layers size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-white">Keel</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#8888a0] hover:text-white transition-colors"
          >
            <ArrowLeft size={12} />
            Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6 mt-16">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
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
              { label: "Docs",      href: "/docs"      },
              { label: "Privacy",   href: "/privacy"   },
              { label: "Terms",     href: "/terms"     },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                className="text-xs text-[#3a3a4a] hover:text-[#8888a0] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-[#3a3a4a]">© 2026 Keel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

// ── Shared prose primitives ────────────────────────────────

export function PageHero({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-14 border-b border-white/5 pb-10">
      {eyebrow && (
        <p className="text-xs text-[#5e5ce6] uppercase tracking-widest font-semibold mb-3">
          {eyebrow}
        </p>
      )}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight mb-4">
        {title}
      </h1>
      <p className="text-[#8888a0] text-lg max-w-2xl leading-relaxed">{subtitle}</p>
    </div>
  );
}

export function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      {title && (
        <h2 className="text-xl font-semibold text-white mb-5">{title}</h2>
      )}
      {children}
    </section>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn(
      "text-[#8888a0] text-sm leading-7 space-y-4",
      "[&_strong]:text-[#d0d0e0] [&_strong]:font-medium",
      "[&_a]:text-[#5e5ce6] [&_a]:hover:underline",
    )}>
      {children}
    </div>
  );
}

export function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold text-[#d0d0e0] mb-3">{title}</h3>
      <Prose>{children}</Prose>
    </div>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#5e5ce6]/20 bg-[#5e5ce6]/8 px-5 py-4 text-sm text-[#a8a8f0] leading-relaxed my-6">
      {children}
    </div>
  );
}

export function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-white/5 text-sm">
      <span className="w-32 flex-shrink-0 text-[#55556a] font-medium">{label}</span>
      <span className="text-[#8888a0]">{value}</span>
    </div>
  );
}
