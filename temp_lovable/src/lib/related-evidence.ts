import { CHAIN, EVENTS, IOCS, MFT, REGISTRY } from "@/lib/case-data";
import type {
  ChainStep,
  EventRow,
  Ioc,
  MftRow,
  RegistryRow,
} from "@/lib/types";

export type Selection =
  | { kind: "event"; index: number }
  | { kind: "ioc"; val: string }
  | { kind: "technique"; id: string }
  | { kind: "chain"; index: number };

export interface RelatedBundle {
  kind: Selection["kind"];
  title: string;
  subtitle: string;
  anchorHref: { to: string; hash?: string };
  techniques: string[];
  events: { i: number; e: EventRow }[];
  iocs: Ioc[];
  chain: { i: number; c: ChainStep }[];
  mft: MftRow[];
  registry: RegistryRow[];
}

function containsAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => n && h.includes(n.toLowerCase()));
}

function eventText(e: EventRow): string {
  return [e.msg, ...Object.values(e.detail)].join(" \n ");
}

function mftMatch(needles: string[]): MftRow[] {
  return MFT.filter((m) =>
    containsAny([m.path, m.note, m.sha256 ?? ""].join(" "), needles),
  );
}

function registryMatch(needles: string[]): RegistryRow[] {
  return REGISTRY.filter((r) =>
    containsAny([r.key, r.value, r.data].join(" "), needles),
  );
}

export function relatedFor(sel: Selection): RelatedBundle | null {
  if (sel.kind === "event") {
    const e = EVENTS[sel.index];
    if (!e) return null;
    const techniques = e.mitre;
    const iocs = IOCS.filter(
      (io) =>
        io.mitre?.some((m) => techniques.includes(m)) ||
        eventText(e).includes(io.val),
    );
    const chain = CHAIN.map((c, i) => ({ c, i })).filter(
      ({ c }) =>
        c.mitre.some((m) => techniques.includes(m)) ||
        c.src.some((s) => s.includes(String(e.id))),
    );
    const events = EVENTS.map((ev, i) => ({ e: ev, i })).filter(
      ({ e: ev, i }) =>
        i !== sel.index && ev.mitre.some((m) => techniques.includes(m)),
    );
    const needles = [
      ...iocs.map((i) => i.val),
      ...techniques,
      ...Object.values(e.detail).filter((v) => v && v.length < 200),
    ];
    return {
      kind: "event",
      title: `EID ${e.id} · ${e.ch}`,
      subtitle: `${e.ts} · ${e.user} · pid ${e.pid}`,
      anchorHref: { to: "/timeline", hash: `event-${sel.index}` },
      techniques,
      events,
      iocs,
      chain,
      mft: mftMatch(needles),
      registry: registryMatch(needles),
    };
  }

  if (sel.kind === "ioc") {
    const ioc = IOCS.find((i) => i.val === sel.val);
    if (!ioc) return null;
    const techniques = ioc.mitre ?? [];
    const events = EVENTS.map((e, i) => ({ e, i })).filter(
      ({ e }) =>
        eventText(e).includes(ioc.val) ||
        e.mitre.some((m) => techniques.includes(m)),
    );
    const chain = CHAIN.map((c, i) => ({ c, i })).filter(({ c }) =>
      c.mitre.some((m) => techniques.includes(m)),
    );
    const iocs = IOCS.filter(
      (io) =>
        io.val !== ioc.val && io.mitre?.some((m) => techniques.includes(m)),
    );
    const needles = [ioc.val, ...techniques];
    return {
      kind: "ioc",
      title: `${ioc.type.toUpperCase()} · ${ioc.val}`,
      subtitle: ioc.ctx,
      anchorHref: { to: "/" },
      techniques,
      events,
      iocs,
      chain,
      mft: mftMatch(needles),
      registry: registryMatch(needles),
    };
  }

  if (sel.kind === "technique") {
    const t = sel.id;
    const events = EVENTS.map((e, i) => ({ e, i })).filter(({ e }) =>
      e.mitre.includes(t),
    );
    const chain = CHAIN.map((c, i) => ({ c, i })).filter(({ c }) =>
      c.mitre.includes(t),
    );
    const iocs = IOCS.filter((io) => io.mitre?.includes(t));
    const needles = [t, ...iocs.map((i) => i.val)];
    return {
      kind: "technique",
      title: `MITRE ${t}`,
      subtitle: `${events.length} events · ${iocs.length} IOCs · ${chain.length} phases`,
      anchorHref: { to: "/correlation" },
      techniques: [t],
      events,
      iocs,
      chain,
      mft: mftMatch(needles),
      registry: registryMatch(needles),
    };
  }

  // chain
  const c = CHAIN[sel.index];
  if (!c) return null;
  const techniques = c.mitre;
  const events = EVENTS.map((e, i) => ({ e, i })).filter(({ e }) =>
    e.mitre.some((m) => techniques.includes(m)),
  );
  const iocs = IOCS.filter((io) =>
    io.mitre?.some((m) => techniques.includes(m)),
  );
  const needles = [...techniques, ...iocs.map((i) => i.val)];
  return {
    kind: "chain",
    title: `${c.phase} · ${c.title}`,
    subtitle: `${c.t} · ${c.meta}`,
    anchorHref: { to: "/correlation", hash: `chain-${sel.index}` },
    techniques,
    events,
    iocs,
    chain: [{ c, i: sel.index }],
    mft: mftMatch(needles),
    registry: registryMatch(needles),
  };
}
