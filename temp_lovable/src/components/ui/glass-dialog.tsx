"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Lightbulb, CheckCircle2, AlertTriangle, CalendarClock } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * GlassDialog — tinted modal variants (default / info / success / error / action)
 * adapted to the app's blur/glass design language.
 *
 * Usage:
 *   <GlassDialog>
 *     <GlassDialogTrigger asChild><Button>Open</Button></GlassDialogTrigger>
 *     <GlassDialogContent variant="success">
 *       <GlassDialogHeader variant="success" title="Successful import" />
 *       <GlassDialogBody variant="success" icon>
 *         <GlassDialogTitle>All artifacts ingested</GlassDialogTitle>
 *         <GlassDialogDescription>...</GlassDialogDescription>
 *       </GlassDialogBody>
 *       <GlassDialogFooter>
 *         <Button variant="ghost">Cancel</Button>
 *         <Button>Continue</Button>
 *       </GlassDialogFooter>
 *     </GlassDialogContent>
 *   </GlassDialog>
 */

type Variant = "default" | "info" | "success" | "error" | "action";

const headerStyles: Record<Variant, string> = {
  default: "bg-foreground/[0.06] text-muted-foreground border-b border-white/10",
  info: "bg-primary/15 text-primary border-b border-primary/25",
  success: "bg-sev-success/15 text-sev-success border-b border-sev-success/25",
  error: "bg-sev-critical/15 text-sev-critical border-b border-sev-critical/25",
  action: "bg-primary/15 text-primary border-b border-primary/25",
};

const iconRingStyles: Record<Variant, string> = {
  default: "border-white/25 text-muted-foreground",
  info: "border-primary/40 text-primary",
  success: "border-sev-success/50 text-sev-success",
  error: "border-sev-critical/50 text-sev-critical",
  action: "border-primary/40 text-primary",
};

const titleStyles: Record<Variant, string> = {
  default: "text-foreground",
  info: "text-primary",
  success: "text-sev-success",
  error: "text-sev-critical",
  action: "text-primary",
};

const contentVariants = cva(
  "glass-panel fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] overflow-hidden rounded-2xl p-0 shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
  {
    variants: {
      variant: {
        default: "",
        info: "ring-1 ring-inset ring-primary/20",
        success: "ring-1 ring-inset ring-sev-success/25",
        error: "ring-1 ring-inset ring-sev-critical/25",
        action: "ring-1 ring-inset ring-primary/20",
      } satisfies Record<Variant, string>,
    },
    defaultVariants: { variant: "default" },
  },
);

const GlassDialog = Dialog;
const GlassDialogTrigger = DialogTrigger;
const GlassDialogClose = DialogClose;

const GlassDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof contentVariants>
>(({ className, variant, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="backdrop-blur-md bg-black/40" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(contentVariants({ variant }), className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
GlassDialogContent.displayName = "GlassDialogContent";

interface GlassDialogHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: Variant;
  title?: React.ReactNode;
  showClose?: boolean;
}

const GlassDialogHeader = ({
  className,
  variant = "default",
  title,
  showClose = true,
  children,
  ...props
}: GlassDialogHeaderProps) => (
  <div
    className={cn(
      "flex items-center justify-between gap-3 px-5 py-3 text-xs font-medium tracking-wide",
      headerStyles[variant],
      className,
    )}
    {...props}
  >
    <span className="truncate">{title ?? children}</span>
    {showClose ? (
      <DialogPrimitive.Close className="rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    ) : null}
  </div>
);
GlassDialogHeader.displayName = "GlassDialogHeader";

const defaultIcons: Record<Variant, React.ComponentType<{ className?: string }>> = {
  default: Lightbulb,
  info: Lightbulb,
  success: CheckCircle2,
  error: AlertTriangle,
  action: CalendarClock,
};

interface GlassDialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
  icon?: boolean | React.ReactNode;
}

const GlassDialogBody = ({
  className,
  variant = "default",
  icon = true,
  children,
  ...props
}: GlassDialogBodyProps) => {
  const Icon = defaultIcons[variant];
  const showIcon = icon !== false;
  const custom = typeof icon !== "boolean" ? icon : null;
  return (
    <div className={cn("flex gap-4 px-5 py-5", className)} {...props}>
      {showIcon ? (
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border bg-foreground/5",
            iconRingStyles[variant],
          )}
        >
          {custom ?? <Icon className="h-6 w-6" />}
        </div>
      ) : null}
      <div className="min-w-0 flex-1 space-y-1.5">{children}</div>
    </div>
  );
};
GlassDialogBody.displayName = "GlassDialogBody";

interface GlassDialogTitleProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> {
  variant?: Variant;
}

const GlassDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  GlassDialogTitleProps
>(({ className, variant = "default", ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-tight tracking-tight", titleStyles[variant], className)}
    {...props}
  />
));
GlassDialogTitle.displayName = "GlassDialogTitle";

const GlassDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm leading-relaxed text-muted-foreground", className)}
    {...props}
  />
));
GlassDialogDescription.displayName = "GlassDialogDescription";

const GlassDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-end gap-2 border-t border-white/10 bg-foreground/[0.03] px-5 py-3",
      className,
    )}
    {...props}
  />
);
GlassDialogFooter.displayName = "GlassDialogFooter";

export {
  GlassDialog,
  GlassDialogTrigger,
  GlassDialogClose,
  GlassDialogContent,
  GlassDialogHeader,
  GlassDialogBody,
  GlassDialogTitle,
  GlassDialogDescription,
  GlassDialogFooter,
};
export type { Variant as GlassDialogVariant };
