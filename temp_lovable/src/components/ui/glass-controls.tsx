"use client";

/**
 * GlassControls — reusable form/UI primitives adapted to the app's blur/glass
 * language. Mirrors the reference sheet (input, password, select, buttons,
 * checkbox, radio, switch, tabs, accept/decline, tooltip label, pagination).
 *
 * These wrap the existing shadcn primitives so behavior/accessibility stay
 * intact — only visuals change: glass-panel surfaces, `--primary`/`--sev-*`
 * accents, focus ring on the floating label border, and inset highlights.
 *
 * Usage:
 *   <GlassField label="Full name"><GlassInput defaultValue="John Doe" /></GlassField>
 *   <GlassButton>Button 1</GlassButton>
 *   <GlassButton variant="soft">Button 2</GlassButton>
 *   <AcceptButton>Accept</AcceptButton> <DeclineButton>Decline</DeclineButton>
 *   <GlassTabs tabs={["Tab 1","Tab 2","Tab 3"]} value={0} onChange={...} />
 *   <GlassPagination page={3} total={7} onChange={...} />
 */

import * as React from "react";
import { Check, X, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/* ── Field wrapper w/ floating label cut on the border ───────── */
interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  htmlFor?: string;
  tone?: "default" | "success" | "danger";
}
export function GlassField({ label, htmlFor, tone = "default", className, children, ...rest }: FieldProps) {
  const ring = tone === "success" ? "border-sev-success/60" : tone === "danger" ? "border-sev-critical/60" : "border-primary/40";
  return (
    <div className={cn("relative", className)} {...rest}>
      <div className={cn("glass-panel rounded-2xl border px-3.5 pt-4 pb-2.5 transition-colors focus-within:border-primary/70", ring)}>
        <label
          htmlFor={htmlFor}
          className="pointer-events-none absolute -top-2 left-3 bg-background/60 px-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/80 backdrop-blur-md rounded"
        >
          {label}
        </label>
        {children}
      </div>
    </div>
  );
}

/* ── Input ──────────────────────────────────────────────────── */
export const GlassInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...p }, ref) => (
    <Input
      ref={ref}
      className={cn(
        "h-8 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70",
        className,
      )}
      {...p}
    />
  ),
);
GlassInput.displayName = "GlassInput";

/* ── Buttons (solid + soft + ghost) ─────────────────────────── */
type ButtonVariant = "solid" | "soft" | "ghost";
type ButtonTone = "primary" | "success" | "danger" | "neutral";
interface GBtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  size?: "sm" | "md" | "lg";
}
const toneMap = {
  primary: { solid: "bg-primary text-primary-foreground hover:bg-primary/90", soft: "bg-primary/15 text-primary hover:bg-primary/25 border border-primary/25", ghost: "text-primary hover:bg-primary/10" },
  success: { solid: "bg-sev-success text-white hover:bg-sev-success/90", soft: "bg-sev-success/12 text-sev-success hover:bg-sev-success/20 border border-sev-success/30", ghost: "text-sev-success hover:bg-sev-success/10" },
  danger:  { solid: "bg-sev-critical text-white hover:bg-sev-critical/90", soft: "bg-sev-critical/12 text-sev-critical hover:bg-sev-critical/20 border border-sev-critical/30", ghost: "text-sev-critical hover:bg-sev-critical/10" },
  neutral: { solid: "bg-foreground text-background hover:bg-foreground/90", soft: "bg-foreground/10 text-foreground hover:bg-foreground/15 border border-white/15", ghost: "text-foreground hover:bg-foreground/10" },
} as const;
export const GlassButton = React.forwardRef<HTMLButtonElement, GBtnProps>(
  ({ variant = "solid", tone = "primary", size = "md", className, ...p }, ref) => {
    const sz = size === "sm" ? "h-8 px-3 text-xs" : size === "lg" ? "h-11 px-6 text-sm" : "h-10 px-5 text-sm";
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-sm",
          sz,
          toneMap[tone][variant],
          variant === "solid" && "shadow-[0_6px_20px_-8px_currentColor]",
          className,
        )}
        {...p}
      />
    );
  },
);
GlassButton.displayName = "GlassButton";

