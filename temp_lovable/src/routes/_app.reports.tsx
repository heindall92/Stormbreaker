import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CASE, CHAIN, EVENTS, IOCS } from "@/lib/case-data";
import { mdToHtml } from "@/lib/markdown";
import {
  buildDfirMessages,
  demoAnalysis,
  ollamaChat,
  ollamaReachable,
  streamDemo,
} from "@/lib/ollama";
import { buildReportPdf } from "@/lib/pdf-report";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Stormbreaker DFIR" },
      { name: "description", content: "Export markdown reports, IOC feeds and technique lists." },
    ],
  }),
  component: ReportsView,
});

// Approx target token count for the report — drives the progress bar.
const TARGET_TOKENS = 900;

function reportMarkdown(): string {
  const techniques = Array.from(new Set(EVENTS.flatMap((e) => e.mitre))).sort();
  const lines: string[] = [];
  lines.push(`# Muninn DFIR Report — ${CASE.id}`);
  lines.push("");
  lines.push(`**Host:** ${CASE.host}`);
  lines.push(`**OS:** ${CASE.os}`);
  lines.push(`**Analyst:** ${CASE.analyst}`);
  lines.push(`**Acquired:** ${CASE.acquired}`);
  lines.push(`**Tool:** ${CASE.tool}`);
  lines.push("");
  lines.push("## Executive summary");
  lines.push(
    "Confirmed intrusion via malicious USB, obfuscated PowerShell C2, dual persistence, defense evasion (timestomp + event-log wipe), destructive impact on file share, and SMB lateral movement.",
  );
  lines.push("");
  lines.push("## Kill chain");
  for (const c of CHAIN) {
    lines.push(`- **${c.t} · ${c.phase}** — ${c.title} _(${c.mitre.join(", ")})_`);
  }
  lines.push("");
  lines.push("## MITRE ATT&CK techniques");
  lines.push(techniques.map((t) => `- ${t}`).join("\n"));
  lines.push("");
  lines.push("## Indicators of Compromise");
  for (const i of IOCS) {
    lines.push(`- (${i.type}, ${i.conf}) \`${i.val}\` — ${i.ctx}`);
  }
  lines.push("");
  lines.push("## Recommended actions");
  lines.push(
    "1. Isolate the host and the impacted file server.\n2. Remove persistence artefacts and block C2 infrastructure.\n3. Restore data from offline backup (shadow copies destroyed).\n4. Rotate credentials for the affected user and hunt for reuse.",
  );
  return lines.join("\n");
}

