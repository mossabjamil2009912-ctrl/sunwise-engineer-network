import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BatteryCharging, Building2, ChevronDown, FileBarChart2, Gauge, Home, Moon, Network, Receipt, Sun, SunMoon, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ChoiceCard, Field, Panel, SelectBox, StepBar, StepTitle, SuccessCard, WizardNav, errMsg } from "@/components/acts/kit";
import { sendQuoteRequest } from "@/lib/acts.functions";
import { GOVERNORATES } from "@/lib/acts-data";
import { kwhPriceQuery } from "@/lib/queries";
import { batteryOf, dailyNeed, dailyProduction, panelCount, quoteTiers, type DayNight, type Preset } from "@/lib/sizing";
import { cn } from "@/lib/utils";

const LABELS = ["نوع المنظومة", "طريقة التقدير", "نسبة التشغيل", "المنظومة", "تقارير هندسية", "بيانات التواصل"];
const NIGHT: { k: DayNight; t: string; d: string; icon: typeof Sun }[] = [
  { k: 50, t: "50% ليل / 50% نهار", d: "استهلاك متوازن طوال اليوم", icon: SunMoon },
  { k: 30, t: "30% ليل / 70% نهار", d: "معظم الاستهلاك نهاراً — بطاريات أقل", icon: Sun },
  { k: 70, t: "70% ليل / 30% نهار", d: "معظم الاستهلاك ليلاً — بطاريات أكبر", icon: Moon },
];
const fmt = (n: number, d = 1) => n.toLocaleString("en-US", { maximumFractionDigits: d });

