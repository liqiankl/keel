"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Link2,
  Check,
  Plus,
  ChevronDown,
  Send,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { TEAMS } from "@/lib/constants";

// ─────────────────────────────────────────────
// InviteModal — invite teammates from the sidebar.
// ─────────────────────────────────────────────

interface InviteModalProps {
  open: boolean;
  onClose: () => void;
}

type Role = "admin" | "member" | "viewer";

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "admin",  label: "Admin",  description: "Full access, manage workspace" },
  { value: "member", label: "Member", description: "Create and edit content"       },
  { value: "viewer", label: "Viewer", description: "Read-only access"              },
];

const TEAM_OPTIONS = [
  { value: "all",  label: "All teams" },
  ...TEAMS.map((t) => ({ value: t.id, label: t.name })),
];

const INVITE_LINK = "https://app.keel.so/invite/keel-demo-xyz";

export function InviteModal({ open, onClose }: InviteModalProps) {
  const [emails, setEmails]       = useState<string[]>([""]);
  const [role, setRole]           = useState<Role>("member");
  const [teamId, setTeamId]       = useState("all");
  const [sent, setSent]           = useState(false);
  const [copied, setCopied]       = useState(false);
  const [roleOpen, setRoleOpen]   = useState(false);
  const [teamOpen, setTeamOpen]   = useState(false);
  const [mounted, setMounted]     = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (open) {
      setEmails([""]);
      setRole("member");
      setTeamId("all");
      setSent(false);
      setRoleOpen(false);
      setTeamOpen(false);
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [open, onClose]);

  function setEmail(i: number, val: string) {
    setEmails((prev) => prev.map((e, idx) => (idx === i ? val : e)));
  }

  function removeEmail(i: number) {
    setEmails((prev) => prev.length === 1 ? [""] : prev.filter((_, idx) => idx !== i));
  }

  function addEmail() {
    setEmails((prev) => [...prev, ""]);
  }

  function handlePaste(i: number, e: React.ClipboardEvent<HTMLInputElement>) {
    const text = e.clipboardData.getData("text");
    const pasted = text.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
    if (pasted.length > 1) {
      e.preventDefault();
      setEmails((prev) => {
        const next = [...prev];
        next.splice(i, 1, ...pasted);
        return next;
      });
    }
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && emails[i].trim()) {
      e.preventDefault();
      addEmail();
    }
    if (e.key === "Backspace" && emails[i] === "" && emails.length > 1) {
      e.preventDefault();
      removeEmail(i);
    }
  }

  const validEmails = emails.filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  const canSend = validEmails.length > 0;

  function handleSend() {
    if (!canSend) return;
    setSent(true);
    setTimeout(() => {
      onClose();
      setSent(false);
    }, 1400);
  }

  function copyLink() {
    navigator.clipboard.writeText(INVITE_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === role)!;
  const selectedTeam = TEAM_OPTIONS.find((t) => t.value === teamId)!;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="invite-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/50 z-[200]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            key="invite-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Invite teammates"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{    opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed z-[201] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-[440px] max-w-[calc(100vw-32px)]",
              "rounded-xl border border-[var(--color-border-subtle)]",
              "bg-[var(--color-bg-elevated)]",
              "shadow-[0_24px_64px_rgba(0,0,0,0.35),0_4px_16px_rgba(0,0,0,0.15)]",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--color-border-subtle)]">
              <div>
                <h2 className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                  Invite teammates
                </h2>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  They'll get an email with a link to join the workspace.
                </p>
              </div>
              <button
                onClick={onClose}
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md",
                  "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]",
                  "hover:bg-[var(--color-bg-hover)] transition-colors",
                )}
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Email inputs */}
              <div>
                <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                  Email addresses
                </label>
                <div className={cn(
                  "rounded-lg border border-[var(--color-border-strong)] bg-[var(--color-bg-base)]",
                  "focus-within:ring-1 focus-within:ring-[var(--color-brand)] focus-within:border-[var(--color-brand)]",
                  "transition-all overflow-hidden",
                )}>
                  {emails.map((email, i) => (
                    <div key={i} className="flex items-center group">
                      <Mail
                        size={13}
                        className="ml-3 flex-shrink-0 text-[var(--color-text-muted)]"
                      />
                      <input
                        ref={i === 0 ? firstInputRef : undefined}
                        type="email"
                        placeholder={i === 0 ? "colleague@company.com" : "another@company.com"}
                        value={email}
                        onChange={(e) => setEmail(i, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(i, e)}
                        onPaste={(e) => handlePaste(i, e)}
                        className={cn(
                          "flex-1 h-9 px-2 text-[13px] bg-transparent",
                          "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
                          "focus:outline-none",
                          i < emails.length - 1 && "border-b border-[var(--color-border-subtle)]",
                        )}
                      />
                      {(emails.length > 1 || email) && (
                        <button
                          type="button"
                          onClick={() => removeEmail(i)}
                          className={cn(
                            "mr-2 flex-shrink-0 text-[var(--color-text-muted)]",
                            "hover:text-[var(--color-text-secondary)] transition-colors",
                            emails.length === 1 && !email && "invisible",
                          )}
                          aria-label="Remove email"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Add another row */}
                  <button
                    type="button"
                    onClick={addEmail}
                    className={cn(
                      "flex items-center gap-1.5 w-full h-8 px-3 text-[12px]",
                      "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
                      "border-t border-[var(--color-border-subtle)] hover:bg-[var(--color-bg-hover)]",
                      "transition-colors",
                    )}
                  >
                    <Plus size={12} />
                    Add another
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                  Press <kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-hover)] text-[10px] font-mono">Enter</kbd> or{" "}
                  <kbd className="px-1 py-0.5 rounded bg-[var(--color-bg-hover)] text-[10px] font-mono">,</kbd> to add multiple. Paste a list to bulk-add.
                </p>
              </div>

              {/* Role + Team row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Role picker */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                    Role
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setRoleOpen((v) => !v); setTeamOpen(false); }}
                      className={cn(
                        "w-full flex items-center justify-between h-8 px-3 rounded-lg text-[13px]",
                        "border border-[var(--color-border-strong)] bg-[var(--color-bg-base)]",
                        "text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]",
                        "focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]",
                        "transition-colors",
                        roleOpen && "ring-1 ring-[var(--color-brand)] border-[var(--color-brand)]",
                      )}
                      aria-expanded={roleOpen}
                      aria-haspopup="listbox"
                    >
                      <span>{selectedRole.label}</span>
                      <ChevronDown size={13} className={cn("text-[var(--color-text-muted)] transition-transform", roleOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {roleOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0,  scale: 1    }}
                          exit={{    opacity: 0, y: -4, scale: 0.97 }}
                          transition={{ duration: 0.12 }}
                          className={cn(
                            "absolute top-[calc(100%+4px)] left-0 right-0 z-10",
                            "rounded-lg border border-[var(--color-border-strong)]",
                            "bg-[var(--color-bg-elevated)] shadow-lg overflow-hidden",
                          )}
                          role="listbox"
                        >
                          {ROLE_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              role="option"
                              aria-selected={role === opt.value}
                              onClick={() => { setRole(opt.value); setRoleOpen(false); }}
                              className={cn(
                                "w-full flex items-start gap-2 px-3 py-2 text-left",
                                "hover:bg-[var(--color-bg-hover)] transition-colors",
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-medium text-[var(--color-text-primary)]">{opt.label}</p>
                                <p className="text-[11px] text-[var(--color-text-muted)]">{opt.description}</p>
                              </div>
                              {role === opt.value && (
                                <Check size={13} className="text-[var(--color-brand)] mt-0.5 flex-shrink-0" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Team picker */}
                <div>
                  <label className="block text-[11px] font-medium text-[var(--color-text-secondary)] mb-1.5">
                    Team
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { setTeamOpen((v) => !v); setRoleOpen(false); }}
                      className={cn(
                        "w-full flex items-center justify-between h-8 px-3 rounded-lg text-[13px]",
                        "border border-[var(--color-border-strong)] bg-[var(--color-bg-base)]",
                        "text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]",
                        "focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]",
                        "transition-colors",
                        teamOpen && "ring-1 ring-[var(--color-brand)] border-[var(--color-brand)]",
                      )}
                      aria-expanded={teamOpen}
                      aria-haspopup="listbox"
                    >
                      <span>{selectedTeam.label}</span>
                      <ChevronDown size={13} className={cn("text-[var(--color-text-muted)] transition-transform", teamOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {teamOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0,  scale: 1    }}
                          exit={{    opacity: 0, y: -4, scale: 0.97 }}
                          transition={{ duration: 0.12 }}
                          className={cn(
                            "absolute top-[calc(100%+4px)] left-0 right-0 z-10",
                            "rounded-lg border border-[var(--color-border-strong)]",
                            "bg-[var(--color-bg-elevated)] shadow-lg overflow-hidden",
                          )}
                          role="listbox"
                        >
                          {TEAM_OPTIONS.map((opt) => {
                            const team = TEAMS.find((t) => t.id === opt.value);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                role="option"
                                aria-selected={teamId === opt.value}
                                onClick={() => { setTeamId(opt.value); setTeamOpen(false); }}
                                className={cn(
                                  "w-full flex items-center gap-2.5 px-3 py-2 text-left",
                                  "hover:bg-[var(--color-bg-hover)] transition-colors",
                                )}
                              >
                                {team ? (
                                  <div
                                    className="h-4 w-4 rounded flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                    style={{ backgroundColor: team.color }}
                                  >
                                    {team.name[0]}
                                  </div>
                                ) : (
                                  <div className="h-4 w-4 rounded bg-[var(--color-border-strong)] flex-shrink-0" />
                                )}
                                <span className="text-[12px] text-[var(--color-text-primary)]">{opt.label}</span>
                                {teamId === opt.value && (
                                  <Check size={12} className="text-[var(--color-brand)] ml-auto flex-shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Invite link */}
              <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-surface)] p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Link2 size={12} className="text-[var(--color-text-muted)]" />
                  <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">
                    Or share an invite link
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[11px] text-[var(--color-text-muted)] truncate font-mono">
                    {INVITE_LINK}
                  </code>
                  <button
                    type="button"
                    onClick={copyLink}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-1 h-6 px-2.5 rounded-md text-[11px] font-medium transition-colors",
                      copied
                        ? "bg-[var(--color-success)]/15 text-[var(--color-success)]"
                        : "bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
                    )}
                  >
                    {copied ? <><Check size={11} /> Copied</> : <><Link2 size={11} /> Copy</>}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--color-border-subtle)]">
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  "h-8 px-4 rounded-lg text-[13px] font-medium transition-colors",
                  "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]",
                  "hover:text-[var(--color-text-primary)]",
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!canSend || sent}
                className={cn(
                  "flex items-center gap-1.5 h-8 px-4 rounded-lg text-[13px] font-medium transition-all",
                  sent
                    ? "bg-[var(--color-success)] text-white"
                    : "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-hover)]",
                  "disabled:opacity-40 disabled:cursor-not-allowed",
                )}
              >
                {sent ? (
                  <><Check size={13} /> Invites sent!</>
                ) : (
                  <>
                    <Send size={13} />
                    Send invite{validEmails.length > 1 ? `s (${validEmails.length})` : ""}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
