import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import bgUrl from "@/assets/dashboard-bg.jpg";
import { Icon, type IconName } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { CASE, EVENTS } from "@/lib/case-data";
import { useAppStore } from "@/lib/store";
import { useTheme } from "@/hooks/use-theme";
import { useNativeShell } from "@/hooks/use-native-shell";
import { ProfileDialog } from "@/components/profile-dialog";
import { HelpDialog } from "@/components/help-dialog";
import { RelatedEvidencePanel } from "@/components/related-evidence-panel";


interface NavItem {
  to: string;
  label: string;
  ic: IconName;
  key: string;
}

const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", ic: "shield", key: "1" },
  { to: "/events", label: "Event Logs", ic: "activity", key: "2" },
  { to: "/mft", label: "MFT / NTFS", ic: "disk", key: "3" },
  { to: "/timeline", label: "Timeline", ic: "clock", key: "4" },
  { to: "/correlation", label: "Correlation", ic: "network", key: "5" },
  { to: "/ai", label: "AI Analyst", ic: "brain", key: "6" },
  { to: "/reports", label: "Reports", ic: "file", key: "7" },
  { to: "/settings", label: "Settings", ic: "cog", key: "8" },
];

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { sidebarCollapsed, setSidebarCollapsed, profile } = useAppStore();
  const { theme, toggle: toggleTheme } = useTheme();
  const { isNative, minimize, toggleMaximize, close: closeWindow } = useNativeShell();
  const [scanOpen, setScanOpen] = useState(false);
  const [scan, setScan] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable)
          return;
      }
      const item = NAV.find((n) => n.key === e.key);
      if (item) {
        e.preventDefault();
        navigate({ to: item.to });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  async function runQuickScan() {
    setScanOpen(true);
    setScan(0);
    for (let i = 0; i <= 100; i += 4) {
      await new Promise((r) => setTimeout(r, 45));
      setScan(i);
    }
    setScanOpen(false);
    toast.success("Quick scan complete", {
      description: `3 YARA rules matched · ${EVENTS.length} events flagged`,
    });
    useAppStore.getState().pushNotification({
      kind: "warning",
      source: "Quick scan",
      title: "3 YARA rules matched",
      detail: `${EVENTS.length} events flagged for review`,
    });
  }

  return (
    <div className="relative isolate flex min-h-screen text-foreground">
      {/* Photo background — reflects behind the glass panels */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgUrl})` }}
      />
      {/* Barely-there vignette so the photo and blur are fully visible */}
      <div
        aria-hidden
        className="app-vignette pointer-events-none fixed inset-0 z-[1]"
      />


      <ParticleField />



      {/* Left collapsible sidebar — 256 / 72 rail */}
      <aside
        className={`sticky top-0 z-30 flex h-screen shrink-0 flex-col p-3 transition-[width] duration-200 ease-out ${
          sidebarCollapsed ? "w-[80px]" : "w-[264px]"
        }`}
      >
        <div className="glass-panel flex h-full flex-col rounded-3xl p-3">
          {/* Brand + toggle — 72px header row */}
          <div className={`flex h-[56px] items-center gap-2 px-1 ${sidebarCollapsed ? "justify-center" : ""}`}>
            {!sidebarCollapsed && (
              <>
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <Icon name="bolt" size={20} />
                </div>
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Stormbreaker
                  </div>
                  <div className="truncate text-sm font-semibold">DFIR Console</div>
                </div>
              </>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted-foreground transition hover:bg-foreground/8 hover:text-foreground"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle sidebar"
            >
              <Icon name="panelLeft" size={18} />
            </button>
          </div>

          <div className="my-2 h-px w-full bg-foreground/8" />

          {/* Nav — 48px items, 12px gap */}
          <nav className={`flex-1 space-y-1.5 overflow-y-auto pt-1 ${sidebarCollapsed ? "px-0" : "px-0.5"}`}>
            {!sidebarCollapsed && (
              <div className="mb-1 px-3 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Main
              </div>
            )}
            {NAV.map((n) => {
              const active =
                n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`group relative flex h-12 items-center gap-3 rounded-2xl text-sm transition ${
                    sidebarCollapsed ? "justify-center px-0" : "px-3"
                  } ${
                    active
                      ? "bg-primary/12 text-primary shadow-sm ring-1 ring-primary/15"
                      : "text-foreground/75 hover:bg-foreground/6 hover:text-foreground"
                  }`}
                  title={sidebarCollapsed ? `${n.label} · ${n.key}` : undefined}
                >
                  {active && !sidebarCollapsed && (
                    <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                  )}
                  <Icon name={n.ic} size={20} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="flex-1 truncate">{n.label}</span>
                      <span className="mono rounded-md bg-foreground/5 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {n.key}
                      </span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User block — avatar + name + email + used capacity */}
          <div className="mt-3 space-y-2">
            {!sidebarCollapsed && (
              <div className="rounded-2xl border border-foreground/8 bg-foreground/5 p-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="mono text-muted-foreground">Case load</span>
                  <span className="mono font-semibold">62%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div className="h-full w-[62%] rounded-full bg-gradient-to-r from-primary to-primary/60" />
                </div>
                <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
                  4 of 6 active cases · 12.4 GB / 20 GB evidence
                </p>
              </div>
            )}

            <div className="my-1 h-px w-full bg-foreground/8" />

            <div className={`flex items-center gap-3 rounded-2xl p-2 ${sidebarCollapsed ? "justify-center" : "hover:bg-foreground/5"}`}>
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
                <Icon name="user" size={16} />
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 flex-1 leading-tight">
                  <div className="truncate text-xs font-semibold">{CASE.analyst}</div>
                  <div className="mono truncate text-[10px] text-muted-foreground">
                    analyst@stormbreaker.io
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>


      {/* Main column */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 px-4 pt-4 sm:px-6">
          <div className="glass-pill app-drag-region mx-auto flex h-14 max-w-[1400px] items-center justify-between rounded-full px-3 pl-4">
            <div className="app-no-drag flex min-w-0 items-center gap-3">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-foreground/5 hover:text-foreground lg:hidden"
                aria-label="Menu"
              >
                <Icon name="menu" size={18} />
              </button>
              <div className="hidden items-center gap-2 text-xs md:flex">
                <span className="text-muted-foreground">Case</span>
                <span className="mono">{CASE.id}</span>
                <span className="text-muted-foreground">·</span>
                <span className="mono">{CASE.host}</span>
              </div>
            </div>

            {/* Right cluster: Quick scan | Import | separator | Bell | Settings | Avatar */}
            <div className="app-no-drag flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-foreground/5 hover:bg-foreground/10"
                onClick={runQuickScan}
              >
                <Icon name="scan" size={14} className="mr-1.5" /> Quick scan
              </Button>
              <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground">
                    <Icon name="upload" size={14} className="mr-1.5" /> Import
                  </Button>
                </DialogTrigger>
                <ImportDialog onClose={() => setImportOpen(false)} />
              </Dialog>

              <span className="mx-1 hidden h-6 w-px bg-foreground/10 sm:block" />

              <button
                onClick={toggleTheme}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                aria-label="Toggle theme"
              >
                <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
              </button>

              <NotificationsBell />

              <Link
                to="/settings"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                title="Settings"
                aria-label="Settings"
              >
                <Icon name="cog" size={16} />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25 hover:bg-primary/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    title="Analyst · you"
                    aria-label="Open user menu"
                  >
                    <Icon name="user" size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="glass-panel w-64 border-foreground/10 bg-transparent p-1.5"
                >
                  <div className="flex items-center gap-3 rounded-xl px-2 py-2.5">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/25">
                      <Icon name="user" size={18} />
                    </div>
                    <div className="min-w-0 flex-1 leading-tight">
                      <div className="truncate text-sm font-semibold">
                        {profile.name}
                      </div>
                      <div className="mono truncate text-[11px] text-muted-foreground">
                        {profile.email}
                      </div>
                      <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                        {profile.role}
                      </div>
                    </div>
                  </div>
                  <DropdownMenuSeparator className="my-1 bg-foreground/10" />
                  <DropdownMenuLabel className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setProfileOpen(true);
                    }}
                    className="h-10 gap-3 rounded-lg px-2 focus:bg-foreground/8"
                  >
                    <Icon name="user" size={16} className="text-muted-foreground" />
                    <span className="flex-1 text-sm">Edit profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="h-10 gap-3 rounded-lg px-2 focus:bg-foreground/8">
                    <Link to="/settings">
                      <Icon name="cog" size={16} className="text-muted-foreground" />
                      <span className="flex-1 text-sm">Settings</span>
                      <span className="mono text-[10px] text-muted-foreground">8</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={toggleTheme}
                    className="h-10 gap-3 rounded-lg px-2 focus:bg-foreground/8"
                  >
                    <Icon
                      name={theme === "dark" ? "sun" : "moon"}
                      size={16}
                      className="text-muted-foreground"
                    />
                    <span className="flex-1 text-sm">
                      {theme === "dark" ? "Light mode" : "Dark mode"}
                    </span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-foreground/10" />
                  <DropdownMenuLabel className="px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                    Support
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      setHelpOpen(true);
                    }}
                    className="h-10 gap-3 rounded-lg px-2 focus:bg-foreground/8"
                  >
                    <Icon name="spark" size={16} className="text-muted-foreground" />
                    <span className="flex-1 text-sm">Help & feedback</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 bg-foreground/10" />
                  <DropdownMenuItem
                    onSelect={() =>
                      toast.success("Signed out (demo)", {
                        description: "Session token invalidated locally.",
                      })
                    }
                    className="h-10 gap-3 rounded-lg px-2 text-sev-critical focus:bg-sev-critical/15 focus:text-sev-critical"
                  >
                    <Icon name="x" size={16} />
                    <span className="flex-1 text-sm">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isNative && (
                <>
                  <span className="mx-1 hidden h-6 w-px bg-foreground/10 sm:block" />
                  <button
                    onClick={minimize}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                    aria-label="Minimize"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                  <button
                    onClick={toggleMaximize}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                    aria-label="Maximize"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </button>
                  <button
                    onClick={closeWindow}
                    className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-sev-critical/20 hover:text-sev-critical"
                    aria-label="Close"
                  >
                    <Icon name="x" size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </header>


        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">
          <Outlet />
        </main>

        <footer className="mx-auto w-full max-w-[1400px] px-6 pb-6 text-xs text-muted-foreground">
          <div className="glass-pill flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-2">
            <span>
              {CASE.tool} · acquired {CASE.acquired}
            </span>
            <span className="mono">Analyst: {CASE.analyst}</span>
          </div>
        </footer>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
      <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />
      <RelatedEvidencePanel />


      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent className="glass-panel border-foreground/10 bg-transparent">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="scan" size={16} /> Quick scan in progress
            </DialogTitle>
            <DialogDescription>
              YARA rules · IOC sweep · anomaly heuristics
            </DialogDescription>
          </DialogHeader>
          <Progress value={scan} />
          <p className="mono text-xs text-muted-foreground">{scan}% complete</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationsBell() {
  const { notifications, markAllRead, clearNotifications } = useAppStore();
  const unread = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );
  const tone: Record<string, string> = {
    critical: "bg-sev-critical",
    warning: "bg-sev-warning",
    info: "bg-sev-info",
    success: "bg-sev-success",
  };
  return (
    <Popover onOpenChange={(o) => o && markAllRead()}>
      <PopoverTrigger asChild>
        <button
          className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
          title="Notifications"
          aria-label={`Notifications, ${unread} unread`}
        >
          <Icon name="bell" size={16} />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-sev-critical px-1 text-[9px] font-bold text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="glass-panel w-80 border-foreground/10 bg-transparent p-0"
      >
        <div className="flex items-center justify-between border-b border-foreground/8 px-3 py-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Icon name="bell" size={14} /> Notifications
          </div>
          <button
            onClick={clearNotifications}
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        </div>
        <ul className="max-h-80 divide-y divide-foreground/8 overflow-y-auto">
          {notifications.length === 0 && (
            <li className="p-4 text-center text-xs text-muted-foreground">
              You're all caught up.
            </li>
          )}
          {notifications.map((n) => (
            <li key={n.id} className="flex items-start gap-3 p-3 text-xs">
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${tone[n.kind]}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{n.title}</span>
                  <span className="mono text-[10px] text-muted-foreground">
                    {n.ts}
                  </span>
                </div>
                {n.detail && (
                  <p className="mt-0.5 text-muted-foreground">{n.detail}</p>
                )}
                <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                  {n.source}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

interface QueuedFile {
  id: string;
  name: string;
  size: number;
  kind: string;
  progress: number;
}

const ACCEPTED = [".evtx", ".mft", ".usnjrnl", ".hive", ".reg", ".zip", ".kape"];

function detectKind(name: string): string {
  const n = name.toLowerCase();
  if (n.endsWith(".evtx")) return "Windows Event Log";
  if (n.endsWith(".mft")) return "NTFS MFT";
  if (n.endsWith(".usnjrnl") || n.includes("usnjrnl")) return "USN Journal";
  if (n.endsWith(".hive") || n.endsWith(".reg")) return "Registry hive";
  if (n.endsWith(".kape") || n.endsWith(".zip")) return "KAPE package";
  return "Artefact";
}

function iconForKind(kind: string): IconName {
  if (kind.includes("Event")) return "activity";
  if (kind.includes("MFT")) return "disk";
  if (kind.includes("USN")) return "clock";
  if (kind.includes("Registry")) return "registry";
  if (kind.includes("KAPE")) return "file";
  return "file";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function ImportDialog({ onClose }: { onClose: () => void }) {
  const [drag, setDrag] = useState(false);
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const cancelRef = useRef(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function add(files: FileList | File[]) {
    const next: QueuedFile[] = Array.from(files).map((f) => ({
      id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: f.name,
      size: f.size,
      kind: detectKind(f.name),
      progress: 0,
    }));
    setQueue((q) => [...q, ...next]);
  }

  function remove(id: string) {
    setQueue((q) => q.filter((f) => f.id !== id));
  }

  async function upload() {
    if (queue.length === 0 || uploading) return;
    setUploading(true);
    cancelRef.current = false;
    for (const f of queue) {
      for (let i = 5; i <= 100; i += 5) {
        if (cancelRef.current) break;
        await new Promise((r) => setTimeout(r, 40));
        setQueue((q) =>
          q.map((x) => (x.id === f.id ? { ...x, progress: i } : x)),
        );
      }
      if (cancelRef.current) break;
    }
    setUploading(false);
    if (cancelRef.current) {
      toast.message("Ingest cancelled");
      return;
    }
    const n = queue.length;
    onClose();
    setQueue([]);
    toast.success("Ingest queued (demo)", {
      description: `${n} artefact(s) staged.`,
    });
    useAppStore.getState().pushNotification({
      kind: "info",
      source: "Import",
      title: `${n} artefact(s) staged`,
      detail: "Custody ledger updated",
    });
  }

  function cancel() {
    if (uploading) {
      cancelRef.current = true;
      return;
    }
    setQueue([]);
    onClose();
  }

  const totalSize = queue.reduce((s, f) => s + f.size, 0);
  const overall =
    queue.length > 0
      ? Math.round(queue.reduce((s, f) => s + f.progress, 0) / queue.length)
      : 0;

  return (
    <DialogContent className="glass-panel border-white/15 bg-transparent p-0 sm:max-w-lg rounded-2xl overflow-hidden">
      <DialogHeader className="border-b border-white/10 bg-foreground/[0.03] px-6 pb-3 pt-5">
        <DialogTitle className="flex items-center gap-2">
          <Icon name="upload" size={16} /> Import artefacts
        </DialogTitle>
        <DialogDescription>
          .evtx · MFT · USN Journal · registry hives · KAPE packages.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 px-6 pb-6 pt-4">
        {/* Drop zone */}
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            if (e.dataTransfer.files.length) add(e.dataTransfer.files);
          }}
          className={`group relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center backdrop-blur-md transition ${
            drag
              ? "border-primary bg-primary/15"
              : "border-white/20 bg-white/[0.04] hover:bg-white/[0.08]"
          }`}
        >
          <p className="text-sm font-medium">Drop your evidence here</p>
          {/* Big circular upload button */}
          <span
            className={`relative grid h-20 w-20 place-items-center rounded-full border border-white/30 bg-gradient-to-b from-primary/30 to-primary/5 text-primary shadow-[0_10px_30px_-8px_color-mix(in_oklch,var(--color-primary)_45%,transparent)] backdrop-blur-md transition group-hover:scale-105 ${
              drag ? "scale-110" : ""
            }`}
          >
            <span
              aria-hidden
              className={`absolute inset-0 rounded-full ${
                drag ? "animate-ping bg-primary/30" : ""
              }`}
            />
            <Icon name="upload" size={26} />
          </span>
          <p className="text-xs text-muted-foreground">
            Custody ledger will hash-chain each artefact.
            <br />
            Accepts <span className="mono">{ACCEPTED.join(" · ")}</span>
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) add(e.target.files);
              e.currentTarget.value = "";
            }}
          />
        </label>

        {/* Queue */}
        {queue.length > 0 && (
          <ul className="max-h-56 space-y-2 overflow-y-auto rounded-2xl border border-white/15 bg-white/[0.03] p-2 backdrop-blur-md">
            {queue.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-2.5"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/20 text-primary ring-1 ring-primary/30">
                  <Icon name={iconForKind(f.kind)} size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{f.name}</p>
                    <button
                      onClick={() => remove(f.id)}
                      disabled={uploading}
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-white/10 hover:text-foreground disabled:opacity-40"
                      aria-label={`Remove ${f.name}`}
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                  <div className="mono mt-0.5 text-[11px] text-muted-foreground">
                    {f.kind} · {formatSize(f.size)}
                    {uploading && ` · ${f.progress}%`}
                  </div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                      style={{
                        width: `${f.progress}%`,
                        transition: "width 120ms linear",
                        boxShadow:
                          "0 0 10px color-mix(in oklch, var(--color-primary) 60%, transparent)",
                      }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}


        {/* Summary + actions */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="mono">
            {queue.length} file{queue.length === 1 ? "" : "s"} ·{" "}
            {formatSize(totalSize)}
          </span>
          {uploading && (
            <span className="mono text-primary">Uploading {overall}%</span>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button
            variant="ghost"
            className="rounded-full px-5"
            onClick={cancel}
          >
            {uploading ? "Cancel upload" : "Cancel"}
          </Button>
          <Button
            className="rounded-full bg-primary px-6 text-primary-foreground disabled:opacity-50"
            onClick={upload}
            disabled={queue.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <Icon name="refresh" size={14} className="mr-1.5 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Icon name="upload" size={14} className="mr-1.5" />
                Upload {queue.length > 0 && `(${queue.length})`}
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}


function ParticleField() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[2] overflow-hidden">
      {Array.from({ length: 24 }).map((_, i) => {
        const left = (i * 137.5) % 100;
        const top = (i * 83.1) % 100;
        const dur = 8 + ((i * 7) % 14);
        return (
          <span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-primary/25"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              animation: `float ${dur}s ease-in-out ${(i % 8) * -1.3}s infinite alternate`,
              opacity: 0.5,
            }}
          />
        );
      })}
      <style>{`@keyframes float { from { transform: translateY(0) } to { transform: translateY(-40px) } }`}</style>
    </div>
  );
}
