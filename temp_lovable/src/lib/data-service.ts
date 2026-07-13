// Data service — single seam between the UI and the case data source.
//
// Every panel in the app talks to this interface. Today it resolves against
// the embedded demo dataset (see `case-data.ts`); tomorrow the Muninn HTTP
// client (see `api.ts`) or a future native runtime can implement the same
// contract without touching a single component.

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

export interface CaseBundle {
  case: CaseInfo;
  events: EventRow[];
  mft: MftRow[];
  registry: RegistryRow[];
  iocs: Ioc[];
  chain: ChainStep[];
  activity: Activity[];
  attack: AttackCatalog;
}

export interface DataService {
  listCases(): Promise<CaseInfo[]>;
  getCase(caseId: string): Promise<CaseInfo>;
  getEvents(caseId: string): Promise<EventRow[]>;
  getMft(caseId: string): Promise<MftRow[]>;
  getRegistry(caseId: string): Promise<RegistryRow[]>;
  getIocs(caseId: string): Promise<Ioc[]>;
  getChain(caseId: string): Promise<ChainStep[]>;
  getActivity(caseId: string): Promise<Activity[]>;
  getAttackCatalog(): Promise<AttackCatalog>;
  getBundle(caseId: string): Promise<CaseBundle>;
}

// In-memory implementation backed by the embedded demo case. `caseId` is
// accepted for parity with the network implementation but ignored.
export const demoDataService: DataService = {
  async listCases() {
    return [CASE];
  },
  async getCase() {
    return CASE;
  },
  async getEvents() {
    return EVENTS;
  },
  async getMft() {
    return MFT;
  },
  async getRegistry() {
    return REGISTRY;
  },
  async getIocs() {
    return IOCS;
  },
  async getChain() {
    return CHAIN;
  },
  async getActivity() {
    return ACTIVITY;
  },
  async getAttackCatalog() {
    return ATTACK;
  },
  async getBundle() {
    return {
      case: CASE,
      events: EVENTS,
      mft: MFT,
      registry: REGISTRY,
      iocs: IOCS,
      chain: CHAIN,
      activity: ACTIVITY,
      attack: ATTACK,
    };
  },
};

// HTTP implementation — same shape, backed by the frozen Muninn REST contract
// in `api.ts`. Bearer JWT (RS256) and base URL come from the settings store.
// Every helper returns the embedded demo dataset when the backend is not
// configured or the request fails, so the UI never renders empty.
import {
  loadActivity,
  loadAttack,
  loadBundle,
  loadCase,
  loadCases,
  loadChain,
  loadEvents,
  loadIocs,
  loadMft,
  loadRegistry,
} from "./api";
import { useAppStore } from "./store";

export const httpDataService: DataService = {
  listCases: () => loadCases(),
  getCase: (id) => loadCase(id),
  getEvents: (id) => loadEvents(id),
  getMft: (id) => loadMft(id),
  getRegistry: (id) => loadRegistry(id),
  getIocs: (id) => loadIocs(id),
  getChain: (id) => loadChain(id),
  getActivity: (id) => loadActivity(id),
  getAttackCatalog: () => loadAttack(),
  getBundle: (id) => loadBundle(id),
};

/**
 * Single seam. Picks the HTTP client when the Settings panel has a Muninn
 * backend configured; falls back to the embedded demo dataset otherwise.
 * Consumers never care which one is active — the DataService contract is the
 * same one the future Avalonia/WPF native client will consume.
 */
export const dataService: DataService = {
  listCases: () => pick().listCases(),
  getCase: (id) => pick().getCase(id),
  getEvents: (id) => pick().getEvents(id),
  getMft: (id) => pick().getMft(id),
  getRegistry: (id) => pick().getRegistry(id),
  getIocs: (id) => pick().getIocs(id),
  getChain: (id) => pick().getChain(id),
  getActivity: (id) => pick().getActivity(id),
  getAttackCatalog: () => pick().getAttackCatalog(),
  getBundle: (id) => pick().getBundle(id),
};

function pick(): DataService {
  if (typeof window === "undefined") return demoDataService;
  try {
    const backend = useAppStore.getState().settings.backend?.trim();
    return backend ? httpDataService : demoDataService;
  } catch {
    return demoDataService;
  }
}
