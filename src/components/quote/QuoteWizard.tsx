import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BatteryCharging, Building2, Factory, Sprout, Fuel, ChevronDown, Gauge, Home, LayoutGrid, Moon, Network, Receipt, Sun, SunMoon, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ChoiceCard, Field, Panel, SelectBox, StepBar, StepTitle, SuccessCard, WizardNav, errMsg } from "@/components/acts/kit";
import { sendQuoteRequest } from "@/lib/acts.functions";
import { GOVERNORATES } from "@/lib/acts-data";
import { catalogQuery } from "@/lib/queries";
import { batteryOf, dailyNeed, dailyProduction, panelCount, presetPrice, quoteTiers, type DayNight, type Preset } from "@/lib/sizing";
import { cn } from "@/lib/utils";
import { QuoteTableDialog } from "./QuoteTableDialog";

const LABELS = ["نوع المنظومة", "طريقة التقدير", "نسبة التشغيل", "المنظومة", "بيانات الشراء", "طريقة الدفع"];
const NIGHT: { k: DayNight; t: string; d: string; icon: typeof Sun }[] = [
  { k: 50, t: "50% ليل / 50% نهار", d: "متوازن", icon: SunMoon },
  { k: 30, t: "30% ليل / 70% نهار", d: "بطاريات أقل", icon: Sun },
  { k: 70, t: "70% ليل / 30% نهار", d: "بطاريات أكبر", icon: Moon },
];
const PAYS = [
  { k: "cod", t: "الدفع عند الاستلام", d: "نقداً عند التسليم", icon: Receipt },
  { k: "net", t: "التحويل عبر شبكة محلية", d: "مثل النجم", icon: Network },
  { k: "wallet", t: "التحويل عبر المحافظ الإلكترونية", d: "جيب، كاش، ون كاش", icon: Zap },
] as const;
const fmt = (n: number, d = 1) => n.toLocaleString("en-US", { maximumFractionDigits: d });

const SYSTEMS = [
  { id: "res", title: "النظام السكني", tags: ["منازل", "شقق", "استراحات"], icon: Home, glass: "glass-silver", halo: "bg-amber-400/20", bar: "bg-silver", iconBg: "bg-silver text-background" },
  { id: "com", title: "النظام التجاري", tags: ["محلات", "مكاتب", "فنادق"], icon: Building2, glass: "glass-blue", halo: "bg-blue/25", bar: "bg-gradient-blue", iconBg: "bg-gradient-blue text-primary-foreground" },
  { id: "ind", title: "النظام الصناعي", tags: ["مصانع", "ورش", "معامل"], icon: Factory, glass: "glass-red", halo: "bg-primary/30", bar: "bg-gradient-red", iconBg: "bg-gradient-red shadow-glow text-primary-foreground" },
  { id: "agr", title: "النظام الزراعي", tags: ["مزارع", "آبار", "منظومات ري"], icon: Sprout, glass: "glass-blue", halo: "bg-emerald-400/20", bar: "bg-emerald-500", iconBg: "bg-emerald-600 text-primary-foreground" },
] as const;

