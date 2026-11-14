import { Check, Star } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Stars({ value, size = "sm", className }: { value: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const s = size === "lg" ? "size-7" : size === "md" ? "size-5" : "size-3.5";
  return (
    <span className={cn("inline-flex gap-0.5", className)} dir="ltr" aria-label={`${value.toFixed(1)} من 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(s, i <= Math.round(value) ? "fill-primary text-primary" : "text-muted-foreground/30")} />
      ))}
    </span>
  );
}

export function StarInput({ value, onChange, label, size = "md" }: { value: number; onChange: (n: number) => void; label: string; size?: "md" | "lg" }) {
  const s = size === "lg" ? "size-10" : "size-7";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <span className="inline-flex gap-1" dir="ltr" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i} من 5`} onClick={() => onChange(i)} className="transition-transform active:scale-90">
            <Star className={cn(s, i <= value ? "fill-primary text-primary drop-shadow-[0_0_8px_var(--primary)]" : "text-muted-foreground/30")} />
          </button>
        ))}
      </span>
    </div>
  );
}

export function StepBar({ step, total, labels }: { step: number; total: number; labels?: string[] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-primary">الخطوة {step + 1} من {total}</span>
        {labels?.[step] && <span className="text-muted-foreground">{labels[step]}</span>}
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i <= step ? "bg-gradient-red" : "bg-muted")} />
        ))}
      </div>
    </div>
  );
}

export function ChoiceCard({ selected, onClick, icon, title, desc, badge, className }: {
  selected: boolean; onClick: () => void; icon?: ReactNode; title: string; desc?: string; badge?: string; className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "surface relative flex w-full items-center gap-4 rounded-2xl p-4 text-right transition-all",
        selected ? "border-primary/70 bg-accent/40 ring-1 ring-primary/40" : "hover:border-border-strong",
        className,
      )}
    >
      {icon && (
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors", selected ? "bg-gradient-red text-primary-foreground shadow-glow" : "bg-secondary text-foreground")}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-display font-semibold">{title}</span>
        {desc && <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{desc}</span>}
      </span>
      {badge && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">{badge}</span>}
      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-primary bg-primary text-primary-foreground" : "border-border-strong")}>
        {selected && <Check className="size-3" />}
      </span>
    </button>
  );
}

export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "rounded-full border px-3.5 py-2 text-xs font-semibold transition-all",
        on ? "border-primary bg-primary text-primary-foreground shadow-glow" : "border-border bg-secondary/60 text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function Field({ label, hint, children, error, group }: { label: string; hint?: string | undefined; children: ReactNode; error?: string | undefined; group?: boolean }) {
  const head = (
    <span className="flex items-baseline justify-between text-xs font-semibold text-muted-foreground">
      <span>{label}</span>
      {hint && <span className="font-normal opacity-70">{hint}</span>}
    </span>
  );
  const tail = error && <span className="block text-xs text-destructive">{error}</span>;
  // Groups of buttons must not sit inside a <label>, which would hand its text to the first button.
  if (group) return <div role="group" aria-label={label} className="block space-y-1.5">{head}{children}{tail}</div>;
  return <label className="block space-y-1.5">{head}{children}{tail}</label>;
}

export function SelectBox({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder: string }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 w-full appearance-none rounded-xl border border-input bg-elevated/60 px-4 text-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export function StepTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-bold">{title}</h2>
      {desc && <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>}
    </div>
  );
}

export function WizardNav({ onBack, onNext, nextLabel = "التالي", disabled, busy, hideBack }: {
  onBack?: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean; busy?: boolean; hideBack?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      {!hideBack && onBack && (
        <Button variant="subtle" size="lg" onClick={onBack} type="button">رجوع</Button>
      )}
      <Button variant="hero" size="lg" className="flex-1" onClick={onNext} disabled={disabled || busy} type="button">
        {busy ? "جارٍ الإرسال..." : nextLabel}
      </Button>
    </div>
  );
}

export function SuccessCard({ title, desc, onBack, backLabel = "رجوع" }: { title: string; desc?: string; onBack?: () => void; backLabel?: string }) {
  return (
    <div className="surface animate-rise space-y-5 rounded-3xl p-8 text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-gradient-red text-primary-foreground shadow-glow">
        <Check className="size-10" strokeWidth={2.5} />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold">{title}</h2>
        {desc && <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>}
      </div>
      {onBack && <Button variant="glass" size="lg" onClick={onBack}>{backLabel}</Button>}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("surface rounded-3xl p-5", className)}>{children}</div>;
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : "حدث خطأ، حاول مجدداً");
