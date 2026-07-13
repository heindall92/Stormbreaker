import { create } from "zustand";
import type { Notification, Settings, UserProfile } from "./types";
import type { Selection } from "./related-evidence";


const PROFILE_KEY = "sb-profile";

function loadProfile(): UserProfile {
  const base: UserProfile = {
    name: "Ada Lovelace",
    email: "analyst@stormbreaker.io",
    role: "Lead DFIR Analyst",
    phone: "",
    timezone: "UTC",
    bio: "",
  };
  if (typeof localStorage === "undefined") return base;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return base;
    return { ...base, ...(JSON.parse(raw) as Partial<UserProfile>) };
  } catch {
    return base;
  }
}

function saveProfile(p: UserProfile) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export const ALLOWED_MODELS: string[] = [
  "llama3.1:8b",
  "llama3.1:70b",
  "llama3.2:3b",
  "qwen2.5:7b",
  "qwen2.5-coder:7b",
  "mistral:7b",
  "mixtral:8x7b",
  "phi3:medium",
  "gemma2:9b",
  "deepseek-r1:8b",
];

interface Store {
  settings: Settings;
  setSettings: (patch: Partial<Settings>) => void;
  aiText: string;
  setAiText: (t: string) => void;
  aiBusy: boolean;
  setAiBusy: (b: boolean) => void;
  aiRan: boolean;
  setAiRan: (b: boolean) => void;
  reports: number;
  bumpReports: () => void;
  notifications: Notification[];
  pushNotification: (n: Omit<Notification, "id" | "ts" | "read">) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  profile: UserProfile;
  setProfile: (p: UserProfile) => void;
  selection: Selection | null;
  selectEvidence: (s: Selection | null) => void;
}


export const useAppStore = create<Store>((set) => ({
  settings: {
    endpoint: "http://localhost:11434",
    model: "llama3.1:8b",
    backend: "",
    bearer: "",
    models: [],
    allowedModels: ALLOWED_MODELS,
    connected: false,
  },
  setSettings: (patch) =>
    set((s) => ({ settings: { ...s.settings, ...patch } })),
  aiText: "",
  setAiText: (t) => set({ aiText: t }),
  aiBusy: false,
  setAiBusy: (b) => set({ aiBusy: b }),
  aiRan: false,
  setAiRan: (b) => set({ aiRan: b }),
  reports: 0,
  bumpReports: () => set((s) => ({ reports: s.reports + 1 })),
  notifications: [
    {
      id: "seed-1",
      ts: new Date().toISOString().slice(11, 19),
      kind: "info",
      source: "Muninn",
      title: "Sample case loaded",
      detail: "WKS-FIN-07 · 12 events · 3 timestomp candidates",
      read: false,
    },
  ],
  pushNotification: (n) =>
    set((s) => ({
      notifications: [
        {
          ...n,
          id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          ts: new Date().toISOString().slice(11, 19),
          read: false,
        },
        ...s.notifications,
      ].slice(0, 50),
    })),
  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  clearNotifications: () => set({ notifications: [] }),
  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  profile: loadProfile(),
  setProfile: (p) => {
    saveProfile(p);
    set({ profile: p });
  },
  selection: null,
  selectEvidence: (s) => set({ selection: s }),

}));