function download(name: string, mime: string, content: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function ReportsView() {
  const staticMd = useMemo(reportMarkdown, []);
  const reports = useAppStore((s) => s.reports);
  const bumpReports = useAppStore((s) => s.bumpReports);
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);

  const [tab, setTab] = useState<"preview" | "raw">("preview");
  const [genMd, setGenMd] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [tokens, setTokens] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [source, setSource] = useState<"ollama" | "demo" | null>(null);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startRef = useRef<number>(0);

  // Live elapsed timer while streaming.
  useEffect(() => {
    if (!busy) return;
    const iv = setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000);
    }, 100);
    return () => clearInterval(iv);
  }, [busy]);

  const md = genMd || staticMd;
  const progress = busy
    ? Math.min(0.99, tokens / TARGET_TOKENS)
    : genMd
      ? 1
      : 0;
  const tps = elapsed > 0 ? tokens / elapsed : 0;

  async function generate() {
    if (busy) return;
    setBusy(true);
    setGenMd("");
    setTokens(0);
    setElapsed(0);
    setStoppedAt(null);
    setSource(null);
    startRef.current = Date.now();
    const ac = new AbortController();
    abortRef.current = ac;

    const reach = await ollamaReachable(settings.endpoint, 2000);
    setSettings({ connected: reach.ok, models: reach.models });

    const onToken = (t: string) => {
      setGenMd((prev) => prev + t);
      setTokens((n) => n + 1);
    };

    try {
      if (reach.ok) {
        setSource("ollama");
        await ollamaChat({
          endpoint: settings.endpoint,
          model: settings.model,
          messages: buildDfirMessages(
            "Generate the final incident report in the exact OUTPUT FORMAT specified.",
          ),
          onToken,
          signal: ac.signal,
        });
      } else {
        setSource("demo");
        toast("Using demo report", {
          description: "Ollama unreachable. Configure endpoint in Settings.",
        });
        await streamDemo(demoAnalysis(""), onToken, ac.signal);
      }
      if (!ac.signal.aborted) {
        bumpReports();
        toast.success("Report generated", {
          description: `${tokens} tokens · ${elapsed.toFixed(1)}s`,
        });
      }
    } catch (err) {
      if (ac.signal.aborted) {
        // user cancelled — keep partial output
      } else {
        console.warn("Report generation failed, falling back to demo", err);
        setSource("demo");
        try {
          await streamDemo(demoAnalysis(""), onToken, ac.signal);
          if (!ac.signal.aborted) bumpReports();
        } catch {
          /* ignore */
        }
      }
    } finally {
      setElapsed((Date.now() - startRef.current) / 1000);
      setBusy(false);
      abortRef.current = null;
    }
  }

  function stop() {
    if (!abortRef.current) return;
    abortRef.current.abort();
    abortRef.current = null;
    setStoppedAt(tokens);
    setBusy(false);
    toast("Generation cancelled", {
      description: `Stopped at ${tokens} tokens.`,
    });
  }

  function reset() {
    setGenMd("");
    setTokens(0);
    setElapsed(0);
    setSource(null);
    setStoppedAt(null);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
        <div className="flex items-center gap-2">
          <Icon name="brain" size={16} className="text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Generate with AI
          </h2>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Streams the final report from the local LLM. Cancel any time — partial
          output is preserved and exportable.
        </p>

        <div className="mt-4 flex gap-2">
          {!busy ? (
            <Button
              onClick={generate}
              className="flex-1 bg-primary text-primary-foreground"
            >
              <Icon name="play" size={14} className="mr-1.5" />
              {genMd ? "Regenerate" : "Generate report"}
            </Button>
          ) : (
            <Button
              onClick={stop}
              variant="secondary"
              className="flex-1 bg-sev-critical/20 text-sev-critical hover:bg-sev-critical/30"
            >
              <Icon name="x" size={14} className="mr-1.5" /> Cancel
            </Button>
          )}
          {genMd && !busy && (
            <Button variant="secondary" onClick={reset} className="bg-foreground/8">
              <Icon name="refresh" size={14} />
            </Button>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {busy ? "Streaming…" : stoppedAt !== null ? "Cancelled" : genMd ? "Complete" : "Idle"}
            </span>
            <span className="mono text-muted-foreground">
              {Math.round(progress * 100)}%
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/10">
            <div
              className={`h-full rounded-full transition-[width] duration-200 ease-out ${
                stoppedAt !== null
                  ? "bg-sev-warning"
                  : progress >= 1
                    ? "bg-sev-success"
                    : "bg-primary"
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
          <div className="rounded-lg border border-border bg-foreground/6 p-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Tokens
            </div>
            <div className="mono mt-0.5 text-sm text-foreground">{tokens}</div>
          </div>
          <div className="rounded-lg border border-border bg-foreground/6 p-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Elapsed
            </div>
            <div className="mono mt-0.5 text-sm text-foreground">
              {elapsed.toFixed(1)}s
            </div>
          </div>
          <div className="rounded-lg border border-border bg-foreground/6 p-2">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              tok/s
            </div>
            <div className="mono mt-0.5 text-sm text-foreground">
              {tps.toFixed(1)}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Source</span>
            {source === "ollama" && (
              <span className="inline-flex items-center gap-1 text-sev-success">
                <span className="h-1.5 w-1.5 rounded-full bg-sev-success" />
                Ollama · {settings.model}
              </span>
            )}
            {source === "demo" && (
              <span className="inline-flex items-center gap-1 text-sev-warning">
                <span className="h-1.5 w-1.5 rounded-full bg-sev-warning" />
                Demo fallback
              </span>
            )}
            {!source && <span className="text-muted-foreground">—</span>}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Endpoint</span>
            <span className="mono">{settings.endpoint}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2">
          <Icon name="file" size={16} className="text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Exports
          </h2>
        </div>
        <div className="mt-3 space-y-2">
          <Button
            variant="secondary"
            className="w-full justify-start bg-foreground/8"
            disabled={busy}
            onClick={() => {
              download(`${CASE.id}-report.md`, "text/markdown", md);
              toast.success("Report exported");
            }}
          >
            <Icon name="download" size={14} className="mr-2" /> Report ( .md )
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start bg-foreground/8"
            disabled={busy}
            onClick={() => {
              try {
                const pdf = buildReportPdf({ aiNarrative: genMd || undefined });
                pdf.save(`${CASE.id}-report.pdf`);
                toast.success("PDF report exported", {
                  description: "Attack chain · MITRE mapping · Conclusions",
                });
              } catch (err) {
                console.error(err);
                toast.error("PDF export failed");
              }
            }}
          >
            <Icon name="download" size={14} className="mr-2" /> Report ( .pdf )
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start bg-foreground/8"
            onClick={() => {
              download(
                `${CASE.id}-iocs.json`,
                "application/json",
                JSON.stringify(IOCS, null, 2),
              );
              toast.success("IOC feed exported");
            }}
          >
            <Icon name="download" size={14} className="mr-2" /> IOCs ( .json )
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start bg-foreground/8"
            onClick={() => {
              const techs = Array.from(new Set(EVENTS.flatMap((e) => e.mitre)));
              download(
                `${CASE.id}-techniques.json`,
                "application/json",
                JSON.stringify(techs, null, 2),
              );
              toast.success("Techniques exported");
            }}
          >
            <Icon name="download" size={14} className="mr-2" /> Techniques ( .json )
          </Button>
        </div>
        <div className="mt-6 rounded-lg border border-border bg-foreground/6 p-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Session reports</span>
            <Badge className="bg-primary text-primary-foreground">{reports}</Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            Reports are generated in-session; export or copy before closing.
          </p>
        </div>
      </Card>

      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {genMd ? "Report preview · AI" : "Report preview · template"}
          </h2>
          <div className="flex items-center gap-3">
            {busy && (
              <span className="inline-flex items-center gap-1.5 text-xs text-primary">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                streaming
              </span>
            )}
            <div className="glass-pill flex rounded-full p-1 text-xs">
              <button
                onClick={() => setTab("preview")}
                className={`rounded-full px-3 py-1 ${tab === "preview" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Preview
              </button>
              <button
                onClick={() => setTab("raw")}
                className={`rounded-full px-3 py-1 ${tab === "raw" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
              >
                Raw
              </button>
            </div>
          </div>
        </div>
        <div className="mt-3">
          {tab === "preview" ? (
            <div
              className="prose max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: mdToHtml(md) }}
            />
          ) : (
            <pre className="mono max-h-[600px] overflow-auto rounded-lg border border-border bg-foreground/10 p-4 text-xs">
              {md}
            </pre>
          )}
        </div>
      </Card>
    </div>
  );
}