export const AcceptButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...p }, ref) => (
    <GlassButton ref={ref} tone="success" variant="soft" className={cn("rounded-xl", className)} {...p}>
      <Check className="h-4 w-4" />
      {children ?? "Accept"}
    </GlassButton>
  ),
);
AcceptButton.displayName = "AcceptButton";

export const DeclineButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...p }, ref) => (
    <GlassButton ref={ref} tone="danger" variant="soft" className={cn("rounded-xl", className)} {...p}>
      <X className="h-4 w-4" />
      {children ?? "Decline"}
    </GlassButton>
  ),
);
DeclineButton.displayName = "DeclineButton";

/* ── Checkbox / Radio / Switch (styled labels) ──────────────── */
export function GlassCheck({ id, label, ...p }: React.ComponentProps<typeof Checkbox> & { label: React.ReactNode }) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
      <Checkbox id={id} className="h-4 w-4 rounded-[5px] border-white/25 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-primary-foreground" {...p} />
      {label}
    </label>
  );
}
export function GlassRadio({ value, label }: { value: string; label: React.ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
      <RadioGroupItem value={value} className="h-4 w-4 border-white/25 text-primary" />
      {label}
    </label>
  );
}
export { RadioGroup as GlassRadioGroup };
export function GlassSwitch({ id, label, ...p }: React.ComponentProps<typeof Switch> & { label: React.ReactNode }) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-foreground">
      <Switch id={id} className="data-[state=checked]:bg-primary" {...p} />
      {label}
    </label>
  );
}

/* ── Segmented Tabs ─────────────────────────────────────────── */
interface TabsProps { tabs: string[]; value: number; onChange: (i: number) => void; className?: string }
export function GlassTabs({ tabs, value, onChange, className }: TabsProps) {
  return (
    <div className={cn("glass-pill inline-flex items-center gap-1 rounded-full p-1", className)} role="tablist">
      {tabs.map((t, i) => (
        <button
          key={t}
          role="tab"
          aria-selected={i === value}
          onClick={() => onChange(i)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
            i === value ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ── Tooltip helper ─────────────────────────────────────────── */
export function GlassTooltip({ children, content, side = "top" }: { children: React.ReactNode; content: React.ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className="glass-panel border-white/15 text-xs">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
export function InfoDot({ tip, tone = "warning" }: { tip: React.ReactNode; tone?: "warning" | "primary" | "danger" }) {
  const bg = tone === "warning" ? "bg-sev-warning text-black" : tone === "danger" ? "bg-sev-critical text-white" : "bg-primary text-primary-foreground";
  return (
    <GlassTooltip content={tip}>
      <button type="button" className={cn("grid h-5 w-5 place-items-center rounded-full shadow", bg)} aria-label="More info">
        <Info className="h-3 w-3" />
      </button>
    </GlassTooltip>
  );
}

/* ── Pagination ─────────────────────────────────────────────── */
interface PagProps { page: number; total: number; onChange: (p: number) => void; className?: string }
export function GlassPagination({ page, total, onChange, className }: PagProps) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <nav className={cn("glass-pill inline-flex items-center gap-1 rounded-full p-1", className)} aria-label="Pagination">
      <button onClick={() => onChange(Math.max(1, page - 1))} disabled={page <= 1} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "grid h-8 min-w-8 place-items-center rounded-full px-2 text-xs font-semibold transition-colors",
            p === page ? "bg-primary text-primary-foreground shadow" : "text-foreground/80 hover:bg-foreground/10",
          )}
        >
          {p}
        </button>
      ))}
      <button onClick={() => onChange(Math.min(total, page + 1))} disabled={page >= total} className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