export function QuoteWizard() {
  const { data: cat } = useQuery(catalogQuery());
  const price = cat?.kwh_price ?? 0;
  const presets = cat?.presets ?? [];
  const submit = useServerFn(sendQuoteRequest);

  const [step, setStep] = useState(0);
  const [path, setPath] = useState<"res" | "com" | "ind" | "agr" | null>(null);
  const [method, setMethod] = useState<"bill" | "kwh" | "diesel" | "preset">("bill");
  const [amount, setAmount] = useState("");
  const [night, setNight] = useState<DayNight | null>(null);
  const [pick, setPick] = useState<string>("");
  const reports: ("pvsyst" | "sld")[] = [];
  const [pay, setPay] = useState("");
  const [c, setC] = useState({ name: "", phone: "", gov: "", city: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const direct = method === "preset";
  const resPresets = useMemo(() => presets.filter((p) => p.type === "res"), [presets]);
  const directPick = resPresets.find((p) => p.title === pick);
  const v = Number(amount);
  const need = v > 0 && price > 0 ? (method === "diesel" ? v / 0.27 / 30 : method === "preset" ? 0 : dailyNeed(method, v, price)) : 0;
  const calcPath = path === "res" ? "res" : "com";
  const tiers = useMemo(() => (path && night && v > 0 && method !== "preset" ? quoteTiers(presets, calcPath, method, v, night, price) : null), [presets, path, calcPath, method, v, night, price]);
  const options = useMemo(() => {
    if (!tiers) return [] as { key: string; label: string; desc: string; badge?: string; p: Preset }[];
    return [
      { key: "rec", label: "", desc: "", p: tiers.rec },
      ...(tiers.low ? [{ key: "low", label: "خيار السعر الاقتصادي", desc: "تكلفة أقل", p: tiers.low }] : []),
      ...(tiers.high ? [{ key: "high", label: "أداء أعلى وسعة بطاريات أكبر", desc: "تخزين أكبر", p: tiers.high }] : []),
    ];
  }, [tiers]);
  const chosen = direct ? (directPick ? { key: "direct", label: "منظومة جاهزة", desc: "", p: directPick } : undefined) : options.find((o) => o.p.title === pick);

  const reset = () => {
    setStep(0); setPath(null); setAmount(""); setNight(null); setPick(""); setPay(""); setDone(false); setErr("");
  };

  if (done)
    return (
      <SuccessCard
        title="تم تأكيد طلب الشراء"
        desc="سيتواصل معك قسم المبيعات قريباً لتأكيد العنوان وموعد التسليم."
        onBack={reset}
        backLabel="طلب عرض جديد"
      />
    );

  const phoneOk = c.phone.replace(/\D/g, "").length >= 9;

  return (
    <div className="space-y-5">
      <StepBar step={step} total={LABELS.length} labels={LABELS} />
      <Panel className="animate-rise space-y-5" key={step}>
        {step === 0 && (
          <>
            <StepTitle title="ما نوع النظام؟" />
            <div className="space-y-2.5">
              {SYSTEMS.map((x, i) => {
                const on = path === x.id;
                return (
                  <button key={x.id} type="button" aria-pressed={on} style={{ animationDelay: `${i * 70}ms` }}
                    onClick={() => { setPath(x.id); if (x.id === "res" ? method === "diesel" : method === "preset") setMethod("bill"); setStep(1); }}
                    className={cn(x.glass, "animate-rise group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl p-3.5 text-right transition-all active:scale-[0.98]", on && "ring-2 ring-primary/70 shadow-glow")}>
                    <span className={cn("pointer-events-none absolute -left-8 -top-8 size-28 rounded-full blur-2xl", x.halo)} />
                    <span className={cn("absolute inset-y-0 right-0 w-1", x.bar)} />
                    <span className={cn("relative flex size-12 shrink-0 items-center justify-center rounded-xl", x.iconBg)}><x.icon className="size-6" /></span>
                    <span className="relative min-w-0 flex-1">
                      <span className="block text-[15px] font-bold">{x.title}</span>
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        {x.tags.map((t) => <span key={t} className="rounded-full border border-border-strong bg-background/40 px-2 py-0.5 text-[10px] text-silver">{t}</span>)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <StepTitle title="تقدير الاستهلاك شهرياً؟" />
            <div className="grid grid-cols-3 gap-3">
              {([["bill", "المبلغ", Receipt], ["kwh", "الاستهلاك بالكيلوواط", Gauge], ["diesel", "استهلاك الديزل", Fuel], ["preset", "المنظومات الجاهزة", LayoutGrid]] as const).filter(([k]) => (path === "res" ? k !== "diesel" : k !== "preset")).map(([k, l, I]) => (
                <button key={k} type="button" onClick={() => { setMethod(k); setPick(""); }} aria-pressed={method === k}
                  className={cn("surface flex flex-col items-center gap-2 rounded-2xl p-4 text-sm font-semibold transition-all", method === k ? "border-primary/70 bg-accent/40 text-foreground ring-1 ring-primary/40" : "text-muted-foreground")}>
                  <I className={cn("size-6", method === k && "text-primary")} />{l}
                </button>
              ))}
            </div>
            {direct ? (
              <div className="space-y-2">
                {cat && !cat.ok && <p className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">{cat.error}</p>}
                {cat?.ok && !resPresets.length && <p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">لا توجد منظومات جاهزة حالياً.</p>}
                {resPresets.map((p) => (
                  <SystemCard key={p.title} o={{ key: "direct", label: p.group, desc: "منظومة جاهزة", p }} selected={pick === p.title} onSelect={() => { setPick(p.title); setStep(4); }} />
                ))}
                <WizardNav onBack={() => setStep(0)} onNext={() => setStep(4)} disabled={!directPick} />
              </div>
            ) : (<>
            <Field label={method === "bill" ? "مبلغ الفاتورة الشهرية" : method === "kwh" ? "الاستهلاك الشهري" : "استهلاك الديزل الشهري"} hint={method === "bill" ? "ريال يمني" : method === "kwh" ? "كيلوواط ساعة" : "لتر ديزل"}>
              <div dir="ltr" className="flex h-16 items-center gap-2 rounded-2xl border border-silver/30 bg-gradient-to-b from-background/90 to-secondary/60 pl-2 pr-3 shadow-inner backdrop-blur-xl transition focus-within:border-blue focus-within:shadow-[0_0_24px_-4px_var(--color-blue)] focus-within:ring-4 focus-within:ring-blue/20">
                <span className="shrink-0 whitespace-nowrap rounded-full border border-silver/40 bg-gradient-to-b from-secondary to-background px-3 py-1.5 text-[11px] font-bold tracking-wide text-silver shadow-sm">{method === "bill" ? "ر.ي / شهر" : method === "kwh" ? "kWh / شهر" : "لتر / شهر"}</span>
                <input inputMode="decimal" dir="ltr" className="h-full min-w-0 flex-1 bg-transparent text-right font-display text-3xl font-extrabold tracking-wide text-foreground outline-none placeholder:text-muted-foreground" placeholder="0" value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/[^\d.]/g, ""))} />
                {amount && <button type="button" aria-label="مسح" onClick={() => setAmount("")} className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground transition hover:text-foreground">✕</button>}
              </div>
            </Field>
            {v > 0 && (
              <div className="flex items-center gap-3 rounded-2xl bg-accent/40 p-3 text-sm">
                <Zap className="size-5 text-blue" />
                <span>احتياجك اليومي التقريبي <b className="font-display">{fmt(need)}</b> كيلوواط ساعة</span>
              </div>
            )}
            <WizardNav onBack={() => setStep(0)} onNext={() => setStep(2)} disabled={!(v > 0)} />
            </>)}
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle title="كيف يتوزع استهلاكك بين الليل والنهار؟" />
            <div className="space-y-3">
              {NIGHT.map((n) => (
                <ChoiceCard key={n.k} selected={night === n.k} onClick={() => { setNight(n.k); setPick(""); setStep(3); }} icon={<n.icon className="size-6" />} title={n.t} desc={n.d} />
              ))}
            </div>
            <WizardNav onBack={() => setStep(1)} onNext={() => night && setStep(3)} disabled={!night} />
          </>
        )}

        {step === 3 && (
          <>
            <StepTitle title="المنظومات المقترحة لك" />
            {cat && !cat.ok && <p className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">{cat.error}</p>}
            {cat?.ok && !options.length && <p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">لا توجد منظومة جاهزة مناسبة لهذا الاستهلاك حالياً. أرسل طلبك وسيصمم لك مهندسو أكتس منظومة خاصة.</p>}
            <div className="space-y-3">
              {options.map((o) => (
                <SystemCard key={o.key} o={o} selected={pick === o.p.title} onSelect={() => { setPick(o.p.title); setStep(4); }} />
              ))}
            </div>
            <WizardNav onBack={() => setStep(2)} onNext={() => setStep(4)} disabled={!pick && !!options.length} />
          </>
        )}

        {step === 4 && (
          <>
            <StepTitle title="بيانات الشراء وموقع التسليم" />
            {chosen && (
              <div className="rounded-2xl border border-primary/30 bg-accent/30 p-3 text-xs leading-relaxed">
                <span className="font-bold text-primary">{chosen.label}: </span>{chosen.p.title}
              </div>
            )}
            <Field label="الاسم *"><Input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} placeholder="الاسم الكامل لإصدار الفاتورة" maxLength={120} /></Field>
            <Field label="رقم الهاتف / واتساب *"><Input dir="ltr" inputMode="tel" className="text-left" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value.replace(/[^\d+\s-]/g, "") })} placeholder="967 7XX XXX XXX" maxLength={20} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="المحافظة"><SelectBox value={c.gov} onChange={(g) => setC({ ...c, gov: g })} options={GOVERNORATES} placeholder="اختر" /></Field>
              <Field label="المدينة"><Input value={c.city} onChange={(e) => setC({ ...c, city: e.target.value })} placeholder="المدينة" maxLength={40} /></Field>
            </div>
            {err && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
            <WizardNav onBack={() => setStep(direct ? 1 : 3)} onNext={() => setStep(5)} disabled={!phoneOk || !c.name.trim() || !c.gov} />
          </>
        )}

        {step === 5 && (
          <>
            <StepTitle title="طريقة الدفع" />
            <div className="space-y-3">
              {PAYS.map((x) => (
                <ChoiceCard key={x.k} selected={pay === x.k} onClick={() => setPay(x.k)} icon={<x.icon className="size-6" />} title={x.t} desc={x.d} />
              ))}
            </div>
            {pay && pay !== "cod" && (
              <div className="rounded-2xl border border-silver/30 bg-secondary/50 p-4 text-sm leading-relaxed">
                <p>الاسم: <b>أكتس لاستيراد أنظمة الطاقة</b></p>
                <p>رقم الجوال: <b dir="ltr" className="font-display">773903901</b></p>
                <p className="mt-1 text-xs text-muted-foreground">حوّل المبلغ المستحق ثم أرسل إشعار التحويل عبر واتساب، وسيؤكد قسم الحسابات طلبك.</p>
              </div>
            )}
            {pay === "cod" && <p className="rounded-2xl bg-accent/40 p-4 text-sm">تستلم فاتورة الشراء مع المنظومة، والدفع نقداً عند التسليم.</p>}
            {err && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
            <WizardNav onBack={() => setStep(4)} nextLabel="تأكيد الشراء" disabled={!pay} busy={busy}
              onNext={async () => {
                if (!path || (!direct && !night) || (direct && !directPick)) return;
                setBusy(true); setErr("");
                try {
                  await submit({ data: {
                    name: c.name, phone: c.phone, city: [c.gov, c.city].filter(Boolean).join(" - "),
                    path: calcPath, method: direct ? "kwh" : method, amount: direct ? Math.max(1, Math.round(dailyProduction(directPick!) * 30)) : v, night: direct ? 50 : night!, system: ((path === "agr" ? "[النظام الزراعي] " : path === "ind" ? "[النظام الصناعي] " : path === "com" ? "[النظام التجاري] " : "[النظام السكني] ") + (direct ? "[اختيار مباشر] " : "") + (chosen ? `${chosen.label}: ${chosen.p.title}` : "منظومة خاصة حسب الاستهلاك") + ` [طلب شراء - الدفع: ${PAYS.find((x) => x.k === pay)?.t ?? ""}]`).slice(0, 300), reports,
                  } });
                  setDone(true);
                } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
              }} />
          </>
        )}
      </Panel>
    </div>
  );
}

function SystemCard({ o, selected, onSelect }: { o: { key: string; label: string; desc: string; badge?: string; p: Preset }; selected: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  const [dlg, setDlg] = useState(false);
  const prod = dailyProduction(o.p);
  const bat = batteryOf(o.p);
  const lines = o.p.lines ?? [];
  return (
    <div className={cn("card-silver overflow-hidden rounded-xl transition-all", selected && "ring-2 ring-primary")}>
      <QuoteTableDialog p={o.p} open={dlg} onOpenChange={setDlg} onChoose={() => { onSelect(); setDlg(false); }} />
      <button type="button" onClick={() => setDlg(true)} aria-pressed={selected} className="block w-full px-3 py-2 text-right">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-display text-xs font-bold">{o.label && <><span className="text-primary">{o.label}</span> · </>}{o.p.title}</p>
          <span className="shrink-0 price-badge rounded-lg px-2 py-0.5 font-display text-sm font-bold">${fmt(presetPrice(o.p), 0)}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] opacity-75">
          <span className="flex items-center gap-1"><Sun className="size-3 text-blue" />{fmt(prod)} ك.و.س/يوم</span>
          {bat > 0 && <span className="flex items-center gap-1"><BatteryCharging className="size-3 text-blue" />{fmt(bat, 2)} ك.و.س</span>}
          <span className="flex items-center gap-1"><Zap className="size-3 text-blue" />{panelCount(o.p)} لوح</span>
          {o.badge && <span className="rounded-full bg-gradient-red px-2 py-0.5 text-[9px] font-bold text-primary-foreground">{o.badge}</span>}
        </div>
      </button>
      {lines.length > 0 && (
        <div className="border-t border-background/15">
          <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-1 text-[10px] font-semibold opacity-75">
            المكونات ({lines.length})
            <ChevronDown className={cn("size-3 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <ul className="space-y-1 px-3 pb-2 text-[10px] leading-relaxed">
              {lines.map((l, i) => (
                <li key={i} className="flex gap-2"><span className="font-bold text-primary">{l.qty}×</span><span className="opacity-80">{l.name}</span><span className="mr-auto shrink-0">${fmt(l.price * l.qty, 0)}</span></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

