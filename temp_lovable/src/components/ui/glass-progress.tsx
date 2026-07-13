"use client";

/**
 * GlassProgress — reusable progress primitives adapted to the app's blur/glass
 * language. Nine variants mirror the reference sheet:
 *
 *  1. <SegmentedProgress />       segmented dashes
 *  2. <TooltipProgress />         bar + floating % tooltip
 *  3. <LabeledProgress />         bar + inline % label
 *  4. <StepDots steps />          numbered/checked step dots with connector
 *  5. <StatusProgress />          pill: % + label + eta
 *  6. <StepPills steps />         segmented step pills (past/current/future)
 *  7. <RingProgress />            SVG ring with center label
 *  8. <DotProgress />             tiny dot track with % tooltip
 *  9. <BasicProgress />           minimal glass bar (default)
 *
 * All variants use semantic tokens (--primary, --muted, --sev-*) and inherit
 * the glass aesthetic via border/inset styling. No hard-coded colors.
 */

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "danger";

const toneBar: Record<Tone, string> = {
  primary: "bg-primary",
  success: "bg-sev-success",
  warning: "bg-sev-warning",
  danger: "bg-sev-critical",
};
const toneRing: Record<Tone, string> = {
  primary: "text-primary",
  success: "text-sev-success",
  warning: "text-sev-warning",
  danger: "text-sev-critical",
};
const toneChip: Record<Tone, string> = {
  primary: "bg-primary text-primary-foreground",
  success: "bg-sev-success text-white",
  warning: "bg-sev-warning text-black",
  danger: "bg-sev-critical text-white",
};

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, v));
const track = "relative h-2 w-full overflow-hidden rounded-full bg-foreground/10 border border-white/10 shadow-[inset_0_1px_0_0_hsl(0_0%_100%/0.08)]";
const fill = "h-full rounded-full transition-[width] duration-500 ease-out";

/* ── 9. Basic bar ───────────────────────────────────────────── */
interface BasicProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  tone?: Tone;
  size?: "sm" | "md" | "lg";
}
export function BasicProgress({ value, tone = "primary", size = "md", className, ...p }: BasicProps) {
  const h = size === "sm" ? "h-1.5" : size === "lg" ? "h-3" : "h-2";
  return (
    <div
      role="progressbar"
      aria-valuenow={clamp(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(track, h, className)}
      {...p}
    >
      <div className={cn(fill, toneBar[tone], "shadow-[0_0_12px_-2px_currentColor]")} style={{ width: `${clamp(value)}%` }} />
    </div>
  );
}

/* ── 3. Labeled ─────────────────────────────────────────────── */
export function LabeledProgress({ value, tone = "primary", label, className }: BasicProps & { label?: React.ReactNode }) {
  const v = clamp(value);
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="truncate">{label}</span>
        <span className="tabular-nums font-medium text-foreground">{Math.round(v)}%</span>
      </div>
      <BasicProgress value={v} tone={tone} />
    </div>
  );
}

/* ── 2. Tooltip ─────────────────────────────────────────────── */
export function TooltipProgress({ value, tone = "primary", className }: BasicProps) {
  const v = clamp(value);
  return (
    <div className={cn("relative pt-7", className)}>
      <div
        className="absolute -top-0 -translate-x-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums shadow-md"
        style={{ left: `${v}%` }}
      >
        <span className={cn("inline-block rounded-md px-1.5 py-0.5", toneChip[tone])}>{Math.round(v)}%</span>
        <span
          className={cn("absolute left-1/2 top-full h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45", toneChip[tone])}
        />
      </div>
      <div className="relative">
        <BasicProgress value={v} tone={tone} />
        <span
          className={cn(
            "absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-background shadow",
            toneRing[tone],
            "border-current",
          )}
          style={{ left: `${v}%` }}
        />
      </div>
    </div>
  );
}

/* ── 1. Segmented ───────────────────────────────────────────── */
interface SegProps { value: number; segments?: number; tone?: Tone; className?: string }
export function SegmentedProgress({ value, segments = 8, tone = "primary", className }: SegProps) {
  const filled = Math.round((clamp(value) / 100) * segments);
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {Array.from({ length: segments }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            i < filled ? cn(toneBar[tone], "shadow-[0_0_8px_-1px_currentColor]") : "bg-foreground/10 border border-white/5",
          )}
        />
      ))}
    </div>
  );
}

