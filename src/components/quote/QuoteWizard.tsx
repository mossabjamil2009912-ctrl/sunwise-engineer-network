import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { BatteryCharging, Building2, Factory, Fuel, ChevronDown, FileBarChart2, Gauge, Home, LayoutGrid, Moon, Network, Receipt, Sun, SunMoon, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ChoiceCard, Field, Panel, SelectBox, StepBar, StepTitle, SuccessCard, WizardNav, errMsg } from "@/components/acts/kit";
import { sendQuoteRequest } from "@/lib/acts.functions";
import { GOVERNORATES } from "@/lib/acts-data";
import { catalogQuery } from "@/lib/queries";
import { batteryOf, dailyNeed, dailyProduction, panelCount, presetPrice, quoteTiers, type DayNight, type Preset } from "@/lib/sizing";
import { cn } from "@/lib/utils";

const LABELS = ["نوع المنظومة", "طريقة التقدير", "نسبة التشغيل", "المنظومة", "تقارير هندسية", "بيانات التواصل"];
const NIGHT: { k: DayNight; t: string; d: string; icon: typeof Sun }[] = [
  { k: 50, t: "50% ليل / 50% نهار", d: "متوازن", icon: SunMoon },
  { k: 30, t: "30% ليل / 70% نهار", d: "بطاريات أقل", icon: Sun },
  { k: 70, t: "70% ليل / 30% نهار", d: "بطاريات أكبر", icon: Moon },
];
const fmt = (n: number, d = 1) => n.toLocaleString("en-US", { maximumFractionDigits: d });

export function QuoteWizard() {
  const { data: cat } = useQuery(catalogQuery());
  const price = cat?.kwh_price ?? 0;
  const presets = cat?.presets ?? [];
  const submit = useServerFn(sendQuoteRequest);

  const [step, setStep] = useState(0);
  const [path, setPath] = useState<"res" | "com" | "ind" | null>(null);
  const [method, setMethod] = useState<"bill" | "kwh" | "diesel" | "preset">("bill");
  const [amount, setAmount] = useState("");
  const [night, setNight] = useState<DayNight | null>(null);
  const [pick, setPick] = useState<string>("");
  const [reports, setReports] = useState<("pvsyst" | "sld")[]>([]);
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
      { key: "rec", label: "الخيار المتوازن", desc: "الأنسب لك", badge: "موصى به", p: tiers.rec },
      ...(tiers.low ? [{ key: "low", label: "خيار السعر الاقتصادي", desc: "تكلفة أقل", p: tiers.low }] : []),
      ...(tiers.high ? [{ key: "high", label: "أداء أعلى وسعة بطاريات أكبر", desc: "تخزين أكبر", p: tiers.high }] : []),
    ];
  }, [tiers]);
  const chosen = direct ? (directPick ? { key: "direct", label: "منظومة جاهزة", desc: "", p: directPick } : undefined) : options.find((o) => o.p.title === pick);

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
            <StepTitle title="ما نوع النظام؟" />
            <div className="space-y-3">
              <ChoiceCard selected={path === "res"} onClick={() => { setPath("res"); if (method === "diesel") setMethod("bill"); setStep(1); }} icon={<Home className="size-6" />} title="النظام السكني" desc="منازل وشقق" />
              <ChoiceCard selected={path === "com"} onClick={() => { setPath("com"); if (method === "preset") setMethod("bill"); setStep(1); }} icon={<Building2 className="size-6" />} title="النظام التجاري" desc="محلات ومكاتب" />
              <ChoiceCard selected={path === "ind"} onClick={() => { setPath("ind"); if (method === "preset") setMethod("bill"); setStep(1); }} icon={<Factory className="size-6" />} title="النظام الصناعي" desc="مصانع وورش" />
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <StepTitle title="كيف تريد تقدير استهلاكك؟" />
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
                  <SystemCard key={p.title} o={{ key: "direct", label: p.group, desc: "منظومة جاهزة", p }} selected={pick === p.title} onSelect={() => setPick(p.title)} />
                ))}
                <WizardNav onBack={() => setStep(0)} onNext={() => setStep(4)} disabled={!directPick} />
              </div>
            ) : (<>
            <Field label={method === "bill" ? "مبلغ الفاتورة الشهرية" : method === "kwh" ? "الاستهلاك الشهري" : "استهلاك الديزل الشهري"} hint={method === "bill" ? "ريال يمني" : method === "kwh" ? "كيلوواط ساعة" : "لتر ديزل"}>
              <div className="relative">
                <Input inputMode="decimal" dir="ltr" className="h-14 pl-20 text-left font-display text-xl" placeholder="0" value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} autoFocus />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{method === "bill" ? "ر.ي / شهر" : method === "kwh" ? "kWh / شهر" : "لتر / شهر"}</span>
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
                <SystemCard key={o.key} o={o} selected={pick === o.p.title} onSelect={() => setPick(o.p.title)} />
              ))}
            </div>
            <WizardNav onBack={() => setStep(2)} onNext={() => setStep(4)} disabled={!pick && !!options.length} />
          </>
        )}

        {step === 4 && (
          <>
            <StepTitle title="هل تحتاج تقريراً هندسياً؟" />
            <div className="space-y-3">
              <ChoiceCard selected={reports.includes("pvsyst")} onClick={() => setReports((r) => (r.includes("pvsyst") ? r.filter((x) => x !== "pvsyst") : [...r, "pvsyst"]))}
                icon={<FileBarChart2 className="size-6" />} title="تقرير هندسي PVsyst" desc="محاكاة الإنتاج" />
              <ChoiceCard selected={reports.includes("sld")} onClick={() => setReports((r) => (r.includes("sld") ? r.filter((x) => x !== "sld") : [...r, "sld"]))}
                icon={<Network className="size-6" />} title="المخطط الأحادي SLD" desc="مخطط التوصيل" />
            </div>
            <WizardNav onBack={() => setStep(direct ? 1 : 3)} onNext={() => setStep(5)} nextLabel={reports.length ? "التالي" : "تخطٍّ"} />
          </>
        )}

        {step === 5 && (
          <>
            <StepTitle title="بيانات التواصل" />
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
                if (!path || (!direct && !night) || (direct && !directPick)) return;
                setBusy(true); setErr("");
                try {
                  await submit({ data: {
                    name: c.name, phone: c.phone, city: [c.gov, c.city].filter(Boolean).join(" - "),
                    path: calcPath, method: direct ? "kwh" : method, amount: direct ? Math.max(1, Math.round(dailyProduction(directPick!) * 30)) : v, night: direct ? 50 : night!, system: ((path === "ind" ? "[النظام الصناعي] " : path === "com" ? "[النظام التجاري] " : "[النظام السكني] ") + (direct ? "[اختيار مباشر] " : "") + (chosen ? `${chosen.label}: ${chosen.p.title}` : "منظومة خاصة حسب الاستهلاك")).slice(0, 300), reports,
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
  const prod = dailyProduction(o.p);
  const bat = batteryOf(o.p);
  const lines = o.p.lines ?? [];
  return (
    <div className={cn("card-silver overflow-hidden rounded-xl transition-all", selected && "ring-2 ring-primary")}>
      <button type="button" onClick={onSelect} aria-pressed={selected} className="block w-full px-3 py-2 text-right">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate font-display text-xs font-bold"><span className="text-primary">{o.label}</span> · {o.p.title}</p>
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

