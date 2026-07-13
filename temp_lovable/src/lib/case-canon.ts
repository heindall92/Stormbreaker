// Canonical artifact identifiers for the demo case.
//
// SINGLE SOURCE OF TRUTH. Every panel — Event Logs, MFT, Registry, IOCs,
// Kill chain, Dashboard, AI Analyst narrative, Reports — MUST derive
// artifact names, paths and registry values from this module. Do not
// hardcode the strings again anywhere else; if a value drifts, it drifts
// here and everywhere at once.

/** User-scope persistence: HKCU Run key that launches wsc.ps1 at logon. */
export const RUN_KEY = {
  hive: "HKCU",
  path: "Software\\Microsoft\\Windows\\CurrentVersion\\Run",
  value: "WinSecCheck",
  fullPath:
    "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WinSecCheck",
  loaderScript: "%APPDATA%\\Microsoft\\wsc.ps1",
  command: 'powershell.exe -w hidden -f "%APPDATA%\\Microsoft\\wsc.ps1"',
} as const;

/**
 * System-scope persistence: Windows service. Name intentionally masquerades
 * as the legitimate `MicrosoftEdgeUpdate` service; the binary sits under
 * `C:\ProgramData\Microsoft\EdgeUpdate\` (legit lives in
 * `C:\Program Files (x86)\Microsoft\EdgeUpdate\`).
 */
export const SERVICE = {
  name: "MicrosoftEdgeUpdate",
  imagePath:
    "C:\\ProgramData\\Microsoft\\EdgeUpdate\\MicrosoftEdgeUpdate.exe",
  imagePathWithArgs:
    "C:\\ProgramData\\Microsoft\\EdgeUpdate\\MicrosoftEdgeUpdate.exe -k netsvcs",
  registryKey:
    "SYSTEM\\CurrentControlSet\\Services\\MicrosoftEdgeUpdate",
  legitPath: "C:\\Program Files (x86)\\Microsoft\\EdgeUpdate\\",
} as const;

/** Payload hash observed on the persistence binary. */
export const PAYLOAD = {
  sha256:
    "9f2c1ab7d3e0f4a5b6c78901234567890abcdef1234567890abcdef1234567890",
  sha256Short: "9f2c1ab7d3e0…",
} as const;
