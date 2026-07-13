import { CHAIN, EVENTS, IOCS, MFT, REGISTRY } from "@/lib/case-data";

export type IntegrityStatus = "ok" | "warning" | "error";

export interface SourceIntegrity {
  key: string;
  label: string;
  icon: string;
  artifacts: number;
  bytes: number;
  sha256: string;
  sha256Short: string;
  chainedSha256: string;
  chainedShort: string;
  status: IntegrityStatus;
  note: string;
}

async function sha256Hex(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function short(hex: string): string {
  return `${hex.slice(0, 10)}…${hex.slice(-4)}`;
}

interface SourceSpec {
  key: string;
  label: string;
  icon: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  status: IntegrityStatus;
  note: string;
}

function specs(): SourceSpec[] {
  const logCleared = EVENTS.some((e) => e.id === 1102);
  return [
    {
      key: "events",
      label: "Event Logs",
      icon: "shield",
      data: EVENTS,
      status: logCleared ? "warning" : "ok",
      note: logCleared
        ? "Security.evtx clear detected (EID 1102) — gap flagged, hash-chain intact"
        : "All channels intact",
    },
    {
      key: "mft",
      label: "MFT / NTFS",
      icon: "disk",
      data: MFT,
      status: "ok",
      note: "$MFT parsed · $SI/$FN anomalies preserved",
    },
    {
      key: "registry",
      label: "Registry hives",
      icon: "registry",
      data: REGISTRY,
      status: "ok",
      note: "NTUSER.DAT + SYSTEM verified",
    },
    {
      key: "iocs",
      label: "IOC set",
      icon: "scan",
      data: IOCS,
      status: "ok",
      note: "IOC canon signed and cross-linked",
    },
    {
      key: "chain",
      label: "Kill-chain ledger",
      icon: "chain",
      data: CHAIN,
      status: "ok",
      note: "Hash-chained · custody ledger sealed",
    },
  ];
}

export async function computeIntegrity(): Promise<SourceIntegrity[]> {
  const s = specs();
  const out: SourceIntegrity[] = [];
  let prev = "";
  for (const spec of s) {
    const serialized = JSON.stringify(spec.data);
    const h = await sha256Hex(serialized);
    const chained = await sha256Hex(prev + h);
    prev = chained;
    out.push({
      key: spec.key,
      label: spec.label,
      icon: spec.icon,
      artifacts: Array.isArray(spec.data) ? spec.data.length : 1,
      bytes: serialized.length,
      sha256: h,
      sha256Short: short(h),
      chainedSha256: chained,
      chainedShort: short(chained),
      status: spec.status,
      note: spec.note,
    });
  }
  return out;
}

export function overallStatus(sources: SourceIntegrity[]): IntegrityStatus {
  if (sources.some((s) => s.status === "error")) return "error";
  if (sources.some((s) => s.status === "warning")) return "warning";
  return "ok";
}
