export type Severity = "critical" | "warning" | "info" | "success";

export interface CaseInfo {
  id: string;
  host: string;
  analyst: string;
  os: string;
  acquired: string;
  tool: string;
}

export interface EventRow {
  t: string;
  ts: string;
  id: number;
  ch: string;
  lvl: Severity;
  src: string;
  pid: number;
  user: string;
  msg: string;
  mitre: string[];
  detail: Record<string, string>;
}

export interface MftRow {
  rec: number;
  path: string;
  size: string;
  si: string;
  fn: string;
  flag: boolean;
  note: string;
  sha256?: string;
}

export interface RegistryRow {
  hive: string;
  key: string;
  value: string;
  data: string;
  t: string;
  mitre: string[];
}

export interface Ioc {
  type: string;
  val: string;
  conf: "high" | "medium" | "low";
  ctx: string;
  mitre?: string[];
}


export type ChainColor = "red" | "orange" | "purple" | "blue" | "green";

export interface ChainStep {
  phase: string;
  color: ChainColor;
  ic: string;
  title: string;
  meta: string;
  mitre: string[];
  src: string[];
  t: string;
}

export type AttackCatalog = Record<string, string>;

export interface Activity {
  t: string;
  kind: Severity;
  msg: string;
}

export interface Settings {
  endpoint: string;
  model: string;
  backend: string;
  bearer: string;
  models: string[];
  allowedModels: string[];
  connected: boolean;
}

export interface Notification {
  id: string;
  ts: string;
  kind: Severity;
  source: string;
  title: string;
  detail?: string;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  phone: string;
  timezone: string;
  bio: string;
}

