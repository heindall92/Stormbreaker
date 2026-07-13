import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ACTIVITY, CHAIN, EVENTS, IOCS, KPIS, SEVERITY } from "@/lib/case-data";
import { useAppStore } from "@/lib/store";
import type { ChainColor, Severity } from "@/lib/types";

import { cn } from "@/lib/utils";

const PHASE_TONE: Record<ChainColor, string> = {
  red: "bg-sev-critical/20 text-sev-critical",
  orange: "bg-sev-warning/20 text-sev-warning",
  purple: "bg-purple-500/20 text-purple-300",
  blue: "bg-sev-info/20 text-sev-info",
  green: "bg-sev-success/20 text-sev-success",
};

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Stormbreaker DFIR" },
      {
        name: "description",
        content:
          "Case overview: severity mix, kill chain, IOCs and live analyst activity.",
      },
    ],
  }),
  component: Dashboard,
});

const SEV_COLOR: Record<Severity, string> = {
  critical: "bg-sev-critical",
  warning: "bg-sev-warning",
  info: "bg-sev-info",
  success: "bg-sev-success",
};

function Dashboard() {
  // Numbers come from the canonical KPIS/SEVERITY exports in case-data.ts
  // (derived at module load from EVENTS/IOCS). Keeping them referenced here
  // is what guarantees dashboard, event logs, correlation and reports never
  // drift from each other.
  void EVENTS;
  const selectEvidence = useAppStore((s) => s.selectEvidence);


  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Events" value={KPIS.events.toString()} sub="ingested" ic="activity" />
        <Stat
          label="Critical"
          value={SEVERITY.critical.toString()}
          sub="require action"
          ic="alert"
          tone="critical"
        />
        <Stat label="Techniques" value={KPIS.techniques.toString()} sub="MITRE ATT&CK" ic="network" />
        <Stat label="IOCs" value={KPIS.iocs.toString()} sub="extracted" ic="key" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="glass-panel col-span-2 rounded-2xl border-foreground/10 bg-transparent p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Kill chain
            </h2>
            <span className="mono text-xs text-muted-foreground">
              {CHAIN.length} phases
            </span>
          </div>
          <ol className="mt-4 space-y-3">
            {CHAIN.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-xl border border-white/10 bg-foreground/[0.04] p-3 backdrop-blur-md"
              >
                <div className={`grid h-9 w-9 place-items-center rounded-full ${PHASE_TONE[c.color]}`}>
                  <Icon name={c.ic} size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      {c.phase}
                    </span>
                    <span className="mono text-xs text-muted-foreground">
                      {c.t}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.meta}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.mitre.map((m) => (
                      <Badge
                        key={m}
                        variant="outline"
                        className="border-primary/40 text-primary"
                      >
                        {m}
                      </Badge>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Card>

        <div className="grid gap-4">
          <SeverityCard counts={SEVERITY} total={KPIS.events} />


          <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Activity
            </h2>
            <ul className="mt-3 space-y-2 text-xs">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${SEV_COLOR[a.kind]}`} />
                  <div className="flex-1">
                    <span className="mono text-muted-foreground">{a.t}</span>{" "}
                    <span>{a.msg}</span>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Top IOCs
          </h2>
          <span className="mono text-xs text-muted-foreground">
            {IOCS.length} extracted
          </span>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {IOCS.map((i) => (
            <button
              key={i.val}
              type="button"
              onClick={() => selectEvidence({ kind: "ioc", val: i.val })}
              className="flex w-full items-start gap-3 rounded-lg border border-white/10 bg-foreground/[0.04] p-3 text-left backdrop-blur-md transition hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              title="Show related evidence"
            >
              <Badge variant="outline" className="mono uppercase">
                {i.type}
              </Badge>
              <div className="min-w-0 flex-1">
                <p className="mono truncate text-xs">{i.val}</p>
                <p className="text-xs text-muted-foreground">{i.ctx}</p>
              </div>
              <ConfDot conf={i.conf} />
            </button>
          ))}
        </div>

      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  ic,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  ic: string;
  tone?: "critical";
}) {
  const isCritical = tone === "critical";
  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl bg-transparent p-5",
        isCritical
          ? "glass-panel border-sev-critical/30 shadow-[0_0_28px_-10px_var(--color-sev-critical)]"
          : "glass-panel border-foreground/10",
      )}
    >
      {isCritical && (
        <span className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sev-critical/70 to-transparent" />
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <span
          className={cn(
            "grid h-8 w-8 place-items-center rounded-full",
            isCritical
              ? "bg-sev-critical/15 text-sev-critical shadow-[0_0_14px_-4px_var(--color-sev-critical)]"
              : "bg-foreground/5 text-foreground/55",
          )}
        >
          <Icon name={ic} size={14} />
        </span>
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </Card>
  );
}

function ConfDot({ conf }: { conf: "high" | "medium" | "low" }) {
  const map = {
    high: "bg-sev-critical",
    medium: "bg-sev-warning",
    low: "bg-sev-info",
  } as const;
  return (
    <span
      title={`confidence: ${conf}`}
      className={`mt-1 h-2 w-2 shrink-0 rounded-full ${map[conf]}`}
    />
  );
}

/* ---------------- Severity card ---------------- */

const SEV_STROKE: Record<Severity, string> = {
  critical: "var(--color-sev-critical)",
  warning: "var(--color-sev-warning)",
  info: "var(--color-sev-info)",
  success: "var(--color-sev-success)",
};

const SEV_LABEL: Record<Severity, string> = {
  critical: "Critical",
  warning: "Warning",
  info: "Info",
  success: "Success",
};

const SEV_BADGE_CLASS: Record<Severity, string> = {
  critical: "border-sev-critical/40 text-sev-critical",
  warning: "border-sev-warning/40 text-sev-warning",
  info: "border-sev-info/40 text-sev-info",
  success: "border-sev-success/40 text-sev-success",
};

// easeOutCubic
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function useIngestProgress(deps: unknown[] = [], durationMs = 1500) {
  // Start at 1 so SSR and the very first client paint show the final values.
  // Only animate on subsequent dep changes (e.g. a new case is loaded).
  const [p, setP] = useState(1);
  const raf = useRef<number | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setP(ease(t));
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    setP(0);
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return p;
}

function SeverityCard({
  counts,
  total,
}: {
  counts: Record<Severity, number>;
  total: number;
}) {
  const progress = useIngestProgress([total]);
  const loading = progress < 0.999;
  const order: Severity[] = ["critical", "warning", "info", "success"];

  // Donut geometry — larger to fill the card
  const size = 180;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  // Build cumulative arcs
  let acc = 0;
  const arcs = order.map((k) => {
    const share = total > 0 ? counts[k] / total : 0;
    const start = acc;
    acc += share;
    return {
      k,
      share,
      offsetIndex: start,
      length: share * c * progress,
      gapBefore: start * c,
    };
  });

  const dominant: Severity | null = useMemo(() => {
    if (total === 0) return null;
    return order.reduce((a, b) => (counts[a] >= counts[b] ? a : b));
  }, [counts, total]);

  return (
    <Card className="glass-panel relative flex flex-col overflow-hidden rounded-2xl border-foreground/10 bg-transparent p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Severity
        </h2>
        <span className="mono flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              loading ? "bg-sev-warning animate-pulse" : "bg-sev-success"
            }`}
          />
          {loading ? `Analyzing ${Math.round(progress * 100)}%` : "Ingest complete"}
        </span>
      </div>

      <div className="mt-5 flex flex-1 items-center gap-5">
        {/* Animated donut */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90"
            aria-hidden
          >
            {/* Track */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="oklch(1 0 0 / 0.08)"
              strokeWidth={stroke}
            />
            {arcs.map((a) => (
              <circle
                key={a.k}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={SEV_STROKE[a.k]}
                strokeWidth={stroke}
                strokeLinecap="butt"
                strokeDasharray={`${a.length} ${c}`}
                strokeDashoffset={-a.gapBefore}
                style={{
                  filter: `drop-shadow(0 0 8px color-mix(in oklch, ${SEV_STROKE[a.k]} 60%, transparent))`,
                  transition: "stroke-dashoffset 120ms linear",
                }}
              />
            ))}
          </svg>
          {/* Center */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="text-center leading-tight">
              <div
                className="text-3xl font-semibold tabular-nums"
                aria-live="polite"
              >
                {Math.round(total * progress)}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                events
              </div>
            </div>
          </div>
          {/* Scan sweep while loading */}
          {loading && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, oklch(1 0 0 / 0.18) 40deg, transparent 80deg)",
                animation: "sev-sweep 1.2s linear infinite",
                mask: `radial-gradient(circle, transparent ${r - stroke / 2}px, black ${r - stroke / 2 + 1}px, black ${r + stroke / 2}px, transparent ${r + stroke / 2 + 1}px)`,
                WebkitMask: `radial-gradient(circle, transparent ${r - stroke / 2}px, black ${r - stroke / 2 + 1}px, black ${r + stroke / 2}px, transparent ${r + stroke / 2 + 1}px)`,
              }}
            />
          )}
        </div>

        {/* Animated bars + legend */}
        <ul className="min-w-0 flex-1 space-y-3">
          {order.map((k, i) => {
            const share = total > 0 ? counts[k] / total : 0;
            const barW = Math.max(0.02, share) * progress;
            const shown = Math.round(counts[k] * progress);
            const delay = i * 90;
            return (
              <li key={k} className="text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${SEV_COLOR[k]}`}
                      style={{
                        boxShadow: `0 0 10px color-mix(in oklch, ${SEV_STROKE[k]} 65%, transparent)`,
                      }}
                    />
                    <span className="text-foreground/85">{SEV_LABEL[k]}</span>
                  </span>
                  <span className="mono tabular-nums text-muted-foreground">
                    {shown}
                    <span className="ml-1 text-[10px] opacity-70">
                      · {Math.round(share * 100)}%
                    </span>
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-foreground/8"
                  role="progressbar"
                  aria-valuenow={Math.round(share * 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${SEV_LABEL[k]} share`}
                >
                  <span
                    className={`block h-full rounded-full ${SEV_COLOR[k]}`}
                    style={{
                      width: `${barW * 100}%`,
                      transition: `width 260ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
                      boxShadow: `0 0 12px color-mix(in oklch, ${SEV_STROKE[k]} 55%, transparent)`,
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Severity summary pills */}
      <div className="mt-5 grid grid-cols-4 gap-2">
        {order.map((k) => {
          const share = total > 0 ? counts[k] / total : 0;
          return (
            <div
              key={k}
              className="flex flex-col items-center rounded-xl border border-white/10 bg-foreground/[0.04] p-2 backdrop-blur-md"
            >
              <span className={`h-2 w-2 rounded-full ${SEV_COLOR[k]}`} />
              <span className="mono mt-1 text-sm font-semibold tabular-nums">
                {Math.round(share * 100)}%
              </span>
              <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                {SEV_LABEL[k].slice(0, 3)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom scan bar */}
      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-foreground/8">
        <span
          className="block h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40"
          style={{
            width: `${progress * 100}%`,
            transition: "width 120ms linear",
          }}
        />
      </div>

      {dominant && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-foreground/[0.04] px-3 py-2 backdrop-blur-md">
          <span className="text-xs text-muted-foreground">Dominant severity</span>
          <Badge
            variant="outline"
            className={SEV_BADGE_CLASS[dominant]}
          >
            {SEV_LABEL[dominant]}
          </Badge>
        </div>
      )}

      <style>{`
        @keyframes sev-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  );
}

