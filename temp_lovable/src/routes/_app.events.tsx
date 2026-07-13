import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENTS } from "@/lib/case-data";
import { useAppStore } from "@/lib/store";
import type { EventRow, Severity } from "@/lib/types";


export const Route = createFileRoute("/_app/events")({
  head: () => ({
    meta: [
      { title: "Event Logs — Stormbreaker DFIR" },
      { name: "description", content: "Windows event log triage with filters, sort and expandable details." },
    ],
  }),
  component: EventsView,
});

const LVL_STYLE: Record<Severity, string> = {
  critical: "bg-sev-critical/20 text-sev-critical border-sev-critical/30",
  warning: "bg-sev-warning/20 text-sev-warning border-sev-warning/30",
  info: "bg-sev-info/20 text-sev-info border-sev-info/30",
  success: "bg-sev-success/20 text-sev-success border-sev-success/30",
};

function EventsView() {
  const [q, setQ] = useState("");
  const [lvl, setLvl] = useState<string>("all");
  const [ch, setCh] = useState<string>("all");
  const [sortDesc, setSortDesc] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const channels = useMemo(
    () => Array.from(new Set(EVENTS.map((e) => e.ch))),
    [],
  );

  const rows = useMemo(() => {
    const filtered = EVENTS.filter((e) => {
      if (lvl !== "all" && e.lvl !== lvl) return false;
      if (ch !== "all" && e.ch !== ch) return false;
      if (q) {
        const s = q.toLowerCase();
        if (
          !e.msg.toLowerCase().includes(s) &&
          !String(e.id).includes(s) &&
          !e.user.toLowerCase().includes(s) &&
          !e.mitre.join(" ").toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
    return sortDesc ? [...filtered].reverse() : filtered;
  }, [q, lvl, ch, sortDesc]);

  return (
    <div className="space-y-4">
      <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[240px] flex-1">
            <Icon
              name="search"
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search message, EID, user or MITRE…"
              className="border-border bg-foreground/8 pl-9"
            />
          </div>
          <Select value={lvl} onValueChange={setLvl}>
            <SelectTrigger className="w-[150px] border-border bg-foreground/8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="success">Success</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ch} onValueChange={setCh}>
            <SelectTrigger className="w-[220px] border-border bg-foreground/8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              {channels.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="secondary"
            className="bg-foreground/8"
            onClick={() => setSortDesc((v) => !v)}
          >
            <Icon name="clock" size={14} className="mr-1.5" />
            {sortDesc ? "Newest first" : "Oldest first"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {rows.length} of {EVENTS.length} events
        </p>
      </Card>

      <Card className="glass-panel overflow-hidden rounded-2xl border-foreground/10 bg-transparent">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-foreground/8 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Lvl</th>
                <th className="p-3">EID</th>
                <th className="p-3">Channel</th>
                <th className="p-3">User</th>
                <th className="p-3">Message</th>
                <th className="p-3">MITRE</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => {
                const originalIndex = EVENTS.indexOf(e);
                return (
                  <EventRowLine
                    key={`${e.ts}-${e.id}-${e.pid}`}
                    row={e}
                    index={originalIndex}
                    open={expanded === e.pid + e.id}
                    onToggle={() =>
                      setExpanded((v) =>
                        v === e.pid + e.id ? null : e.pid + e.id,
                      )
                    }
                  />
                );
              })}
            </tbody>

          </table>
        </div>
      </Card>
    </div>
  );
}

function EventRowLine({
  row,
  index,
  open,
  onToggle,
}: {
  row: EventRow;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const selectEvidence = useAppStore((s) => s.selectEvidence);

  return (
    <>
      <tr
        className="cursor-pointer border-t border-border/60 transition hover:bg-foreground/8"
        onClick={onToggle}
      >
        <td className="mono p-3 text-xs text-muted-foreground">{row.t}</td>
        <td className="p-3">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest ${LVL_STYLE[row.lvl]}`}
          >
            {row.lvl}
          </span>
        </td>
        <td className="mono p-3">{row.id}</td>
        <td className="p-3 text-xs text-muted-foreground">{row.ch}</td>
        <td className="mono p-3 text-xs">{row.user}</td>
        <td className="p-3 text-xs">{row.msg}</td>
        <td className="p-3">
          <div className="flex flex-wrap gap-1">
            {row.mitre.map((m) => (
              <Badge
                key={m}
                variant="outline"
                className="border-primary/40 text-primary"
              >
                {m}
              </Badge>
            ))}
          </div>
        </td>
        <td className="p-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(ev) => {
                ev.stopPropagation();
                selectEvidence({ kind: "event", index });
              }}
              className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
              title="Show related evidence"
              aria-label="Show related evidence"
            >
              <Icon name="network" size={13} />
            </button>
            <Icon
              name="chevron"
              size={14}
              className={`text-muted-foreground transition ${open ? "rotate-90" : ""}`}
            />
          </div>
        </td>

      </tr>
      {open && (
        <tr className="border-t border-border/60 bg-foreground/10">
          <td colSpan={8} className="p-4">
            <div className="grid gap-2 rounded-lg border border-border bg-foreground/10 p-3 text-xs sm:grid-cols-2">
              {Object.entries(row.detail).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="mono min-w-[140px] text-muted-foreground">
                    {k}
                  </span>
                  <span className="mono break-all">{v}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