export function QuoteWizard() {
  const { data: pr } = useQuery(kwhPriceQuery());
  const price = pr?.kwh_price ?? 290;
  const submit = useServerFn(sendQuoteRequest);

  const [step, setStep] = useState(0);
  const [path, setPath] = useState<"res" | "com" | null>(null);
  const [method, setMethod] = useState<"bill" | "kwh">("bill");
  const [amount, setAmount] = useState("");
  const [night, setNight] = useState<DayNight | null>(null);
  const [pick, setPick] = useState<string>("");
  const [reports, setReports] = useState<("pvsyst" | "sld")[]>([]);
  const [c, setC] = useState({ name: "", phone: "", gov: "", city: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const v = Number(amount);
  const need = v > 0 ? dailyNeed(method, v, price) : 0;
  const tiers = useMemo(() => (path && night && v > 0 ? quoteTiers(path, method, v, night, price) : null), [path, method, v, night, price]);
  const options = useMemo(() => {
    if (!tiers) return [] as { key: string; label: string; desc: string; badge?: string; p: Preset }[];
    return [
      { key: "rec", label: "الخيار المتوازن", desc: "الأنسب لاستهلاكك ونمط تشغيلك", badge: "موصى به", p: tiers.rec },
      ...(tiers.low ? [{ key: "low", label: "خيار السعر الاقتصادي", desc: "تكلفة أقل مع تغطية مقاربة", p: tiers.low }] : []),
      ...(tiers.high ? [{ key: "high", label: "أداء أعلى وسعة بطاريات أكبر", desc: "إنتاج وتخزين إضافي لراحة أكبر", p: tiers.high }] : []),
    ];
  }, [tiers]);
  const chosen = options.find((o) => o.p.title === pick);

  const reset = () => {
    setStep(0); setPath(null); setAmount(""); setNight(null); setPick(""); setReports([]); setDone(false); setErr("");
  };

  if (done)
    return (
      <SuccessCard
        title="تم استلام طلب عرض السعر"
        desc="سيتواصل معك فريق أكتس عبر واتساب قريباً بعرض السعر التفصيلي للمنظومة المختارة."
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
            <StepTitle title="ما نوع المنظومة التي تحتاجها؟" desc="نحدد الحسابات بناءً على طبيعة الاستخدام." />
            <div className="space-y-3">
              <ChoiceCard selected={path === "res"} onClick={() => { setPath("res"); setStep(1); }} icon={<Home className="size-6" />} title="سكني" desc="منازل، شقق، فلل — Residential" />
              <ChoiceCard selected={path === "com"} onClick={() => { setPath("com"); setStep(1); }} icon={<Building2 className="size-6" />} title="تجاري" desc="محلات، مصانع، مزارع، مؤسسات — Commercial" />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <StepTitle title="كيف تريد تقدير استهلاكك؟" desc="اختر الطريقة الأسهل لك وأدخل الرقم الشهري." />
            <div className="grid grid-cols-2 gap-3">
              {([["bill", "مبلغ الفاتورة", Receipt], ["kwh", "الاستهلاك بالكيلوواط", Gauge]] as const).map(([k, l, I]) => (
                <button key={k} type="button" onClick={() => setMethod(k)} aria-pressed={method === k}
                  className={cn("surface flex flex-col items-center gap-2 rounded-2xl p-4 text-sm font-semibold transition-all", method === k ? "border-primary/70 bg-accent/40 text-foreground ring-1 ring-primary/40" : "text-muted-foreground")}>
                  <I className={cn("size-6", method === k && "text-primary")} />{l}
                </button>
              ))}
            </div>
            <Field label={method === "bill" ? "مبلغ الفاتورة الشهرية" : "الاستهلاك الشهري"} hint={method === "bill" ? "ريال يمني" : "كيلوواط ساعة"}>
              <div className="relative">
                <Input inputMode="decimal" dir="ltr" className="h-14 pl-20 text-left font-display text-xl" placeholder="0" value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} autoFocus />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{method === "bill" ? "ر.ي / شهر" : "kWh / شهر"}</span>
              </div>
            </Field>
            {v > 0 && (
              <div className="flex items-center gap-3 rounded-2xl bg-accent/40 p-3 text-sm">
                <Zap className="size-5 text-primary" />
                <span>احتياجك اليومي التقريبي <b className="font-display">{fmt(need)}</b> كيلوواط ساعة</span>
              </div>
            )}
            <WizardNav onBack={() => setStep(0)} onNext={() => setStep(2)} disabled={!(v > 0)} />
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle title="كيف يتوزع استهلاكك بين الليل والنهار؟" desc="يؤثر هذا على سعة البطاريات المقترحة." />
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
            <StepTitle title="المنظومات المقترحة لك" desc="ثلاث فئات محسوبة وفق احتياجك ونسبة التشغيل." />
            {!options.length && <p className="rounded-2xl bg-secondary p-4 text-sm text-muted-foreground">لم نجد منظومة مناسبة لهذا الرقم، راجع المبلغ المدخل.</p>}
            <div className="space-y-3">
              {options.map((o) => (
                <SystemCard key={o.key} o={o} need={need} selected={pick === o.p.title} onSelect={() => setPick(o.p.title)} />
              ))}
            </div>
            <WizardNav onBack={() => setStep(2)} onNext={() => setStep(4)} disabled={!pick} />
          </>
        )}

        {step === 4 && (
          <>
            <StepTitle title="هل تحتاج تقريراً هندسياً؟" desc="خيار إضافي يعدّه مهندسو أكتس لمنظومتك." />
            <div className="space-y-3">
              <ChoiceCard selected={reports.includes("pvsyst")} onClick={() => setReports((r) => (r.includes("pvsyst") ? r.filter((x) => x !== "pvsyst") : [...r, "pvsyst"]))}
                icon={<FileBarChart2 className="size-6" />} title="تقرير هندسي PVsyst" desc="محاكاة الإنتاج السنوي والفاقد حسب موقعك" />
              <ChoiceCard selected={reports.includes("sld")} onClick={() => setReports((r) => (r.includes("sld") ? r.filter((x) => x !== "sld") : [...r, "sld"]))}
                icon={<Network className="size-6" />} title="المخطط الأحادي SLD" desc="مخطط التوصيل الكهربائي الكامل للمنظومة" />
            </div>
            <WizardNav onBack={() => setStep(3)} onNext={() => setStep(5)} nextLabel={reports.length ? "التالي" : "تخطٍّ"} />
          </>
        )}

        {step === 5 && (
          <>
            <StepTitle title="بيانات التواصل" desc="سنرسل لك عرض السعر عبر واتساب." />
            {chosen && (
              <div className="rounded-2xl border border-primary/30 bg-accent/30 p-3 text-xs leading-relaxed">
                <span className="font-bold text-primary">{chosen.label}: </span>{chosen.p.title}
                {reports.length > 0 && <span className="block text-muted-foreground">+ {reports.map((r) => (r === "pvsyst" ? "تقرير PVsyst" : "مخطط SLD")).join(" و ")}</span>}
              </div>
            )}
            <Field label="الاسم"><Input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} placeholder="الاسم الكامل" maxLength={120} /></Field>
            <Field label="رقم الهاتف / واتساب *"><Input dir="ltr" inputMode="tel" className="text-left" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value.replace(/[^\d+\s-]/g, "") })} placeholder="967 7XX XXX XXX" maxLength={20} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="المحافظة"><SelectBox value={c.gov} onChange={(g) => setC({ ...c, gov: g })} options={GOVERNORATES} placeholder="اختر" /></Field>
              <Field label="المدينة"><Input value={c.city} onChange={(e) => setC({ ...c, city: e.target.value })} placeholder="المدينة" maxLength={40} /></Field>
            </div>
            {err && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
            <WizardNav onBack={() => setStep(4)} nextLabel="إرسال الطلب" disabled={!phoneOk} busy={busy}
              onNext={async () => {
                if (!path || !night || !chosen) return;
                setBusy(true); setErr("");
                try {
                  await submit({ data: {
                    name: c.name, phone: c.phone, city: [c.gov, c.city].filter(Boolean).join(" - "),
                    path, method, amount: v, night, system: `${chosen.label}: ${chosen.p.title}`.slice(0, 300), reports,
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

function SystemCard({ o, need, selected, onSelect }: { o: { key: string; label: string; desc: string; badge?: string; p: Preset }; need: number; selected: boolean; onSelect: () => void }) {
  const [open, setOpen] = useState(false);
  const prod = dailyProduction(o.p);
  const bat = batteryOf(o.p);
  const cover = need > 0 ? Math.min(999, Math.round((prod / need) * 100)) : 0;
  const lines = o.p.lines ?? [];
  return (
    <div className={cn("surface overflow-hidden rounded-2xl transition-all", selected ? "border-primary/70 ring-1 ring-primary/40" : "", o.key === "rec" && !selected && "border-primary/30")}>
      <button type="button" onClick={onSelect} aria-pressed={selected} className="block w-full p-4 text-right">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className={cn("text-xs font-bold", o.key === "rec" ? "text-primary" : "text-muted-foreground")}>{o.label}</span>
            <p className="mt-1 font-display font-semibold leading-snug">{o.p.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{o.p.group} · {o.desc}</p>
          </div>
          {o.badge && <span className="shrink-0 rounded-full bg-gradient-red px-2.5 py-1 text-[10px] font-bold text-primary-foreground shadow-glow">{o.badge}</span>}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <Stat icon={<Sun className="size-4" />} v={fmt(prod)} l="ك.و.س/يوم" />
          <Stat icon={<BatteryCharging className="size-4" />} v={bat ? fmt(bat, 2) : "—"} l="ك.و.س تخزين" />
          <Stat icon={<Zap className="size-4" />} v={`${cover}%`} l={`تغطية · ${panelCount(o.p)} لوح`} />
        </div>
      </button>
      {lines.length > 0 && (
        <div className="border-t border-border">
          <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-semibold text-muted-foreground">
            مكونات المنظومة ({lines.length})
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <ul className="space-y-1.5 px-4 pb-4 text-xs leading-relaxed">
              {lines.map((l, i) => (
                <li key={i} className="flex gap-2"><span className="font-display font-bold text-primary">{l.qty}×</span><span className="text-muted-foreground">{l.name}</span></li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ icon, v, l }: { icon: React.ReactNode; v: string; l: string }) {
  return (
    <div className="rounded-xl bg-secondary/70 px-2 py-2.5">
      <div className="flex items-center justify-center gap-1 text-primary">{icon}<span className="font-display text-sm font-bold text-foreground">{v}</span></div>
      <div className="mt-0.5 text-[10px] text-muted-foreground">{l}</div>
    </div>
  );
}
