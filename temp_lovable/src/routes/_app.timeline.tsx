import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";


import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENTS } from "@/lib/case-data";
import { useAppStore } from "@/lib/store";
import type { Severity } from "@/lib/types";


export const Route = createFileRoute("/_app/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — Stormbreaker DFIR" },
      { name: "description", content: "Correlated forensic timeline across event log, MFT, USN and registry." },
    ],
  }),
  component: TimelineView,
});

const DOT: Record<Severity, string> = {
  critical: "bg-sev-critical",
  warning: "bg-sev-warning",
  info: "bg-sev-info",
  success: "bg-sev-success",
};

function TimelineView() {
  const [lvl, setLvl] = useState("all");
  const { hash } = useLocation();
  const selectEvidence = useAppStore((s) => s.selectEvidence);

  const rows = useMemo(
    () => EVENTS.filter((e) => lvl === "all" || e.lvl === lvl),
    [lvl],
  );

  useEffect(() => {
    if (!hash) return;
    // Ensure filter doesn't hide the target
    setLvl("all");
    const id = requestAnimationFrame(() => {
      const el = document.getElementById(hash.replace(/^#/, ""));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("ring-2", "ring-primary/60", "rounded-lg");
        setTimeout(
          () => el.classList.remove("ring-2", "ring-primary/60", "rounded-lg"),
          2000,
        );
      }
    });
    return () => cancelAnimationFrame(id);
  }, [hash]);


  return (
    <div className="space-y-4">
      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Forensic timeline
            </h2>
            <p className="text-xs text-muted-foreground">
              {rows.length} entries · 2026-07-11
            </p>
          </div>
          <Select value={lvl} onValueChange={setLvl}>
            <SelectTrigger className="w-[160px] border-border bg-foreground/8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-6">
        <ol className="relative border-l border-border pl-6">
          {rows.map((e) => {
            const anchor = `event-${EVENTS.indexOf(e)}`;
            return (
            <li key={anchor} id={anchor} className="mb-6 last:mb-0 scroll-mt-24 p-1 transition-shadow">

              <span
                className={`absolute -left-[7px] mt-1.5 grid h-3.5 w-3.5 place-items-center rounded-full ${DOT[e.lvl]} ring-4 ring-background`}
              />
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="mono text-xs text-muted-foreground">
                  {e.ts}
                </span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  {e.ch}
                </span>
                <span className="mono text-xs">EID {e.id}</span>
                <button
                  type="button"
                  onClick={() =>
                    selectEvidence({ kind: "event", index: EVENTS.indexOf(e) })
                  }
                  className="ml-auto inline-flex items-center gap-1 rounded-md border border-foreground/15 bg-foreground/5 px-1.5 py-0.5 text-[10px] uppercase tracking-widest text-foreground/80 transition hover:border-primary/40 hover:text-primary"
                  title="Show related evidence"
                >
                  <Icon name="network" size={10} />
                  Related
                </button>
              </div>
              <p className="mt-1 text-sm">{e.msg}</p>

              <div className="mt-2 flex flex-wrap gap-1">
                {e.mitre.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectEvidence({ kind: "technique", id: m })}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 rounded-full"
                  >
                    <Badge
                      variant="outline"
                      className="cursor-pointer border-primary/40 text-primary hover:bg-primary/10"
                    >
                      <Icon name="network" size={10} className="mr-1" />
                      {m}
                    </Badge>
                  </button>
                ))}
              </div>

            </li>
            );
          })}

        </ol>
      </Card>
    </div>
  );
}
