import { useServerFn } from "@tanstack/react-start";
import { Camera, GraduationCap, HardHat, ImagePlus, Plus, Trash2, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ChoiceCard, Chip, Field, Panel, SelectBox, StepBar, StepTitle, SuccessCard, WizardNav, errMsg } from "@/components/acts/kit";
import { useUploader } from "@/components/acts/useUploader";
import { registerEngineer } from "@/lib/acts.functions";
import { GOVERNORATES, QUALIFICATIONS, SPECIALTIES, servicesFor, skillsFor, categoryNote, crmKind, serviceLabel, type Category } from "@/lib/acts-data";
import { cn } from "@/lib/utils";

const LABELS = ["الحساب", "التخصص", "الدراسة", "الخدمات", "المهارات", "الخبرات", "الموقع", "المراجعة"];
const DRAFT_KEY = "acts-join-draft";
type Project = { title: string; desc: string; images: string[] };
type Form = {
  category: Category | ""; name: string; phone: string; email: string; photo: string | null; specialty: string;
  university: string; grad_year: string; qualification: string; qual_detail: string; skills: string[]; tools: string[];
  services: string[]; years_exp: string; projects: Project[]; bio: string; governorate: string; city: string;
};
const EMPTY: Form = {
  category: "engineer", name: "", phone: "", email: "", photo: null, specialty: "", university: "", grad_year: "", qualification: "", qual_detail: "",
  skills: [], tools: [], services: [], years_exp: "", projects: [], bio: "", governorate: "", city: "",
};
const toggle = (xs: string[], x: string) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);
const ICONS: Record<Category, ReactNode> = { student: <GraduationCap className="size-6" />, graduate: <UserRound className="size-6" />, engineer: <HardHat className="size-6" /> };

