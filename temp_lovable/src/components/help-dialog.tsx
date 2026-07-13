import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Icon, type IconName } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

type Tab = "shortcuts" | "docs" | "contact" | "about";

const TABS: { id: Tab; label: string; ic: IconName }[] = [
  { id: "shortcuts", label: "Shortcuts", ic: "bolt" },
  { id: "docs", label: "Documentation", ic: "file" },
  { id: "contact", label: "Send feedback", ic: "spark" },
  { id: "about", label: "About", ic: "shield" },
];

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["1"], label: "Go to Dashboard" },
  { keys: ["2"], label: "Go to Event Logs" },
  { keys: ["3"], label: "Go to MFT / NTFS" },
  { keys: ["4"], label: "Go to Timeline" },
  { keys: ["5"], label: "Go to Correlation" },
  { keys: ["6"], label: "Go to AI Analyst" },
  { keys: ["7"], label: "Go to Reports" },
  { keys: ["8"], label: "Go to Settings" },
];

const DOCS: { title: string; description: string; href: string; ic: IconName }[] = [
  {
    title: "Getting started",
    description: "First case: import evidence, run a quick scan, open the timeline.",
    href: "https://docs.stormbreaker.dev/getting-started",
    ic: "play",
  },
  {
    title: "Kill-chain & MITRE mapping",
    description: "How Stormbreaker correlates events into ATT&CK phases.",
    href: "https://docs.stormbreaker.dev/kill-chain",
    ic: "chain",
  },
  {
    title: "IOC intake & enrichment",
    description: "Register domains, hashes and IPs; hunt across the case bundle.",
    href: "https://docs.stormbreaker.dev/iocs",
    ic: "key",
  },
  {
    title: "AI analyst (Ollama)",
    description: "Local LLM setup, approved models, prompt templates.",
    href: "https://docs.stormbreaker.dev/ai",
    ic: "brain",
  },
];

const feedbackSchema = z.object({
  topic: z.enum(["bug", "feature", "question", "other"]),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255)
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "Please describe it in at least 10 characters")
    .max(1000, "Keep it under 1000 characters"),
});

