import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { mdToHtml } from "@/lib/markdown";
import {
  buildDfirMessages,
  demoAnalysis,
  deriveNotifications,
  ollamaChat,
  ollamaReachable,
  streamDemo,
} from "@/lib/ollama";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/_app/ai")({
  head: () => ({
    meta: [
      { title: "AI Analyst — Stormbreaker DFIR" },
      { name: "description", content: "Local LLM triage via Ollama with streaming markdown and demo fallback." },
    ],
  }),
  component: AiView,
});

function AiView() {
  const { settings, setSettings, aiText, setAiText, aiBusy, setAiBusy, bumpReports } =
    useAppStore();
  const [q, setQ] = useState("");
  const [source, setSource] = useState<"ollama" | "demo" | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function run() {
    if (aiBusy) return;
    setAiBusy(true);
    setAiText("");
    setSource(null);
    const ac = new AbortController();
    abortRef.current = ac;

    const reach = await ollamaReachable(settings.endpoint, 2000);
    setSettings({ connected: reach.ok, models: reach.models });

    if (reach.ok) {
      try {
        setSource("ollama");
        await ollamaChat({
          endpoint: settings.endpoint,
          model: settings.model,
          messages: buildDfirMessages(q),
          onToken: (t) =>
            useAppStore.setState((s) => ({ aiText: s.aiText + t })),
          signal: ac.signal,
        });
        bumpReports();
        toast.success("Analysis complete", {
          description: `Model: ${settings.model}`,
        });
      } catch (err) {
        console.warn("Ollama failed, falling back to demo", err);
        setSource("demo");
        setAiText("");
        await streamDemo(
          demoAnalysis(q),
          (t) => useAppStore.setState((s) => ({ aiText: s.aiText + t })),
          ac.signal,
        );
        bumpReports();
      }
    } else {
      setSource("demo");
      await streamDemo(
        demoAnalysis(q),
        (t) => useAppStore.setState((s) => ({ aiText: s.aiText + t })),
        ac.signal,
      );
      bumpReports();
      toast("Using demo analysis", {
        description: "Ollama unreachable. Configure endpoint in Settings.",
      });
    }
    setAiBusy(false);
    abortRef.current = null;
    // Push AI-derived notifications to the bell
    const finalText = useAppStore.getState().aiText;
    const notes = deriveNotifications(finalText);
    const push = useAppStore.getState().pushNotification;
    for (const n of notes) push({ ...n, source: "AI Analyst" });
  }

  function stop() {
    abortRef.current?.abort();
    setAiBusy(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
        <div className="flex items-center gap-2">
          <Icon name="brain" size={16} className="text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            AI Analyst
          </h2>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Local LLM via Ollama. Falls back to a canned senior-analyst response
          when the endpoint is unreachable.
        </p>

        <div className="mt-4 space-y-2">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">
            Question (optional)
          </label>
          <Textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Explain the persistence mechanism and how to remove it."
            className="min-h-24 border-border bg-foreground/8"
          />
          <div className="flex gap-2">
            <Button
              onClick={run}
              disabled={aiBusy}
              className="flex-1 bg-primary text-primary-foreground"
            >
              {aiBusy ? (
                <>
                  <Icon name="refresh" size={14} className="mr-1.5 animate-spin" />
                  Analysing…
                </>
              ) : (
                <>
                  <Icon name="play" size={14} className="mr-1.5" /> Run analysis
                </>
              )}
            </Button>
            {aiBusy && (
              <Button variant="secondary" onClick={stop}>
                <Icon name="x" size={14} className="mr-1.5" /> Stop
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Endpoint</span>
            <span className="mono">{settings.endpoint}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Model</span>
            <span className="mono">{settings.model}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status</span>
            {source === "ollama" && (
              <span className="inline-flex items-center gap-1 text-sev-success">
                <span className="h-1.5 w-1.5 rounded-full bg-sev-success" />
                Ollama · streaming
              </span>
            )}
            {source === "demo" && (
              <span className="inline-flex items-center gap-1 text-sev-warning">
                <span className="h-1.5 w-1.5 rounded-full bg-sev-warning" />
                Demo fallback
              </span>
            )}
            {!source && (
              <span className="text-muted-foreground">Idle</span>
            )}
          </div>
        </div>
      </Card>

      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Analysis
          </h2>
          {aiText && (
            <Button
              size="sm"
              variant="secondary"
              className="bg-foreground/8"
              onClick={() => {
                navigator.clipboard.writeText(aiText);
                toast.success("Copied to clipboard");
              }}
            >
              <Icon name="copy" size={12} className="mr-1.5" /> Copy
            </Button>
          )}
        </div>
        <div className="mt-3 min-h-[300px]">
          {aiText ? (
            <div
              className="prose max-w-none text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: mdToHtml(aiText) }}
            />
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
              <div className="grid h-14 w-14 place-items-center rounded-2xl border border-foreground/10 bg-foreground/5 text-foreground/40">
                <Icon name="brain" size={26} />
              </div>
              <div className="max-w-xs">
                <p className="text-xs uppercase tracking-widest text-muted-foreground/70">
                  Idle
                </p>
                <p className="mt-1 text-sm text-foreground/70">
                  Press <span className="mono">Run analysis</span> to synthesize a
                  triage report from the current evidence dossier.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
