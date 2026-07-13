import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAppStore } from "@/lib/store";
import type { UserProfile } from "@/lib/types";

const ROLES = [
  "Lead DFIR Analyst",
  "Incident Responder",
  "Threat Hunter",
  "Malware Analyst",
  "SOC Analyst",
  "Forensic Investigator",
];

const TIMEZONES = [
  "UTC",
  "Europe/Madrid",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
  "Australia/Sydney",
];

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(80, "Name must be under 80 characters"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email")
    .max(255, "Email too long"),
  role: z.string().trim().min(1, "Role is required").max(60),
  phone: z
    .string()
    .trim()
    .max(30, "Phone too long")
    .regex(/^$|^[+()\-\s\d]{6,30}$/i, "Invalid phone")
    .optional()
    .or(z.literal("")),
  timezone: z.string().trim().min(1).max(60),
  bio: z.string().trim().max(280, "Bio must be under 280 characters"),
});

type FieldErrors = Partial<Record<keyof UserProfile, string>>;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: Props) {
  const { profile, setProfile } = useAppStore();
  const [form, setForm] = useState<UserProfile>(profile);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (open) {
      setForm(profile);
      setErrors({});
    }
  }, [open, profile]);

  function update<K extends keyof UserProfile>(k: K, v: UserProfile[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof UserProfile | undefined;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      toast.error("Check the highlighted fields");
      return;
    }
    setProfile(parsed.data as UserProfile);
    toast.success("Profile saved", {
      description: "Your analyst details were updated.",
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-foreground/10 bg-transparent sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="user" size={16} /> Analyst profile
          </DialogTitle>
          <DialogDescription>
            Fill in your investigator details. Used in report signatures and
            custody logs.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-3" noValidate>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={80}
                autoComplete="name"
                placeholder="Ada Lovelace"
                className="border-border bg-foreground/5"
              />
            </Field>
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                maxLength={255}
                autoComplete="email"
                placeholder="analyst@stormbreaker.io"
                className="mono border-border bg-foreground/5"
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Role" error={errors.role}>
              <Select
                value={form.role}
                onValueChange={(v) => update("role", v)}
              >
                <SelectTrigger className="border-border bg-foreground/5">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-foreground/10 bg-transparent">
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Phone (optional)" error={errors.phone}>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                maxLength={30}
                inputMode="tel"
                autoComplete="tel"
                placeholder="+34 600 000 000"
                className="mono border-border bg-foreground/5"
              />
            </Field>
          </div>

          <Field label="Timezone" error={errors.timezone}>
            <Select
              value={form.timezone}
              onValueChange={(v) => update("timezone", v)}
            >
              <SelectTrigger className="border-border bg-foreground/5">
                <SelectValue placeholder="Timezone" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-foreground/10 bg-transparent">
                {TIMEZONES.map((t) => (
                  <SelectItem key={t} value={t} className="mono">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field
            label="Bio"
            error={errors.bio}
            hint={`${form.bio.length}/280`}
          >
            <Textarea
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Specialties, certifications, on-call windows…"
              className="border-border bg-foreground/5"
            />
          </Field>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground">
              <Icon name="check" size={14} className="mr-1.5" /> Save profile
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </Label>
        {hint && (
          <span className="mono text-[10px] text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
      {error && (
        <p className="text-[11px] text-sev-critical">{error}</p>
      )}
    </div>
  );
}