export function JoinWizard() {
  const reg = useServerFn(registerEngineer);
  const { upload, uploading } = useUploader();
  const photoRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [extra, setExtra] = useState({ skill: "", tool: "", service: "" });

  useEffect(() => {
    try { const d = localStorage.getItem(DRAFT_KEY); if (d) setF({ ...EMPTY, ...JSON.parse(d) }); } catch { /* ignore bad draft */ }
  }, []);
  useEffect(() => {
    if (f !== EMPTY) localStorage.setItem(DRAFT_KEY, JSON.stringify(f));
  }, [f]);

  const offerFor = (spec: string, svcs: string[]) => {
    const g = svcs.map((v) => skillsFor(spec, v));
    return { skills: [...new Set(g.flatMap((x) => x.skills))], tools: [...new Set(g.flatMap((x) => x.tools))] };
  };
  const offered = offerFor(f.specialty, f.services);
  const allOffered = (spec: string) => offerFor(spec, servicesFor(spec).map((s) => s.v));
  /** Drop catalogue skills/tools no longer offered; keep custom ones. */
  const prune = (p: Form, spec: string, svcs: string[]): Form => {
    const all = allOffered(p.specialty), allNew = allOffered(spec), keep = offerFor(spec, svcs);
    const known = new Set([...all.skills, ...all.tools, ...allNew.skills, ...allNew.tools, ...offerFor(p.specialty, p.services).skills, ...offerFor(p.specialty, p.services).tools]);
    return { ...p, specialty: spec, services: svcs,
      skills: p.skills.filter((x) => !known.has(x) || keep.skills.includes(x)),
      tools: p.tools.filter((x) => !known.has(x) || keep.tools.includes(x)) };
  };
  const setServices = (svcs: string[]) => setF((p) => prune(p, p.specialty, svcs));
  const setSpecialty = (spec: string) => setF((p) => { const ok = servicesFor(spec).map((s) => s.v as string); const known = new Set(SPECIALTIES.flatMap((x) => servicesFor(x).map((y) => y.v as string))); return prune(p, spec, p.services.filter((v) => ok.includes(v) || !known.has(v))); });
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));
  const go = (n: number) => { setErr(""); setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const emailOk = !f.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email);
  const gy = Number(f.grad_year);
  const valid = [
    !!f.category && f.name.trim().length >= 2 && f.phone.replace(/\D/g, "").length >= 9 && emailOk,
    !f.grad_year || (gy >= 1970 && gy <= 2040),
    !!f.specialty,
    f.services.length > 0,
    true,
    f.projects.every((p) => p.title.trim()),
    !!f.governorate,
    true,
  ];

  if (done)
    return <SuccessCard title="تم استلام طلب انضمامك" desc="ملفك الآن بانتظار اعتماد إدارة أكتس. سنتواصل معك عبر الهاتف فور مراجعة بياناتك، وبعد الاعتماد يظهر ملفك في دليل المهندسين." />;

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    setErr("");
    try { set("photo", (await upload(file)).url); } catch (e) { setErr(errMsg(e)); }
  };

  return (
    <div className="space-y-5">
      <StepBar step={step} total={LABELS.length} labels={LABELS} />
      <Panel className="animate-rise space-y-5" key={step}>
        {step === 0 && (
          <>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => photoRef.current?.click()} className="relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border-strong bg-secondary" aria-label="الصورة الشخصية">
                {f.photo ? <img src={f.photo} alt="الصورة الشخصية" className="h-full w-full object-cover" /> : <Camera className="size-6 text-muted-foreground" />}
                {uploading && <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-[10px]">جارٍ الرفع</span>}
              </button>
              <div className="text-xs leading-relaxed text-muted-foreground">أضف صورة شخصية مهنية (اختياري)</div>
              <input ref={photoRef} type="file" accept="image/*" hidden onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />
            </div>
            <Field label="الاسم الكامل *"><Input value={f.name} onChange={(e) => set("name", e.target.value)} maxLength={120} /></Field>
            <Field label="رقم الهاتف / واتساب *"><Input dir="ltr" inputMode="tel" className="text-left" value={f.phone} onChange={(e) => set("phone", e.target.value.replace(/[^\d+\s-]/g, ""))} placeholder="967 7XX XXX XXX" maxLength={20} /></Field>
            <Field label="البريد الإلكتروني" error={emailOk ? undefined : "البريد غير صحيح"}><Input dir="ltr" type="email" className="text-left" value={f.email} onChange={(e) => set("email", e.target.value.trim())} maxLength={200} /></Field>
            {err && <Err t={err} />}
            <WizardNav onNext={() => go(1)} disabled={!valid[0] || uploading} />
          </>
        )}

        {step === 1 && (
          <>
            <StepTitle title="الدراسة والمؤهلات" />
            <Field label="الجامعة"><Input value={f.university} onChange={(e) => set("university", e.target.value)} maxLength={160} placeholder="مثال: جامعة صنعاء" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={f.category === "student" ? "سنة التخرج المتوقعة" : "سنة التخرج"} error={valid[1] ? undefined : "سنة غير صحيحة"}>
                <Input dir="ltr" inputMode="numeric" className="text-left" value={f.grad_year} onChange={(e) => set("grad_year", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="2024" />
              </Field>
              <Field label="المؤهل العلمي"><SelectBox value={f.qualification} onChange={(v) => set("qualification", v)} options={QUALIFICATIONS} placeholder="اختر" /></Field>
            </div>
            <Field label="تفاصيل إضافية" hint="شهادات، دورات..."><Textarea value={f.qual_detail} onChange={(e) => set("qual_detail", e.target.value)} maxLength={800} /></Field>
            <WizardNav onBack={() => go(0)} onNext={() => go(2)} disabled={!valid[1]} />
          </>
        )}

        {step === 2 && (
          <>
            <StepTitle title="تخصصك الهندسي" />
            <div className="grid grid-cols-2 gap-2.5">
              {SPECIALTIES.map((s) => (
                <button key={s} type="button" onClick={() => setSpecialty(s)} aria-pressed={f.specialty === s}
                  className={cn("surface rounded-2xl p-4 text-sm font-semibold transition-all", f.specialty === s ? "border-primary/70 bg-accent/40 ring-1 ring-primary/40" : "text-muted-foreground")}>
                  {s.replace("هندسة ", "")}
                </button>
              ))}
            </div>
            <WizardNav onBack={() => go(1)} onNext={() => go(3)} disabled={!valid[2]} />
          </>
        )}

        {step === 3 && (
          <>
            <StepTitle title="الخدمات التي تقدمها" desc="اختر خدمة واحدة على الأقل." />
            <div className="grid grid-cols-2 gap-2.5">
              {[...servicesFor(f.specialty), ...f.services.filter((v) => !servicesFor(f.specialty).some((x) => x.v === v)).map((v) => ({ v, l: v }))].map((s) => (
                <button key={s.v} type="button" onClick={() => setServices(toggle(f.services, s.v))} aria-pressed={f.services.includes(s.v)}
                  className={cn("surface rounded-2xl p-4 text-sm font-semibold transition-all", f.services.includes(s.v) ? "border-primary/70 bg-accent/40 ring-1 ring-primary/40" : "text-muted-foreground")}>
                  {s.l}
                </button>
              ))}
            </div>
            <AddCustom value={extra.service} onChange={(v) => setExtra({ ...extra, service: v })} onAdd={() => { const v = extra.service.trim(); if (v && !f.services.includes(v)) setServices([...f.services, v]); setExtra({ ...extra, service: "" }); }} placeholder="خدمة أخرى" />
            <WizardNav onBack={() => go(2)} onNext={() => go(4)} disabled={!valid[3]} />
          </>
        )}

        {step === 4 && (
          <>
            <StepTitle title="المهارات والبرامج" desc="اختر ما تجيده، ويمكنك إضافة غيرها." />
            <Field group label="المهارات الهندسية">
              <div className="flex flex-wrap gap-2">{[...new Set([...offered.skills, ...f.skills])].map((s) => <Chip key={s} on={f.skills.includes(s)} onClick={() => set("skills", toggle(f.skills, s))}>{s}</Chip>)}</div>
            </Field>
            <AddCustom value={extra.skill} onChange={(v) => setExtra({ ...extra, skill: v })} onAdd={() => { const v = extra.skill.trim(); if (v && !f.skills.includes(v)) set("skills", [...f.skills, v]); setExtra({ ...extra, skill: "" }); }} placeholder="مهارة أخرى" />
            <Field group label="البرامج التخصصية">
              <div className="flex flex-wrap gap-2" dir="ltr">{[...new Set([...offered.tools, ...f.tools])].map((s) => <Chip key={s} on={f.tools.includes(s)} onClick={() => set("tools", toggle(f.tools, s))}>{s}</Chip>)}</div>
            </Field>
            <AddCustom value={extra.tool} onChange={(v) => setExtra({ ...extra, tool: v })} onAdd={() => { const v = extra.tool.trim(); if (v && !f.tools.includes(v)) set("tools", [...f.tools, v]); setExtra({ ...extra, tool: "" }); }} placeholder="برنامج آخر" />
            <WizardNav onBack={() => go(3)} onNext={() => go(5)} />
          </>
        )}

        {step === 5 && (
          <>
            <StepTitle title="الخبرات والمشاريع" desc="أضف أبرز أعمالك مع صورها." />
            <Field label="سنوات الخبرة"><Input dir="ltr" inputMode="numeric" className="text-left" value={f.years_exp} onChange={(e) => set("years_exp", e.target.value.replace(/\D/g, "").slice(0, 2))} placeholder="0" /></Field>
            <Field label="نبذة عنك"><Textarea value={f.bio} onChange={(e) => set("bio", e.target.value)} maxLength={1200} placeholder="عرّف العملاء بخبراتك وأسلوب عملك..." /></Field>
            <div className="space-y-3">
              {f.projects.map((p, i) => (
                <ProjectEditor key={i} p={p} upload={upload} onError={setErr}
                  onChange={(np) => set("projects", f.projects.map((x, j) => (j === i ? np : x)))}
                  onRemove={() => set("projects", f.projects.filter((_, j) => j !== i))} />
              ))}
              {f.projects.length < 10 && (
                <Button variant="glass" size="lg" className="w-full border-dashed" onClick={() => set("projects", [...f.projects, { title: "", desc: "", images: [] }])}>
                  <Plus /> إضافة مشروع
                </Button>
              )}
            </div>
            {err && <Err t={err} />}
            <WizardNav onBack={() => go(4)} onNext={() => go(6)} disabled={!valid[5]} />
          </>
        )}

        {step === 6 && (
          <>
            <StepTitle title="موقعك" desc="يساعد العملاء في الوصول إلى أقرب مهندس." />
            <Field label="المحافظة *"><SelectBox value={f.governorate} onChange={(v) => set("governorate", v)} options={GOVERNORATES} placeholder="اختر المحافظة" /></Field>
            <Field label="المدينة / المديرية"><Input value={f.city} onChange={(e) => set("city", e.target.value)} maxLength={80} /></Field>
            <WizardNav onBack={() => go(5)} onNext={() => go(7)} disabled={!valid[6]} />
          </>
        )}

        {step === 7 && (
          <>
            <StepTitle title="مراجعة البيانات" desc="تأكد من صحة بياناتك قبل الإرسال." />
            <div className="flex items-center gap-3">
              {f.photo ? <img src={f.photo} alt="" className="size-16 rounded-2xl object-cover" /> : <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-red font-display text-xl font-bold text-primary-foreground">{f.name.slice(0, 1)}</div>}
              <div><p className="font-display font-semibold">{f.name}</p><p className="text-xs text-muted-foreground">{f.specialty}</p></div>
            </div>
            <dl className="divide-y divide-border rounded-2xl bg-secondary/50 text-sm">
              <Row k="الهاتف" v={f.phone} edit={() => go(0)} ltr />
              {f.email && <Row k="البريد" v={f.email} edit={() => go(0)} ltr />}
              <Row k="الدراسة" v={[f.university, f.grad_year, f.qualification].filter(Boolean).join(" · ") || "—"} edit={() => go(2)} />
              <Row k="المهارات" v={f.skills.join("، ") || "—"} edit={() => go(4)} />
              <Row k="البرامج" v={f.tools.join("، ") || "—"} edit={() => go(4)} />
              <Row k="الخدمات" v={f.services.map(serviceLabel).join("، ")} edit={() => go(3)} />
              <Row k="الخبرة" v={`${Number(f.years_exp) || 0} سنوات · ${f.projects.length} مشاريع`} edit={() => go(5)} />
              <Row k="الموقع" v={[f.governorate, f.city].filter(Boolean).join(" - ")} edit={() => go(6)} />
            </dl>
            <p className="rounded-2xl border border-primary/30 bg-accent/30 p-3 text-xs leading-relaxed">بعد الإرسال يُراجع فريق أكتس ملفك، ولن يظهر في الدليل إلا بعد اعتماد الإدارة.</p>
            {err && <Err t={err} />}
            <WizardNav onBack={() => go(6)} nextLabel="إرسال للاعتماد" busy={busy} onNext={async () => {
              if (!f.category) return;
              setBusy(true); setErr("");
              try {
                await reg({ data: {
                  kind: crmKind(f.category), name: f.name, phone: f.phone, email: f.email, photo_url: f.photo, specialty: f.specialty,
                  university: f.university, grad_year: gy >= 1970 && gy <= 2040 ? gy : null,
                  qualifications: [f.qualification, f.qual_detail.trim()].filter(Boolean).join(" — "),
                  skills: f.skills, tools: f.tools, services: f.services, years_exp: Math.min(60, Number(f.years_exp) || 0),
                  projects: f.projects.filter((p) => p.title.trim()), governorate: f.governorate, city: f.city,
                  bio: [categoryNote(f.category), f.bio.trim()].filter(Boolean).join("\n"),
                } });
                localStorage.removeItem(DRAFT_KEY);
                setDone(true);
              } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
            }} />
          </>
        )}
      </Panel>
    </div>
  );
}

function Err({ t }: { t: string }) {
  return <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{t}</p>;
}
function Row({ k, v, edit, ltr }: { k: string; v: string; edit: () => void; ltr?: boolean }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <dt className="w-16 shrink-0 text-xs text-muted-foreground">{k}</dt>
      <dd className="flex-1 leading-relaxed" dir={ltr ? "ltr" : undefined}>{v}</dd>
      <button type="button" onClick={edit} className="text-xs font-semibold text-primary">تعديل</button>
    </div>
  );
}
function AddCustom({ value, onChange, onAdd, placeholder }: { value: string; onChange: (v: string) => void; onAdd: () => void; placeholder: string }) {
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={80} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }} />
      <Button variant="glass" size="icon" className="size-12 shrink-0" onClick={onAdd} aria-label="إضافة"><Plus /></Button>
    </div>
  );
}
function ProjectEditor({ p, onChange, onRemove, upload, onError }: {
  p: Project; onChange: (p: Project) => void; onRemove: () => void; upload: (f: File) => Promise<{ url: string }>; onError: (e: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-secondary/40 p-4">
      <div className="flex items-center gap-2">
        <Input value={p.title} onChange={(e) => onChange({ ...p, title: e.target.value })} placeholder="اسم المشروع *" maxLength={160} />
        <Button variant="subtle" size="icon" className="size-12 shrink-0" onClick={onRemove} aria-label="حذف المشروع"><Trash2 /></Button>
      </div>
      <Textarea value={p.desc} onChange={(e) => onChange({ ...p, desc: e.target.value })} placeholder="نبذة عن المشروع: القدرة، الموقع، دورك..." maxLength={1000} className="min-h-[80px]" />
      <div className="flex flex-wrap gap-2">
        {p.images.map((u, i) => (
          <div key={u} className="relative size-16 overflow-hidden rounded-xl">
            <img src={u} alt="" className="h-full w-full object-cover" />
            <button type="button" aria-label="حذف الصورة" onClick={() => onChange({ ...p, images: p.images.filter((_, j) => j !== i) })} className="absolute left-0.5 top-0.5 rounded-full bg-background/80 p-0.5"><X className="size-3" /></button>
          </div>
        ))}
        {p.images.length < 6 && (
          <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="flex size-16 flex-col items-center justify-center gap-0.5 rounded-xl border border-dashed border-border-strong text-[10px] text-muted-foreground">
            <ImagePlus className="size-4" />{busy ? "رفع..." : "صورة"}
          </button>
        )}
        <input ref={ref} type="file" accept="image/*" multiple hidden onChange={async (e) => {
          const list = Array.from(e.target.files ?? []).slice(0, 6 - p.images.length);
          e.target.value = "";
          setBusy(true);
          const urls: string[] = [];
          for (const file of list) { try { urls.push((await upload(file)).url); } catch (x) { onError(errMsg(x)); } }
          setBusy(false);
          if (urls.length) onChange({ ...p, images: [...p.images, ...urls] });
        }} />
      </div>
    </div>
  );
}
