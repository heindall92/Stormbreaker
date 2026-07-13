import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { Icon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MFT } from "@/lib/case-data";

export const Route = createFileRoute("/_app/mft")({
  head: () => ({
    meta: [
      { title: "MFT / NTFS — Stormbreaker DFIR" },
      { name: "description", content: "NTFS Master File Table triage with $SI vs $FN timestomp detection." },
    ],
  }),
  component: MftView,
});

function MftView() {
  const [q, setQ] = useState("");
  const [only, setOnly] = useState(false);

  const rows = useMemo(
    () =>
      MFT.filter((m) => {
        if (only && !m.flag) return false;
        if (q && !m.path.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
      }),
    [q, only],
  );

  const stomps = MFT.filter((m) => m.flag).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Records
          </span>
          <div className="mt-1 text-3xl font-semibold">{MFT.length}</div>
          <div className="text-xs text-muted-foreground">parsed</div>
        </Card>
        <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Timestomp
          </span>
          <div className="mt-1 text-3xl font-semibold text-sev-critical">
            {stomps}
          </div>
          <div className="text-xs text-muted-foreground">$SI ≠ $FN</div>
        </Card>
        <Card className="glass-panel rounded-2xl border-foreground/10 bg-transparent p-5">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Filter
          </span>
          <div className="mt-2 flex flex-col gap-2">
            <div className="relative">
              <Icon
                name="search"
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Path contains…"
                className="border-border bg-foreground/8 pl-9"
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={only}
                onChange={(e) => setOnly(e.target.checked)}
                className="accent-primary"
              />
              Only timestomp candidates
            </label>
          </div>
        </Card>
      </div>

      <Card className="glass-panel overflow-hidden rounded-2xl border-foreground/10 bg-transparent">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-foreground/8 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="p-3">Rec</th>
                <th className="p-3">Path</th>
                <th className="p-3">Size</th>
                <th className="p-3">$SI</th>
                <th className="p-3">$FN</th>
                <th className="p-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr
                  key={m.rec}
                  className={`border-t border-border/60 transition ${
                    m.flag ? "bg-sev-critical/5 hover:bg-sev-critical/10" : "hover:bg-foreground/8"
                  }`}
                >
                  <td className="mono p-3 text-xs text-muted-foreground">
                    {m.rec}
                  </td>
                  <td className="mono p-3 text-xs">
                    <span className="flex items-center gap-2">
                      {m.flag && (
                        <Icon
                          name="alert"
                          size={14}
                          className="text-sev-critical"
                        />
                      )}
                      <span className="flex flex-col">
                        <span>{m.path}</span>
                        {m.sha256 && (
                          <span className="mono text-[10px] text-muted-foreground">
                            SHA256 {m.sha256.slice(0, 16)}…
                          </span>
                        )}
                      </span>
                    </span>
                  </td>
                  <td className="mono p-3 text-xs">{m.size}</td>
                  <td className="mono p-3 text-xs">{m.si}</td>
                  <td className="mono p-3 text-xs">{m.fn}</td>
                  <td className="p-3">
                    {m.flag ? (
                      <Badge className="bg-sev-critical text-white">
                        {m.note}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {m.note}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
