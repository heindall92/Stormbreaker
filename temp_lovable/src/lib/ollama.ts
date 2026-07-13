import { CASE, CHAIN, EVENTS, IOCS, MFT } from "./case-data";
import { PAYLOAD, RUN_KEY, SERVICE } from "./case-canon";
import type { Severity } from "./types";

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export function evidenceDossier(): string {
  const critical = EVENTS.filter((e) => e.lvl === "critical");
  const parts: string[] = [];
  parts.push(`CASE ${CASE.id} — host ${CASE.host} (${CASE.os})`);
  parts.push(`Analyst: ${CASE.analyst} · Acquired: ${CASE.acquired}`);
  parts.push("");
  parts.push("KILL CHAIN:");
  for (const c of CHAIN) {
    parts.push(
      `  [${c.t}] ${c.phase} — ${c.title} (${c.mitre.join(", ")}) — sources: ${c.src.join(", ")}`,
    );
  }
  parts.push("");
  parts.push("CRITICAL EVENTS:");
  for (const e of critical) {
    parts.push(
      `  [${e.ts}] EID ${e.id} ${e.ch} user=${e.user} pid=${e.pid} — ${truncate(e.msg, 220)} [MITRE ${e.mitre.join(", ")}]`,
    );
  }
  parts.push("");
  parts.push("MFT TIMESTOMP CANDIDATES:");
  for (const m of MFT.filter((m) => m.flag)) {
    parts.push(`  rec ${m.rec} ${m.path} — $SI=${m.si} $FN=${m.fn} — ${m.note}`);
  }
  parts.push("");
  parts.push("IOCs:");
  for (const i of IOCS) {
    parts.push(`  (${i.type}, ${i.conf}) ${i.val} — ${i.ctx}`);
  }
  return parts.join("\n");
}

interface ChatOpts {
  endpoint: string;
  model: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
  onToken: (t: string) => void;
  signal?: AbortSignal;
}

export async function ollamaReachable(
  endpoint: string,
  ms = 2500,
): Promise<{ ok: boolean; models: string[] }> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), ms);
  try {
    const res = await fetch(`${endpoint.replace(/\/+$/, "")}/api/tags`, {
      signal: ac.signal,
    });
    if (!res.ok) return { ok: false, models: [] };
    const j = (await res.json()) as { models?: { name: string }[] };
    return { ok: true, models: (j.models ?? []).map((m) => m.name) };
  } catch {
    return { ok: false, models: [] };
  } finally {
    clearTimeout(timer);
  }
}