export function HelpDialog({ open, onOpenChange }: Props) {
  const [tab, setTab] = useState<Tab>("shortcuts");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-foreground/10 bg-transparent p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-foreground/10 px-6 pb-3 pt-5">
          <DialogTitle className="flex items-center gap-2">
            <Icon name="spark" size={16} /> Help & feedback
          </DialogTitle>
          <DialogDescription>
            Shortcuts, docs, ways to reach the team and version info.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
          {/* Tabs rail */}
          <nav
            className="flex gap-1 border-b border-foreground/10 px-3 py-3 sm:flex-col sm:border-b-0 sm:border-r sm:px-3 sm:py-4"
            aria-label="Help sections"
          >
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex h-10 items-center gap-2.5 rounded-lg px-3 text-sm transition ${
                    active
                      ? "bg-primary/12 text-primary ring-1 ring-primary/20"
                      : "text-foreground/75 hover:bg-foreground/6 hover:text-foreground"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon name={t.ic} size={16} />
                  <span className="flex-1 text-left">{t.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Panel */}
          <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
            {tab === "shortcuts" && <ShortcutsPanel />}
            {tab === "docs" && <DocsPanel />}
            {tab === "contact" && (
              <ContactPanel onSubmitted={() => onOpenChange(false)} />
            )}
            {tab === "about" && <AboutPanel />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutsPanel() {
  return (
    <div className="space-y-4">
      <SectionHead
        title="Keyboard shortcuts"
        hint="Available anywhere outside inputs and textareas."
      />
      <ul className="divide-y divide-foreground/8 rounded-xl border border-border bg-foreground/5">
        {SHORTCUTS.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm"
          >
            <span>{s.label}</span>
            <span className="flex items-center gap-1">
              {s.keys.map((k) => (
                <kbd
                  key={k}
                  className="mono grid h-6 min-w-6 place-items-center rounded-md border border-border bg-foreground/10 px-1.5 text-[11px]"
                >
                  {k}
                </kbd>
              ))}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground">
        Tip: numbers <span className="mono">1–8</span> jump between the main
        sections. Press <span className="mono">Esc</span> to close any dialog.
      </p>
    </div>
  );
}

function DocsPanel() {
  return (
    <div className="space-y-4">
      <SectionHead
        title="Documentation"
        hint="Public docs — opens in a new tab."
      />
      <div className="grid gap-2">
        {DOCS.map((d) => (
          <a
            key={d.href}
            href={d.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-3 rounded-xl border border-border bg-foreground/5 p-3 transition hover:border-primary/30 hover:bg-foreground/10"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
              <Icon name={d.ic} size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-1 text-sm font-medium">
                {d.title}
                <Icon
                  name="chevron"
                  size={12}
                  className="opacity-0 transition group-hover:opacity-70"
                />
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {d.description}
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function ContactPanel({ onSubmitted }: { onSubmitted: () => void }) {
  const [topic, setTopic] = useState<"bug" | "feature" | "question" | "other">(
    "bug",
  );
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ email?: string; message?: string }>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = feedbackSchema.safeParse({ topic, email, message });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const i of parsed.error.issues) {
        const k = i.path[0] as keyof typeof errors;
        if (k && !next[k]) next[k] = i.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    toast.success("Feedback sent", {
      description: "Thanks — the team will get back to you shortly.",
    });
    setMessage("");
    onSubmitted();
  }

  return (
    <div className="space-y-4">
      <SectionHead
        title="Send feedback"
        hint="Bug reports, feature requests or questions."
      />
      <form onSubmit={submit} className="space-y-3" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Topic
            </Label>
            <Select value={topic} onValueChange={(v) => setTopic(v as typeof topic)}>
              <SelectTrigger className="border-border bg-foreground/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-panel border-foreground/10 bg-transparent">
                <SelectItem value="bug">Bug report</SelectItem>
                <SelectItem value="feature">Feature request</SelectItem>
                <SelectItem value="question">Question</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Reply-to email (optional)
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              placeholder="you@company.com"
              className="mono border-border bg-foreground/5"
            />
            {errors.email && (
              <p className="text-[11px] text-sev-critical">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Message
            </Label>
            <span className="mono text-[10px] text-muted-foreground">
              {message.length}/1000
            </span>
          </div>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="Describe what you saw, what you expected, and steps to reproduce."
            className="border-border bg-foreground/5"
          />
          {errors.message && (
            <p className="text-[11px] text-sev-critical">{errors.message}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-foreground/5 p-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <Icon name="alert" size={14} className="text-sev-warning" />
            Do not paste evidence, credentials or client PII in this form.
          </span>
          <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
            <Icon name="upload" size={14} className="mr-1.5" /> Send
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-border bg-foreground/5 p-4 text-xs">
        <p className="font-medium">Other channels</p>
        <ul className="mt-2 space-y-1.5 text-muted-foreground">
          <li className="flex items-center gap-2">
            <Icon name="brain" size={14} />
            <a
              href="mailto:support@stormbreaker.dev"
              className="mono text-foreground hover:text-primary"
            >
              support@stormbreaker.dev
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Icon name="network" size={14} />
            <a
              href="https://status.stormbreaker.dev"
              target="_blank"
              rel="noreferrer"
              className="mono text-foreground hover:text-primary"
            >
              status.stormbreaker.dev
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

function AboutPanel() {
  const build = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-4">
      <SectionHead title="About Stormbreaker" hint="Runtime and build info." />
      <div className="grid gap-2 text-xs sm:grid-cols-2">
        <Row k="Product" v="Stormbreaker DFIR Console" />
        <Row k="Version" v="0.9.0-preview" />
        <Row k="Build" v={build} />
        <Row k="Runtime" v="Web · Chromium" />
        <Row k="License" v="Commercial · single-tenant" />
        <Row k="Data plane" v="Local-first, no telemetry" />
      </div>
      <div className="rounded-xl border border-border bg-foreground/5 p-4 text-xs text-muted-foreground">
        Made for incident responders who need a fast, keyboard-driven triage
        surface. Reports, IOCs and case bundles never leave the analyst's host
        unless explicitly exported.
      </div>
    </div>
  );
}

function SectionHead({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between rounded-lg border border-border bg-foreground/5 p-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="mono">{v}</span>
    </div>
  );
}
