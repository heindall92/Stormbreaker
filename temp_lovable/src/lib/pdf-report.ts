import { jsPDF } from "jspdf";

import { CASE, CHAIN, EVENTS, IOCS, MFT, REGISTRY } from "./case-data";

interface BuildOpts {
  aiNarrative?: string;
}

// Extract clean plaintext from a markdown snippet — good enough for a
// short executive summary block in the PDF.
function mdToPlain(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractSection(md: string, heading: RegExp): string | null {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => heading.test(l));
  if (start < 0) return null;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => /^\s{0,3}#{1,6}\s+/.test(l));
  const body = end < 0 ? rest : rest.slice(0, end);
  return body.join("\n").trim();
}

const CONCLUSIONS: string[] = [
  "Isolate WKS-FIN-07 and SRV-FILES-01 from the network before any remediation.",
  "Kill the persistence service and remove the HKCU Run key + service binary.",
  "Block 185.220.101.47 and the *.hopto.pro C2 domain at the perimeter.",
  "Restore \\\\SRV-FILES-01\\finance from offline backup — shadow copies are gone.",
  "Rotate CORP\\jsmith credentials and hunt for reuse across the estate.",
  "Sweep the estate for the payload SHA-256 and the USB serial AABBCC112233.",
  "Enable Security.evtx forwarding to a WEC/SIEM to survive future clear attempts.",
];

