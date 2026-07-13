import { Link, createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ATTACK, CHAIN, EVENTS, IOCS } from "@/lib/case-data";
import {
  computeIntegrity,
  overallStatus,
  type IntegrityStatus,
  type SourceIntegrity,
} from "@/lib/integrity";
import { useAppStore } from "@/lib/store";
import type { ChainColor } from "@/lib/types";



export const Route = createFileRoute("/_app/correlation")({
  head: () => ({
    meta: [
      { title: "Correlation — Stormbreaker DFIR" },
      { name: "description", content: "Kill chain correlation with MITRE ATT&CK mapping across evidence sources." },
    ],
  }),
  component: CorrelationView,
});

const PHASE_COLOR: Record<ChainColor, { ring: string; bg: string; text: string }> = {
  red: { ring: "ring-sev-critical/50", bg: "bg-sev-critical/20", text: "text-sev-critical" },
  orange: { ring: "ring-sev-warning/50", bg: "bg-sev-warning/20", text: "text-sev-warning" },
  purple: { ring: "ring-purple-500/50", bg: "bg-purple-500/20", text: "text-purple-300" },
  blue: { ring: "ring-sev-info/50", bg: "bg-sev-info/20", text: "text-sev-info" },
  green: { ring: "ring-sev-success/50", bg: "bg-sev-success/20", text: "text-sev-success" },
};

const STATUS_STYLE: Record<
  IntegrityStatus,
  { chip: string; dot: string; label: string; icon: string }
> = {
  ok: {
    chip: "border-sev-success/40 bg-sev-success/10 text-sev-success",
    dot: "bg-sev-success",
    label: "OK",
    icon: "check",
  },
  warning: {
    chip: "border-sev-warning/40 bg-sev-warning/10 text-sev-warning",
    dot: "bg-sev-warning",
    label: "Warning",
    icon: "alert",
  },
  error: {
    chip: "border-sev-critical/40 bg-sev-critical/10 text-sev-critical",
    dot: "bg-sev-critical",
    label: "Error",
    icon: "alert",
  },
};