/* ── 5. Status pill ─────────────────────────────────────────── */
interface StatusProps { value: number; label?: string; eta?: string; tone?: Tone; className?: string }
export function StatusProgress({ value, label, eta, tone = "primary", className }: StatusProps) {
  const v = clamp(value);
  return (
    <div className={cn("glass-panel rounded-full px-4 py-2", className)}>
      <div className="flex items-center gap-3 text-xs">
        <span className={cn("font-semibold tabular-nums", toneRing[tone])}>{Math.round(v)}%</span>
        <span className="flex-1 truncate text-foreground/80">{label}</span>
        {eta ? <span className="text-muted-foreground tabular-nums">{eta}</span> : null}
      </div>
      <div className="mt-1.5">
        <BasicProgress value={v} tone={tone} size="sm" />
      </div>
    </div>
  );
}

/* ── 6/7. Step pills ────────────────────────────────────────── */
interface StepPillsProps { steps: string[]; current: number; tone?: Tone; className?: string }
export function StepPills({ steps, current, tone = "primary", className }: StepPillsProps) {
  return (
    <div className={cn("glass-pill flex items-center gap-1 rounded-full p-1", className)}>
      {steps.map((label, i) => {
        const isCurrent = i === current;
        const isPast = i < current;
        return (
          <div
            key={label}
            className={cn(
              "flex-1 rounded-full px-3 py-1.5 text-center text-xs font-medium transition-colors",
              isCurrent && cn(toneChip[tone], "shadow-md"),
              isPast && "bg-foreground/15 text-foreground",
              !isCurrent && !isPast && "text-muted-foreground",
            )}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}

/* ── 4. Step dots (numbered/checked) ────────────────────────── */
interface StepDotsProps { total: number; current: number; tone?: Tone; className?: string }
export function StepDots({ total, current, tone = "primary", className }: StepDotsProps) {
  return (
    <div className={cn("flex items-center gap-0", className)}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <React.Fragment key={i}>
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[11px] font-semibold transition-colors",
                done && cn(toneChip[tone], "border-transparent"),
                active && cn("border-current bg-background", toneRing[tone]),
                !done && !active && "border-white/15 bg-foreground/5 text-muted-foreground",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </span>
            {i < total - 1 ? (
              <span className={cn("h-0.5 w-6 sm:w-10", i < current ? toneBar[tone] : "bg-foreground/15")} />
            ) : null}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── 8. Ring ────────────────────────────────────────────────── */
interface RingProps { value: number; size?: number; stroke?: number; tone?: Tone; label?: React.ReactNode; className?: string }
export function RingProgress({ value, size = 56, stroke = 6, tone = "primary", label, className }: RingProps) {
  const v = clamp(value);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-foreground/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn("fill-none transition-[stroke-dashoffset] duration-500 ease-out", toneRing[tone])}
          stroke="currentColor"
        />
      </svg>
      <span className="absolute text-[10px] font-semibold tabular-nums text-foreground">
        {label ?? `${Math.round(v)}%`}
      </span>
    </div>
  );
}

/* ── 9. Dot track ───────────────────────────────────────────── */
interface DotProps { value: number; dots?: number; tone?: Tone; showTooltip?: boolean; className?: string }
export function DotProgress({ value, dots = 12, tone = "primary", showTooltip = true, className }: DotProps) {
  const v = clamp(value);
  const filled = Math.round((v / 100) * dots);
  return (
    <div className={cn("relative pt-6", className)}>
      {showTooltip ? (
        <span
          className={cn("absolute -top-0 -translate-x-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums shadow", toneChip[tone])}
          style={{ left: `${v}%` }}
        >
          {Math.round(v)}%
        </span>
      ) : null}
      <div className="flex items-center justify-between gap-1">
        {Array.from({ length: dots }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-all",
              i < filled ? cn(toneBar[tone], "shadow-[0_0_6px_-1px_currentColor]") : "bg-foreground/15",
              i === filled - 1 && "scale-125",
            )}
          />
        ))}
      </div>
    </div>
  );
}
