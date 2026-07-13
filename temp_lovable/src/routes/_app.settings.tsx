import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useBlurPref } from "@/hooks/use-blur-pref";
import { useTheme } from "@/hooks/use-theme";
import { CASE } from "@/lib/case-data";
import { ollamaReachable } from "@/lib/ollama";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Stormbreaker DFIR" },
      { name: "description", content: "Configure Ollama endpoint, model and Muninn backend." },
    ],
  }),
  component: SettingsView,
});

function SettingsView() {
  const { settings, setSettings } = useAppStore();
  const { enabled: blurEnabled, set: setBlurEnabled } = useBlurPref();
  const { theme, toggle: toggleTheme } = useTheme();
  const [testing, setTesting] = useState(false);

  const modelOptions = useMemo(() => {
    // Merge allowed presets + models discovered from /api/tags
    const merged = new Set<string>([
      ...settings.allowedModels,
      ...settings.models,
    ]);
    if (settings.model) merged.add(settings.model);
    return Array.from(merged);
  }, [settings.allowedModels, settings.models, settings.model]);

  async function test() {
    setTesting(true);
    const r = await ollamaReachable(settings.endpoint, 3000);
    setSettings({ connected: r.ok, models: r.models });
    setTesting(false);
    if (r.ok) {
      toast.success("Ollama reachable", {
        description: `${r.models.length} model(s) available`,
      });
    } else {
      toast.error("Ollama unreachable", {
        description: `Run: OLLAMA_ORIGINS=* ollama serve`,
      });
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon name="brain" size={16} className="text-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              AI · Ollama
            </h2>
          </div>
          <a
            href="https://ollama.com"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] text-primary hover:underline"
          >
            ollama.com ↗
          </a>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Endpoint
            </Label>
            <Input
              value={settings.endpoint}
              onChange={(e) => setSettings({ endpoint: e.target.value })}
              className="mt-1 border-border bg-foreground/5 mono"
              placeholder="http://localhost:11434"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              Model (allowed for analysis)
            </Label>
            <Select
              value={settings.model}
              onValueChange={(v) => setSettings({ model: v })}
            >
              <SelectTrigger className="mt-1 border-border bg-foreground/5 mono">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-foreground/10">
                {modelOptions.map((m) => (
                  <SelectItem key={m} value={m} className="mono text-xs">
                    {m}
                    {settings.models.includes(m) && (
                      <span className="ml-2 text-[10px] text-sev-success">
                        · installed
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Allowed presets are curated for DFIR triage. After a successful
              connection test, locally installed models are added automatically.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={test}
              disabled={testing}
              className="bg-primary text-primary-foreground"
            >
              {testing ? (
                <>
                  <Icon name="refresh" size={14} className="mr-1.5 animate-spin" />
                  Testing…
                </>
              ) : (
                <>
                  <Icon name="network" size={14} className="mr-1.5" /> Test connection
                </>
              )}
            </Button>
            {settings.connected ? (
              <Badge className="bg-sev-success/20 text-sev-success">Connected</Badge>
            ) : (
              <Badge variant="outline" className="border-border text-muted-foreground">
                Not connected
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            To allow the browser to reach Ollama, start the daemon with:{" "}
            <code className="mono rounded bg-foreground/8 px-1">
              OLLAMA_ORIGINS=* ollama serve
            </code>
          </p>
        </div>
      </Card>

      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
        <div className="flex items-center gap-2">
          <Icon name="network" size={16} className="text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Muninn backend
          </h2>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              FastAPI base URL
            </Label>
            <Input
              value={settings.backend}
              onChange={(e) => setSettings({ backend: e.target.value })}
              className="mt-1 border-border bg-foreground/8 mono"
              placeholder="https://muninn.corp.local (leave empty to use bundled sample case)"
            />
          </div>
          <div>
            <Label className="text-xs uppercase tracking-widest text-muted-foreground">
              JWT bearer (RS256)
            </Label>
            <Input
              type="password"
              value={settings.bearer}
              onChange={(e) => setSettings({ bearer: e.target.value })}
              className="mt-1 border-border bg-foreground/8 mono"
              placeholder="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9…"
              autoComplete="off"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            When both fields are set, the console reads cases from{" "}
            <code className="mono">/cases/&#123;id&#125;/...</code> with{" "}
            <code className="mono">Authorization: Bearer &lt;token&gt;</code>.
            Empty backend → the bundled sample case is used as fallback.
          </p>
        </div>
      </Card>

      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5 lg:col-span-2">
        <div className="flex items-center gap-2">
          <Icon name="spark" size={16} className="text-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Appearance
          </h2>
        </div>
        <div className="mt-4 space-y-3">
          {/* Theme */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-foreground/5 p-4">
            <div className="min-w-0">
              <Label htmlFor="theme-toggle" className="text-sm font-medium">
                Theme
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Switch between the dark cinematic view and a light frosted
                surface. Also available from the header sun/moon button and the
                user menu.{" "}
                <span className="mono">
                  Currently: {theme === "dark" ? "dark" : "light"}
                </span>
                .
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                name="moon"
                size={14}
                className={theme === "dark" ? "text-primary" : "text-muted-foreground"}
              />
              <Switch
                id="theme-toggle"
                checked={theme === "light"}
                onCheckedChange={(v) => {
                  const next = v ? "light" : "dark";
                  if ((v && theme === "dark") || (!v && theme === "light")) {
                    toggleTheme();
                  }
                  toast.success(`${next === "light" ? "Light" : "Dark"} mode`, {
                    description:
                      next === "light"
                        ? "Bright frosted glass with dark text."
                        : "Cinematic dark palette restored.",
                  });
                }}
              />
              <Icon
                name="sun"
                size={14}
                className={theme === "light" ? "text-primary" : "text-muted-foreground"}
              />
            </div>
          </div>

          {/* Glass blur */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-foreground/5 p-4">
            <div className="min-w-0">
              <Label htmlFor="blur-toggle" className="text-sm font-medium">
                Glass blur (backdrop-filter)
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Disable to remove the frosted blur — recommended on low-power
                laptops, tablets and phones. Applied instantly across the whole
                app.{" "}
                <span className="mono">
                  Currently: {blurEnabled ? "on" : "off"}
                </span>
                .
              </p>
            </div>
            <Switch
              id="blur-toggle"
              checked={blurEnabled}
              onCheckedChange={(v) => {
                setBlurEnabled(v);
                toast.success(v ? "Blur enabled" : "Blur disabled", {
                  description: v
                    ? "Frosted glass restored."
                    : "Solid tint used instead — better performance.",
                });
              }}
            />
          </div>
        </div>
      </Card>


      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5 lg:col-span-2">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          System
        </h2>
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <Row k="Case" v={CASE.id} />
          <Row k="Host" v={CASE.host} />
          <Row k="OS" v={CASE.os} />
          <Row k="Analyst" v={CASE.analyst} />
          <Row k="Acquired" v={CASE.acquired} />
          <Row k="Tool" v={CASE.tool} />
        </div>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between rounded-lg border border-border bg-foreground/6 p-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="mono">{v}</span>
    </div>
  );
}
