import { Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ATTACK } from "@/lib/case-data";
import { relatedFor } from "@/lib/related-evidence";
import { useAppStore } from "@/lib/store";
import type { Severity } from "@/lib/types";

const LVL: Record<Severity, string> = {
  critical: "border-sev-critical/40 text-sev-critical bg-sev-critical/10",
  warning: "border-sev-warning/40 text-sev-warning bg-sev-warning/10",
  info: "border-sev-info/40 text-sev-info bg-sev-info/10",
  success: "border-sev-success/40 text-sev-success bg-sev-success/10",
};

const KIND_LABEL: Record<string, string> = {
  event: "Event",
  ioc: "IOC",
  technique: "MITRE technique",
  chain: "Kill-chain phase",
};

export function RelatedEvidencePanel() {
  const selection = useAppStore((s) => s.selection);
  const select = useAppStore((s) => s.selectEvidence);

  const bundle = useMemo(
    () => (selection ? relatedFor(selection) : null),
    [selection],
  );

  const close = () => select(null);

  return (
    <Sheet open={!!selection} onOpenChange={(o) => !o && close()}>
      <SheetContent
        side="right"
        className="glass-panel w-full max-w-[520px] border-l border-foreground/10 bg-background/95 p-0 backdrop-blur-xl sm:max-w-[520px]"
      >
        {bundle && (
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-foreground/10 p-5">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-primary">
                <Icon name="network" size={12} />
                Related evidence · {KIND_LABEL[bundle.kind]}
              </div>
              <SheetTitle className="mono text-left text-sm text-foreground">
                {bundle.title}
              </SheetTitle>
              <SheetDescription className="text-left text-xs text-muted-foreground">
                {bundle.subtitle}
              </SheetDescription>
              {bundle.techniques.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {bundle.techniques.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => select({ kind: "technique", id: t })}
                      className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full"
                    >
                      <Badge
                        variant="outline"
                        className="cursor-pointer border-primary/40 text-primary hover:bg-primary/10"
                      >
                        {t} · {ATTACK[t] ?? "—"}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
              <Button
                asChild
                size="sm"
                variant="outline"
                className="mt-2 gap-1.5"
              >
                <Link
                  to={bundle.anchorHref.to}
                  hash={bundle.anchorHref.hash}
                  onClick={close}
                >
                  <Icon name="chevron" size={12} />
                  Jump to source view
                </Link>
              </Button>
            </SheetHeader>

            <div className="flex-1 space-y-5 overflow-y-auto p-5 pt-4">
              <Section
                icon="chain"
                title="Kill-chain phases"
                count={bundle.chain.length}
              >
                {bundle.chain.map(({ c, i }) => (
                  <Link
                    key={i}
                    to="/correlation"
                    hash={`chain-${i}`}
                    onClick={close}
                    className="block rounded-lg border border-foreground/15 bg-foreground/5 p-2 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-foreground/20 bg-foreground/10 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-foreground/80">
                        {c.phase}
                      </span>
                      <span className="mono text-[11px] text-muted-foreground">
                        {c.t}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs">{c.title}</p>
                  </Link>
                ))}
              </Section>

              <Section
                icon="activity"
                title="Events"
                count={bundle.events.length}
              >
                {bundle.events.map(({ e, i }) => (
                  <Link
                    key={i}
                    to="/timeline"
                    hash={`event-${i}`}
                    onClick={close}
                    className="block rounded-lg border border-foreground/15 bg-foreground/5 p-2 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="mono text-[11px] text-muted-foreground">
                        {e.ts}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        {e.ch}
                      </span>
                      <span className="mono text-[11px]">EID {e.id}</span>
                      <span
                        className={`ml-auto rounded-full border px-1.5 py-0.5 text-[10px] uppercase tracking-widest ${LVL[e.lvl]}`}
                      >
                        {e.lvl}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs">{e.msg}</p>
                  </Link>
                ))}
              </Section>

              <Section icon="scan" title="IOCs" count={bundle.iocs.length}>
                {bundle.iocs.map((io) => (
                  <button
                    key={io.val}
                    type="button"
                    onClick={() => select({ kind: "ioc", val: io.val })}
                    className="block w-full rounded-lg border border-foreground/15 bg-foreground/5 p-2 text-left hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-border bg-foreground/10 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
                        {io.type}
                      </span>
                      <span className="mono truncate text-xs">{io.val}</span>
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
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {io.ctx}
                    </p>
                  </button>
                ))}
              </Section>

              <Section icon="disk" title="MFT / NTFS" count={bundle.mft.length}>
                {bundle.mft.map((m) => (
                  <Link
                    key={m.rec}
                    to="/mft"
                    onClick={close}
                    className="block rounded-lg border border-foreground/15 bg-foreground/5 p-2 hover:border-primary/40 hover:bg-primary/5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="mono text-[11px] text-muted-foreground">
                        #{m.rec}
                      </span>
                      {m.flag && (
                        <span className="rounded-full border border-sev-warning/40 bg-sev-warning/10 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-sev-warning">
                          anomaly
                        </span>
                      )}
                    </div>
                    <p className="mono mt-1 truncate text-[11px]">{m.path}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {m.note}
                    </p>
                  </Link>
                ))}
              </Section>

              <Section
                icon="registry"
                title="Registry"
                count={bundle.registry.length}
              >
                {bundle.registry.map((r) => (
                  <div
                    key={`${r.key}-${r.value}`}
                    className="rounded-lg border border-foreground/15 bg-foreground/5 p-2"
                  >
                    <div className="mono truncate text-[11px]">{r.key}</div>
                    <div className="mono text-[11px] text-primary">
                      {r.value}
                    </div>
                    <div className="mono text-[11px] text-muted-foreground">
                      {r.data}
                    </div>
                  </div>
                ))}
              </Section>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Section({
  icon,
  title,
  count,
  children,
}: {
  icon: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon name={icon} size={12} />
        {title}
        <span className="mono text-[10px] text-foreground/60">({count})</span>
      </h3>
      {count === 0 ? (
        <p className="text-[11px] text-muted-foreground">
          No cross-source match.
        </p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </section>
  );
}