export async function ollamaChat(opts: ChatOpts): Promise<string> {
  const res = await fetch(`${opts.endpoint.replace(/\/+$/, "")}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: opts.model,
      messages: opts.messages,
      stream: true,
      options: { temperature: 0.2 },
    }),
    signal: opts.signal,
  });
  if (!res.ok || !res.body) throw new Error(`Ollama HTTP ${res.status}`);
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let full = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const l = line.trim();
      if (!l) continue;
      try {
        const obj = JSON.parse(l) as {
          message?: { content?: string };
          done?: boolean;
        };
        const chunk = obj.message?.content ?? "";
        if (chunk) {
          full += chunk;
          opts.onToken(chunk);
        }
      } catch {
        /* ignore malformed */
      }
    }
  }
  return full;
}

export function buildDfirMessages(
  question: string,
): { role: "system" | "user"; content: string }[] {
  const sys = `You are Stormbreaker, a senior DFIR (Digital Forensics & Incident Response) analyst embedded in a Windows evidence review console.

STRICT RULES
- Analyse ONLY the EVIDENCE DOSSIER provided. Never invent hosts, users, IPs, hashes, event IDs or timestamps.
- If the dossier does not support a claim, say "insufficient evidence".
- Use UTC timestamps exactly as given. Quote Event IDs (EID), MITRE technique IDs (Txxxx.xxx) and file paths verbatim.
- Be terse. Prefer bullet points.

OUTPUT FORMAT (Markdown, <= 450 words, in this order)
## Executive summary
2-4 sentences: what happened, when, blast radius, confidence.

## Attack chain
Numbered steps. Each step: phase — action (EID / source) [Txxxx].

## Key indicators (IOCs)
Bullets grouped by type (IP, Domain, Hash, Path, Registry, USB) with confidence high/medium/low.

## MITRE ATT&CK
Comma-separated unique list of every Txxxx cited above.

## Anomalies & timestomp
Call out $SI vs $FN mismatches, cleared logs, gaps or off-hours activity.

## Containment & next steps
Numbered, prioritised, imperative.

## Confidence & gaps
One line: overall confidence + missing evidence.`;
  const user = `EVIDENCE DOSSIER (verbatim, do not paraphrase source values):

${evidenceDossier()}

ANALYST QUESTION: ${question || "Provide a full triage analysis of this incident."}`;
  return [
    { role: "system", content: sys },
    { role: "user", content: user },
  ];
}

/** Extract notifications the bell icon can surface from an AI analysis text. */
export function deriveNotifications(
  text: string,
): { kind: "critical" | "warning" | "info"; title: string; detail?: string }[] {
  const out: { kind: "critical" | "warning" | "info"; title: string; detail?: string }[] = [];
  const techs = Array.from(new Set(text.match(/T\d{4}(?:\.\d{3})?/g) ?? []));
  if (techs.length) {
    out.push({
      kind: "critical",
      title: `${techs.length} MITRE technique(s) detected`,
      detail: techs.slice(0, 6).join(" · "),
    });
  }
  const ips = Array.from(new Set(text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) ?? []));
  if (ips.length) {
    out.push({
      kind: "warning",
      title: `${ips.length} suspicious IP(s)`,
      detail: ips.slice(0, 4).join(" · "),
    });
  }
  if (/timestomp|cleared|vssadmin|shadow/i.test(text)) {
    out.push({
      kind: "critical",
      title: "Anti-forensics activity",
      detail: "Timestomp / cleared logs / shadow deletion",
    });
  }
  return out;
}

export function demoAnalysis(_q: string): string {
  return `## Executive summary
Confirmed intrusion on **${CASE.host}** starting **09:41 UTC** via a malicious USB (Kingston SN AABBCC112233 — **T1091**). An obfuscated PowerShell one-liner (EID 4688 / PS 4104 — **T1059.001**, **T1027**) fetched a stager from **185.220.101.47** and established a TLS beacon to :443 (Sysmon 3 — **T1071.001**), a known Tor exit node.

## Attack chain
1. **Initial access** — USB drop, .lnk launched under CORP\\jsmith.
2. **Execution & C2** — encoded PowerShell beacons over TLS.
3. **Persistence** — HKCU Run key \`${RUN_KEY.value}\` and service \`${SERVICE.name}\` (**T1547.001**, **T1543.003**).
4. **Defense evasion** — \`${SERVICE.name}.exe\` timestomped ($SI 2021 vs $FN 2026 — **T1070.006**); Security.evtx cleared, EID 1102 (**T1070.001**).
5. **Impact** — \`vssadmin delete shadows /all /quiet\` (**T1490**) then mass \`del /f /q\` on \\\\SRV-FILES-01\\finance (**T1485**), 847 files destroyed.
6. **Lateral movement** — NTLM logon type 3 to SRV-FILES-01 (**T1021.002**).

## Key indicators (IOCs)
- IP: \`185.220.101.47\` (Tor exit, high)
- Domain: \`cdn-static-eu.hopto.pro\`
- SHA256: \`${PAYLOAD.sha256Short}\` (${SERVICE.name}.exe)
- Path: \`${SERVICE.imagePath}\`
- USB serial: \`AABBCC112233\`
- Registry: \`${RUN_KEY.hive}\\...\\Run\\${RUN_KEY.value}\`

## MITRE ATT&CK
T1091 · T1059.001 · T1027 · T1071.001 · T1547.001 · T1543.003 · T1070.006 · T1070.001 · T1490 · T1485 · T1021.002

## Containment & next steps
1. Isolate WKS-FIN-07 and SRV-FILES-01 from the network.
2. Kill \`${SERVICE.name}\` and remove Run key + \`${SERVICE.name}.exe\`.
3. Block \`185.220.101.47\` and the hopto.pro sub-domain at the perimeter.
4. Restore \\\\SRV-FILES-01\\finance from offline backup; shadow copies are gone.
5. Rotate CORP\\jsmith credentials; hunt for reuse across the estate.
6. Sweep for the SHA256 and USB serial on other hosts.

_Fallback analysis (Ollama unreachable). Configure endpoint in Settings for a live model._`;
}

export async function streamDemo(
  text: string,
  onToken: (t: string) => void,
  signal?: AbortSignal,
) {
  const chunks = text.match(/.{1,4}/gs) ?? [];
  for (const c of chunks) {
    if (signal?.aborted) return;
    onToken(c);
    await new Promise((r) => setTimeout(r, 8));
  }
}