export function buildReportPdf({ aiNarrative }: BuildOpts = {}): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 54;
  const marginY = 64;
  const contentW = pageW - marginX * 2;
  let y = marginY;

  const ACCENT: [number, number, number] = [59, 130, 246]; // blue-500
  const TEXT: [number, number, number] = [17, 24, 39];
  const MUTED: [number, number, number] = [107, 114, 128];
  const RULE: [number, number, number] = [229, 231, 235];

  function ensure(space: number) {
    if (y + space > pageH - marginY) {
      addFooter();
      doc.addPage();
      y = marginY;
    }
  }

  function addFooter() {
    const total = doc.getNumberOfPages();
    const current = doc.getCurrentPageInfo().pageNumber;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(
      `Stormbreaker DFIR · ${CASE.id} · ${CASE.host}`,
      marginX,
      pageH - 32,
    );
    doc.text(
      `Page ${current} of ${total}`,
      pageW - marginX,
      pageH - 32,
      { align: "right" },
    );
  }

  function h1(text: string) {
    ensure(48);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...TEXT);
    doc.text(text, marginX, y);
    y += 6;
    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(1.5);
    doc.line(marginX, y, marginX + 44, y);
    y += 18;
  }

  function h2(text: string) {
    ensure(34);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...ACCENT);
    doc.text(text.toUpperCase(), marginX, y);
    y += 4;
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.5);
    doc.line(marginX, y + 2, marginX + contentW, y + 2);
    y += 16;
  }

  function body(text: string, opts: { size?: number; color?: [number, number, number] } = {}) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(opts.size ?? 10);
    doc.setTextColor(...(opts.color ?? TEXT));
    const lines = doc.splitTextToSize(text, contentW);
    for (const line of lines) {
      ensure(14);
      doc.text(line, marginX, y);
      y += 13;
    }
  }

  function kv(label: string, value: string) {
    ensure(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(label.toUpperCase(), marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    doc.text(value, marginX + 110, y);
    y += 14;
  }

  // ── Cover header ───────────────────────────────────────────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, pageW, 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...ACCENT);
  doc.text("STORMBREAKER · DFIR INCIDENT REPORT", marginX, y);
  y += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...TEXT);
  doc.text(`Case ${CASE.id}`, marginX, y);
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(
    `Generated ${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`,
    marginX,
    y,
  );
  y += 20;

  kv("Host", CASE.host);
  kv("OS", CASE.os);
  kv("Analyst", CASE.analyst);
  kv("Acquired", CASE.acquired);
  kv("Tool", CASE.tool);

  // ── Executive summary (AI narrative if available) ──────────────────────
  h2("Executive summary");
  const summarySrc =
    (aiNarrative && (extractSection(aiNarrative, /^\s{0,3}#{1,6}\s*Executive/i) ?? "")) ||
    "Confirmed intrusion via malicious USB, obfuscated PowerShell C2, dual persistence, defense evasion (timestomp + Security event-log wipe), destructive impact on the finance file share, and SMB lateral movement to SRV-FILES-01.";
  body(mdToPlain(summarySrc));

  // ── Attack chain ───────────────────────────────────────────────────────
  h2("Attack chain");
  for (let i = 0; i < CHAIN.length; i++) {
    const c = CHAIN[i];
    ensure(34);
    // step number chip
    doc.setFillColor(...ACCENT);
    doc.circle(marginX + 8, y - 3, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), marginX + 8, y, { align: "center", baseline: "middle" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    doc.text(`${c.t} · ${c.phase}`, marginX + 26, y);
    y += 13;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    const wrap = doc.splitTextToSize(c.title, contentW - 26);
    for (const line of wrap) {
      ensure(13);
      doc.text(line, marginX + 26, y);
      y += 13;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const meta = `MITRE: ${c.mitre.join(", ")}  ·  Sources: ${c.src.join(", ")}`;
    const wrap2 = doc.splitTextToSize(meta, contentW - 26);
    for (const line of wrap2) {
      ensure(12);
      doc.text(line, marginX + 26, y);
      y += 12;
    }
    y += 4;
  }

  // ── MITRE mapping ──────────────────────────────────────────────────────
  h2("MITRE ATT&CK mapping");
  const techMap = new Map<string, { phases: string[]; events: number }>();
  for (const c of CHAIN) {
    for (const t of c.mitre) {
      const cur = techMap.get(t) ?? { phases: [], events: 0 };
      if (!cur.phases.includes(c.phase)) cur.phases.push(c.phase);
      techMap.set(t, cur);
    }
  }
  for (const e of EVENTS) {
    for (const t of e.mitre) {
      const cur = techMap.get(t) ?? { phases: [], events: 0 };
      cur.events += 1;
      techMap.set(t, cur);
    }
  }
  const techs = Array.from(techMap.entries()).sort(([a], [b]) => a.localeCompare(b));

  // table header
  ensure(20);
  doc.setFillColor(243, 244, 246);
  doc.rect(marginX, y - 10, contentW, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text("TECHNIQUE", marginX + 6, y);
  doc.text("KILL-CHAIN PHASE(S)", marginX + 110, y);
  doc.text("EVENTS", marginX + contentW - 6, y, { align: "right" });
  y += 12;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...TEXT);
  for (const [tech, info] of techs) {
    ensure(16);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.4);
    doc.line(marginX, y - 10, marginX + contentW, y - 10);
    doc.setFont("helvetica", "bold");
    doc.text(tech, marginX + 6, y);
    doc.setFont("helvetica", "normal");
    const phases = info.phases.join(", ") || "—";
    const wrap = doc.splitTextToSize(phases, contentW - 170);
    doc.text(wrap[0] ?? "—", marginX + 110, y);
    doc.text(String(info.events), marginX + contentW - 6, y, { align: "right" });
    y += 14;
    if (wrap.length > 1) {
      for (const extra of wrap.slice(1)) {
        ensure(12);
        doc.text(extra, marginX + 110, y);
        y += 12;
      }
    }
  }

  // ── Key IOCs ───────────────────────────────────────────────────────────
  h2("Key indicators of compromise");
  for (const i of IOCS.slice(0, 12)) {
    ensure(14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...ACCENT);
    doc.text(`${i.type.toUpperCase()}`, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`(${i.conf})`, marginX + 56, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    const line = `${i.val} — ${i.ctx}`;
    const wrap = doc.splitTextToSize(line, contentW - 90);
    doc.text(wrap[0], marginX + 90, y);
    y += 13;
    for (const extra of wrap.slice(1)) {
      ensure(12);
      doc.text(extra, marginX + 90, y);
      y += 12;
    }
  }

  // ── Numbered conclusions ───────────────────────────────────────────────
  h2("Conclusions & recommended actions");
  for (let i = 0; i < CONCLUSIONS.length; i++) {
    const text = CONCLUSIONS[i];
    ensure(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...ACCENT);
    doc.text(`${i + 1}.`, marginX, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT);
    const wrap = doc.splitTextToSize(text, contentW - 24);
    for (let k = 0; k < wrap.length; k++) {
      ensure(13);
      doc.text(wrap[k], marginX + 20, y);
      y += 13;
    }
    y += 3;
  }

  // ── Appendix: audit trail ──────────────────────────────────────────────
  // Build technique → phase index once, so every source row can be mapped
  // back to the kill-chain phase(s) it contributes to.
  const techToPhases = new Map<string, string[]>();
  for (const c of CHAIN) {
    for (const t of c.mitre) {
      const cur = techToPhases.get(t) ?? [];
      if (!cur.includes(c.phase)) cur.push(c.phase);
      techToPhases.set(t, cur);
    }
  }
  function phasesFor(mitre: string[]): string {
    const out = new Set<string>();
    for (const t of mitre) {
      const ps = techToPhases.get(t);
      if (ps) for (const p of ps) out.add(p);
    }
    return out.size ? Array.from(out).join(" · ") : "—";
  }

  doc.addPage();
  y = marginY;
  h1("Appendix A — Audit trail");
  body(
    "Every source artefact used to build this report, with UTC timestamps and mapping to the kill-chain phase(s) it contributes to. Preserved for chain-of-custody and independent review.",
    { color: MUTED },
  );

  // A.1 — Event log entries
  h2(`A.1 · Event log entries (${EVENTS.length})`);
  ensure(20);
  doc.setFillColor(243, 244, 246);
  doc.rect(marginX, y - 10, contentW, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("TIMESTAMP (UTC)", marginX + 4, y);
  doc.text("EID / CHANNEL", marginX + 118, y);
  doc.text("SUMMARY  →  PHASE(S)", marginX + 232, y, undefined);
  y += 12;

  for (const e of EVENTS) {
    ensure(28);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.3);
    doc.line(marginX, y - 10, marginX + contentW, y - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT);
    doc.text(e.ts, marginX + 4, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text(`EID ${e.id}`, marginX + 118, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text(e.ch, marginX + 118, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    const msg = doc.splitTextToSize(e.msg, contentW - 232);
    doc.text(msg[0] ?? "", marginX + 232, y);
    let dy = y + 11;
    for (const extra of msg.slice(1, 2)) {
      doc.text(extra, marginX + 232, dy);
      dy += 10;
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const phaseLine = `MITRE ${e.mitre.join(", ") || "—"}  →  ${phasesFor(e.mitre)}`;
    const wrapP = doc.splitTextToSize(phaseLine, contentW - 232);
    doc.text(wrapP[0] ?? "", marginX + 232, dy);
    dy += 10;

    y = Math.max(dy, y + 22);
    y += 2;
  }

  // A.2 — MFT records (only flagged / timestomp candidates)
  const mftFlagged = MFT.filter((m) => m.flag);
  h2(`A.2 · MFT / NTFS artefacts (${mftFlagged.length} flagged)`);
  ensure(20);
  doc.setFillColor(243, 244, 246);
  doc.rect(marginX, y - 10, contentW, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("RECORD", marginX + 4, y);
  doc.text("$SI  /  $FN", marginX + 64, y);
  doc.text("PATH  →  NOTE", marginX + 210, y);
  y += 12;

  for (const m of mftFlagged) {
    ensure(24);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.3);
    doc.line(marginX, y - 10, marginX + contentW, y - 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text(`#${m.rec}`, marginX + 4, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT);
    doc.text(m.si, marginX + 64, y);
    doc.setTextColor(...MUTED);
    doc.text(m.fn, marginX + 64, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    const path = doc.splitTextToSize(m.path, contentW - 210);
    doc.text(path[0] ?? "", marginX + 210, y);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const note = doc.splitTextToSize(
      `${m.note}  →  ${phasesFor(["T1070.006"])}`,
      contentW - 210,
    );
    doc.text(note[0] ?? "", marginX + 210, y + 10);

    y += 22;
  }

  // A.3 — Registry
  h2(`A.3 · Registry keys (${REGISTRY.length})`);
  ensure(20);
  doc.setFillColor(243, 244, 246);
  doc.rect(marginX, y - 10, contentW, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("TIMESTAMP (UTC)", marginX + 4, y);
  doc.text("HIVE / KEY  →  PHASE(S)", marginX + 118, y);
  y += 12;

  for (const r of REGISTRY) {
    ensure(28);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.3);
    doc.line(marginX, y - 10, marginX + contentW, y - 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT);
    doc.text(r.t, marginX + 4, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text(r.hive, marginX + 118, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    const keyLine = doc.splitTextToSize(`${r.key}\\${r.value}`, contentW - 118);
    doc.text(keyLine[0] ?? "", marginX + 118, y + 10);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const dataLine = doc.splitTextToSize(
      `= ${r.data}  ·  MITRE ${r.mitre.join(", ") || "—"}  →  ${phasesFor(r.mitre)}`,
      contentW - 118,
    );
    doc.text(dataLine[0] ?? "", marginX + 118, y + 20);

    y += 30;
  }

  // A.4 — IOCs (full list)
  h2(`A.4 · Indicators of compromise (${IOCS.length})`);
  ensure(20);
  doc.setFillColor(243, 244, 246);
  doc.rect(marginX, y - 10, contentW, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text("TYPE", marginX + 4, y);
  doc.text("VALUE", marginX + 70, y);
  doc.text("CONF · PHASE(S)", marginX + contentW - 4, y, { align: "right" });
  y += 12;

  for (const i of IOCS) {
    ensure(16);
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.3);
    doc.line(marginX, y - 10, marginX + contentW, y - 10);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...ACCENT);
    doc.text(i.type.toUpperCase(), marginX + 4, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...TEXT);
    const val = doc.splitTextToSize(i.val, contentW - 220);
    doc.text(val[0] ?? "", marginX + 70, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const phases = phasesFor(i.mitre ?? []);
    doc.text(
      `${i.conf}  ·  ${phases}`,
      marginX + contentW - 4,
      y,
      { align: "right" },
    );
    y += 14;
  }

  addFooter();
  return doc;
}
