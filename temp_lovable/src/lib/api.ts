// Muninn HTTP contract — frozen shape of the backend the native app and this
// SPA will both consume. Every helper is typed against the same domain models
// used by the demo `dataService`, so switching from mock to live is a one-line
// swap in `data-service.ts`.
//
// Base URL comes from the settings store (`state.settings.backend`); when no
// backend is configured every call falls back to the embedded example case so
// the UI keeps working offline.

import { useAppStore } from "./store";
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
import {
  ACTIVITY,
  ATTACK,
  CASE,
  CHAIN,
  EVENTS,
  IOCS,
  MFT,
  REGISTRY,
} from "./case-data";
import type { CaseBundle } from "./data-service";

// ---------------------------------------------------------------------------
// Frozen endpoint contract
// ---------------------------------------------------------------------------

export const API_ROUTES = {
  cases: () => `/cases`,
  case: (id: string) => `/cases/${encodeURIComponent(id)}`,
  events: (id: string) => `/cases/${encodeURIComponent(id)}/events`,
  mft: (id: string) => `/cases/${encodeURIComponent(id)}/mft`,
  registry: (id: string) => `/cases/${encodeURIComponent(id)}/registry`,
  iocs: (id: string) => `/cases/${encodeURIComponent(id)}/iocs`,
  chain: (id: string) => `/cases/${encodeURIComponent(id)}/chain`,
  activity: (id: string) => `/cases/${encodeURIComponent(id)}/activity`,
  correlation: (id: string) => `/cases/${encodeURIComponent(id)}/correlation`,
  attack: () => `/mitre/attack`,
} as const;

export interface ApiEndpoint<T> {
  path: string;
  method: "GET";
  demo: () => T;
}

// Endpoint descriptors — pair the wire path with the demo fallback so the
// same object works online or offline.
export const endpoints = {
  listCases: (): ApiEndpoint<CaseInfo[]> => ({
    path: API_ROUTES.cases(),
    method: "GET",
    demo: () => [CASE],
  }),
  getCase: (id: string): ApiEndpoint<CaseInfo> => ({
    path: API_ROUTES.case(id),
    method: "GET",
    demo: () => CASE,
  }),
  getEvents: (id: string): ApiEndpoint<EventRow[]> => ({
    path: API_ROUTES.events(id),
    method: "GET",
    demo: () => EVENTS,
  }),
  getMft: (id: string): ApiEndpoint<MftRow[]> => ({
    path: API_ROUTES.mft(id),
    method: "GET",
    demo: () => MFT,
  }),
  getRegistry: (id: string): ApiEndpoint<RegistryRow[]> => ({
    path: API_ROUTES.registry(id),
    method: "GET",
    demo: () => REGISTRY,
  }),
  getIocs: (id: string): ApiEndpoint<Ioc[]> => ({
    path: API_ROUTES.iocs(id),
    method: "GET",
    demo: () => IOCS,
  }),
  getChain: (id: string): ApiEndpoint<ChainStep[]> => ({
    path: API_ROUTES.chain(id),
    method: "GET",
    demo: () => CHAIN,
  }),
  getActivity: (id: string): ApiEndpoint<Activity[]> => ({
    path: API_ROUTES.activity(id),
    method: "GET",
    demo: () => ACTIVITY,
  }),
  getAttack: (): ApiEndpoint<AttackCatalog> => ({
    path: API_ROUTES.attack(),
    method: "GET",
    demo: () => ATTACK,
  }),
} as const;

// ---------------------------------------------------------------------------
// Transport
// ---------------------------------------------------------------------------

function getBackend(): { base: string; bearer: string } {
  if (typeof window === "undefined") return { base: "", bearer: "" };
  try {
    const s = useAppStore.getState().settings;
    return {
      base: s.backend?.trim() ?? "",
      bearer: s.bearer?.trim() ?? "",
    };
  } catch {
    return { base: "", bearer: "" };
  }
}

async function callEndpoint<T>(ep: ApiEndpoint<T>): Promise<T> {
  const { base, bearer } = getBackend();
  if (!base) return ep.demo();
  const headers: Record<string, string> = { accept: "application/json" };
  if (bearer) headers.authorization = `Bearer ${bearer}`;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}${ep.path}`, {
      method: ep.method,
      headers,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch {
    // Any failure → transparently fall back to the demo dataset so the UI
    // never renders empty; real callers can inspect the settings.connected
    // flag if they need to differentiate.
    return ep.demo();
  }
}

// ---------------------------------------------------------------------------
// High-level helpers (kept for compatibility with existing imports)
// ---------------------------------------------------------------------------

export function loadCases() {
  return callEndpoint(endpoints.listCases());
}
export function loadCase(id: string = CASE.id) {
  return callEndpoint(endpoints.getCase(id));
}
export function loadEvents(id: string = CASE.id) {
  return callEndpoint(endpoints.getEvents(id));
}
export function loadMft(id: string = CASE.id) {
  return callEndpoint(endpoints.getMft(id));
}
export function loadRegistry(id: string = CASE.id) {
  return callEndpoint(endpoints.getRegistry(id));
}
export function loadIocs(id: string = CASE.id) {
  return callEndpoint(endpoints.getIocs(id));
}
export function loadChain(id: string = CASE.id) {
  return callEndpoint(endpoints.getChain(id));
}
export function loadActivity(id: string = CASE.id) {
  return callEndpoint(endpoints.getActivity(id));
}
export function loadAttack() {
  return callEndpoint(endpoints.getAttack());
}

export async function loadBundle(id: string = CASE.id): Promise<CaseBundle> {
  const [c, events, mft, registry, iocs, chain, activity, attack] =
    await Promise.all([
      loadCase(id),
      loadEvents(id),
      loadMft(id),
      loadRegistry(id),
      loadIocs(id),
      loadChain(id),
      loadActivity(id),
      loadAttack(),
    ]);
  return { case: c, events, mft, registry, iocs, chain, activity, attack };
}