function CorrelationView() {
  const techniques = Array.from(new Set(CHAIN.flatMap((c) => c.mitre)));
  const [openTech, setOpenTech] = useState<string | null>(null);
  const [sources, setSources] = useState<SourceIntegrity[] | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifiedAt, setVerifiedAt] = useState<string | null>(null);
  const [correlated, setCorrelated] = useState(false);
  const { hash } = useLocation();
  const selectEvidence = useAppStore((s) => s.selectEvidence);


  const runVerification = async () => {
    setVerifying(true);
    setCorrelated(false);
    // Small delay so the progress state is visible on fast machines
    await new Promise((r) => setTimeout(r, 350));
    const out = await computeIntegrity();
    setSources(out);
    setVerifiedAt(new Date().toISOString().replace("T", " ").slice(0, 19));
    setVerifying(false);
  };

  useEffect(() => {
    void runVerification();
  }, []);


  useEffect(() => {
    if (!hash) return;
    const id = requestAnimationFrame(() => {
      const el = document.getElementById(hash.replace(/^#/, ""));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary/60");
        setTimeout(
          () => el.classList.remove("ring-2", "ring-primary/60"),
          2000,
        );
      }
    });
    return () => cancelAnimationFrame(id);
  }, [hash]);

  const supportingEvents = openTech
    ? EVENTS.map((e, i) => ({ e, i })).filter(({ e }) => e.mitre.includes(openTech))
    : [];
  const supportingIocs = openTech
    ? IOCS.filter((io) => io.mitre?.includes(openTech))
    : [];
  const supportingChain = openTech
    ? CHAIN.map((c, i) => ({ c, i })).filter(({ c }) => c.mitre.includes(openTech))
    : [];

  const overall = sources ? overallStatus(sources) : "ok";
  const overallSt = STATUS_STYLE[overall];
  const canCorrelate = !!sources && !verifying;

  return (
    <div className="space-y-4">
      {/* Integrity verification — must run before correlation */}
      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              <Icon name="shield" size={14} />
              Case integrity verification
            </h2>
            <p className="text-xs text-muted-foreground">
              SHA-256 per source · hash-chained custody ledger · must pass before correlation runs
            </p>
          </div>
          <div className="flex items-center gap-2">
            {sources && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest ${overallSt.chip}`}
              >
                <Icon name={overallSt.icon} size={12} />
                {overallSt.label}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => void runVerification()}
              disabled={verifying}
              className="gap-1.5"
            >
              <Icon
                name="refresh"
                size={12}
                className={verifying ? "animate-spin" : ""}
              />
              {verifying ? "Verifying…" : "Re-verify"}
            </Button>
          </div>
        </div>

        {verifiedAt && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Last verified <span className="mono">{verifiedAt} UTC</span> ·{" "}
            {sources?.length ?? 0} sources · hash-chain head{" "}
            <span className="mono text-foreground/80">
              {sources?.[sources.length - 1]?.chainedShort ?? "—"}
            </span>
          </p>
        )}

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {(sources ?? []).map((s, i) => {
            const st = STATUS_STYLE[s.status];
            return (
              <div
                key={s.key}
                className="flex items-start gap-3 rounded-lg border border-foreground/15 bg-foreground/5 p-3"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-foreground/15 bg-foreground/10 text-foreground/80">
                  <Icon name={s.icon} size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{s.label}</span>
                    <span
                      className={`ml-auto inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-widest ${st.chip}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {s.artifacts} artifacts · {(s.bytes / 1024).toFixed(1)} KB
                  </div>
                  <div className="mt-1 grid gap-0.5 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">sha256</span>
                      <span className="mono truncate text-foreground/85">
                        {s.sha256Short}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">
                        {i === 0 ? "chain₀" : `chain${i}`}
                      </span>
                      <span className="mono truncate text-primary/90">
                        {s.chainedShort}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-foreground/70">{s.note}</p>
                </div>
              </div>
            );
          })}
          {!sources &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border border-foreground/10 bg-foreground/5"
              />
            ))}
        </div>

        {sources && overall === "warning" && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-sev-warning/40 bg-sev-warning/10 p-2 text-[11px] text-sev-warning">
            <Icon name="alert" size={12} className="mt-0.5 shrink-0" />
            <span>
              One or more sources returned a warning. Hash-chain integrity is
              intact, but analysts should acknowledge gaps before correlating.
            </span>
          </div>
        )}

        {!correlated && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
            <span className="text-xs text-foreground/80">
              {canCorrelate
                ? overall === "warning"
                  ? "Verification finished with warnings — review above, then proceed."
                  : "Verification passed. Ready to run correlation."
                : "Verifying evidence sources…"}
            </span>
            <Button
              size="sm"
              onClick={() => setCorrelated(true)}
              disabled={!canCorrelate}
              className="gap-1.5"
            >
              <Icon name="play" size={12} />
              Run correlation
            </Button>
          </div>
        )}
      </Card>

      {!correlated && (
        <Card className="glass-panel rounded-2xl border-dashed border-foreground/15 bg-transparent p-10 text-center">
          <Icon
            name="chain"
            size={28}
            className="mx-auto text-muted-foreground"
          />
          <p className="mt-2 text-sm font-semibold text-foreground/80">
            Correlation is gated on integrity verification
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Kill-chain reconstruction and MITRE ATT&amp;CK mapping will appear
            here once you press Run correlation.
          </p>
        </Card>
      )}

      {correlated && (
      <>
      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">


        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Kill chain correlation
        </h2>
        <p className="text-xs text-muted-foreground">
          Cross-source evidence · MITRE ATT&amp;CK mapping · click a technique to drill down
        </p>

        <div className="mt-6 space-y-3">
          {CHAIN.map((c, i) => {
            const col = PHASE_COLOR[c.color];
            return (
              <div key={i} className="relative">
                <div
                  id={`chain-${i}`}
                  className="flex items-start gap-4 rounded-2xl border border-foreground/15 bg-foreground/10 p-4 backdrop-blur-md scroll-mt-24 transition-shadow"
                >
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ring-2 ${col.ring} ${col.bg} ${col.text}`}
                  >
                    <Icon name={c.ic} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${col.bg} ${col.text}`}
                      >
                        {c.phase}
                      </span>
                      <span className="mono text-xs text-foreground/85 text-shadow-glass">
                        {c.t}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          selectEvidence({ kind: "chain", index: i })
                        }
                        className="ml-auto inline-flex items-center gap-1 rounded-md border border-foreground/15 bg-foreground/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-foreground/80 transition hover:border-primary/40 hover:text-primary"
                        title="Show related evidence"
                      >
                        <Icon name="network" size={11} />
                        Related
                      </button>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-shadow-glass">{c.title}</p>
                    <p className="mono text-xs text-foreground/90 text-shadow-glass">
                      {c.meta}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {c.mitre.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setOpenTech(m)}
                          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full"
                        >
                          <Badge
                            variant="outline"
                            className="cursor-pointer border-primary/40 text-primary hover:bg-primary/10"
                          >
                            {m} · {ATTACK[m] ?? "—"}
                          </Badge>
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-foreground/85 text-shadow-glass">
                      <span className="uppercase tracking-widest text-foreground/70">Sources:</span>
                      {c.src.map((s) => (
                        <span
                          key={s}
                          className="mono rounded border border-border bg-foreground/10 px-1.5 py-0.5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {i < CHAIN.length - 1 && (
                  <div className="ml-10 h-4 w-px bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          MITRE ATT&CK techniques observed
        </h2>
        <p className="text-xs text-muted-foreground">
          Click a technique to see supporting events, IOCs and kill-chain phases
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {techniques.map((t) => {
            const evCount = EVENTS.filter((e) => e.mitre.includes(t)).length;
            const iocCount = IOCS.filter((io) => io.mitre?.includes(t)).length;
            const chCount = CHAIN.filter((c) => c.mitre.includes(t)).length;
            return (
              <button
                key={t}
                type="button"
                onClick={() => setOpenTech(t)}
                className="group flex items-center justify-between rounded-lg border border-foreground/15 bg-foreground/10 p-3 text-left backdrop-blur-md transition hover:border-primary/40 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <div className="min-w-0">
                  <div className="mono text-sm text-primary text-shadow-glass">{t}</div>
                  <div className="text-xs text-foreground/85 text-shadow-glass">
                    {ATTACK[t] ?? "Unknown"}
                  </div>
                  <div className="mt-1 flex gap-2 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <span>{evCount} evt</span>
                    <span>·</span>
                    <span>{iocCount} ioc</span>
                    <span>·</span>
                    <span>{chCount} phase</span>
                  </div>
                </div>
                <Icon
                  name="chevron"
                  size={14}
                  className="text-muted-foreground transition group-hover:text-primary"
                />
              </button>
            );
          })}
        </div>
      </Card>
      </>
      )}



      <Dialog open={!!openTech} onOpenChange={(o) => !o && setOpenTech(null)}>
        <DialogContent className="max-w-2xl border-foreground/10 bg-background/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="mono text-primary">{openTech}</span>
              <span className="text-foreground">— {openTech ? ATTACK[openTech] ?? "Unknown" : ""}</span>
            </DialogTitle>
            <DialogDescription>
              Evidence supporting this MITRE ATT&amp;CK technique
            </DialogDescription>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 w-fit gap-1.5"
              onClick={() => {
                if (openTech) {
                  const id = openTech;
                  setOpenTech(null);
                  selectEvidence({ kind: "technique", id });
                }
              }}
            >
              <Icon name="network" size={12} />
              Open in Related evidence
            </Button>
          </DialogHeader>


          <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1">
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Kill-chain phases ({supportingChain.length})
              </h3>
              {supportingChain.length === 0 && (
                <p className="text-xs text-muted-foreground">No phase references this technique.</p>
              )}
              <div className="space-y-2">
                {supportingChain.map(({ c, i }) => {
                  const col = PHASE_COLOR[c.color];
                  return (
                    <Link
                      key={i}
                      to="/correlation"
                      hash={`chain-${i}`}
                      onClick={() => setOpenTech(null)}
                      className="flex items-center gap-3 rounded-lg border border-foreground/15 bg-foreground/5 p-2 hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span className={`grid h-8 w-8 place-items-center rounded-lg ${col.bg} ${col.text}`}>
                        <Icon name={c.ic} size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-widest ${col.bg} ${col.text}`}>
                            {c.phase}
                          </span>
                          <span className="mono text-[11px] text-muted-foreground">{c.t}</span>
                        </div>
                        <p className="truncate text-xs">{c.title}</p>
                      </div>
                      <Icon name="chevron" size={14} className="text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Events ({supportingEvents.length})
              </h3>
              {supportingEvents.length === 0 && (
                <p className="text-xs text-muted-foreground">No event references this technique.</p>
              )}
              <div className="space-y-2">
                {supportingEvents.map(({ e, i }) => (
                  <Link
                    key={i}
                    to="/timeline"
                    hash={`event-${i}`}
                    onClick={() => setOpenTech(null)}
                    className="block rounded-lg border border-foreground/15 bg-foreground/5 p-2 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="mono text-[11px] text-muted-foreground">{e.ts}</span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{e.ch}</span>
                      <span className="mono text-[11px]">EID {e.id}</span>
                      <Badge
                        variant="outline"
                        className={`ml-auto text-[10px] ${
                          e.lvl === "critical"
                            ? "border-sev-critical/40 text-sev-critical"
                            : e.lvl === "warning"
                              ? "border-sev-warning/40 text-sev-warning"
                              : "border-sev-info/40 text-sev-info"
                        }`}
                      >
                        {e.lvl}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs">{e.msg}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                IOCs ({supportingIocs.length})
              </h3>
              {supportingIocs.length === 0 && (
                <p className="text-xs text-muted-foreground">No IOC tagged with this technique.</p>
              )}
              <div className="space-y-2">
                {supportingIocs.map((io) => (
                  <div
                    key={io.val}
                    className="rounded-lg border border-foreground/15 bg-foreground/5 p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-border bg-foreground/10 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {io.type}
                      </span>
                      <span className="mono truncate text-xs text-foreground">{io.val}</span>
                      <span
                        className={`ml-auto text-[10px] uppercase tracking-widest ${
                          io.conf === "high"
                            ? "text-sev-critical"
                            : io.conf === "medium"
                              ? "text-sev-warning"
                              : "text-muted-foreground"
                        }`}
                      >
                        {io.conf}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{io.ctx}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
