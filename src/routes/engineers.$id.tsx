import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, Briefcase, GraduationCap, MapPin, MessageSquareQuote, Wrench } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Stars } from "@/components/acts/kit";
import { EngineerAvatar } from "@/components/engineers/EngineerAvatar";
import { ReportReviewDialog } from "@/components/engineers/ReportReviewDialog";
import { ServiceRequestSheet } from "@/components/engineers/ServiceRequestSheet";
import type { Engineer, Review } from "@/lib/acts.functions";
import { serviceLabel } from "@/lib/acts-data";
import { engineerQuery } from "@/lib/queries";
import { isSampleId, SAMPLE_ENGINEERS } from "@/lib/sample-engineers";

type Data = { engineer: Omit<Engineer, "avg" | "count">; reviews: Review[]; sample: boolean };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/engineers/$id")({
  loader: async ({ context, params }): Promise<Data> => {
    if (isSampleId(params.id)) {
      const s = SAMPLE_ENGINEERS.find((e) => e.id === params.id);
      if (!s) throw notFound();
      return { engineer: s, reviews: s.reviews, sample: true };
    }
    if (!UUID.test(params.id)) throw notFound();
    try {
      const r = await context.queryClient.ensureQueryData(engineerQuery(params.id));
      return { ...r, sample: false };
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    const n = loaderData?.engineer.name;
    const t = n ? `${n} — ${loaderData.engineer.specialty} | ACTS` : "ملف المهندس — ACTS";
    const d = n ? `الملف الكامل لـ${n}: المؤهلات، المهارات، المشاريع وتقييمات العملاء.` : "الملف الكامل للمهندس في دليل أكتس.";
    return {
      meta: [
        { title: t }, { name: "description", content: d },
        { property: "og:title", content: t }, { property: "og:description", content: d },
        { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl space-y-4 px-5 py-24 text-center">
      <h1 className="text-xl font-bold">المهندس غير متاح</h1>
      <p className="text-sm text-muted-foreground">قد يكون الملف غير معتمد بعد أو تم إيقافه.</p>
      <Button asChild variant="glass"><Link to="/engineers">العودة إلى الدليل</Link></Button>
    </div>
  ),
  component: ProfilePage,
});

const SUB = [["quality", "جودة العمل"], ["punctuality", "الالتزام بالمواعيد"], ["professionalism", "الاحترافية"], ["responsiveness", "سرعة الاستجابة"]] as const;

function ProfilePage() {
  const initial = Route.useLoaderData();
  const { id } = Route.useParams();
  const live = useQuery({ ...engineerQuery(id), enabled: !initial.sample });
  const e = (live.data?.engineer ?? initial.engineer);
  const rv = live.data?.reviews ?? initial.reviews;
  const [open, setOpen] = useState(false);
  const avg = rv.length ? rv.reduce((a, r) => a + r.rating, 0) / rv.length : 0;
  const sub = (k: (typeof SUB)[number][0]) => (rv.length ? rv.reduce((a, r) => a + r[k], 0) / rv.length : 0);
  const projects = (e.projects ?? []) as Engineer["projects"];

  return (
    <>
      <header className="relative overflow-hidden pt-safe">
        <div className="bg-ambient absolute inset-0" />
        <div className="pointer-events-none absolute -top-20 left-[4%] h-56 w-1.5 rotate-[35deg] bg-gradient-red opacity-80" />
        <div className="relative mx-auto max-w-xl px-5 pb-6 pt-4">
          <Link to="/engineers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><ArrowRight className="size-4" />دليل المهندسين</Link>
          <div className="mt-6 flex animate-rise items-center gap-4">
            <EngineerAvatar url={e.photo_url} name={e.name} className="size-28 rounded-3xl ring-2 ring-primary/40 ring-offset-4 ring-offset-background" />
            <div className="min-w-0 space-y-1.5">
              <h1 className="text-2xl font-bold leading-tight">{e.name}</h1>
              <span className="inline-block rounded-full bg-gradient-red px-3 py-1 text-xs font-bold text-primary-foreground shadow-glow">{e.specialty}</span>
              <p className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="size-3" />{[e.governorate, e.city].filter(Boolean).join(" - ") || "—"}</p>
            </div>
          </div>
          {initial.sample && <p className="mt-4 rounded-xl bg-secondary/70 px-3 py-2 text-[11px] text-muted-foreground">ملف تجريبي للعرض فقط</p>}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            <Metric v={String(e.years_exp)} l="سنوات خبرة" />
            <Metric v={rv.length ? avg.toFixed(1) : "—"} l={`${rv.length} تقييم`} />
            <Metric v={String(projects.length)} l="مشاريع" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl space-y-4 px-5 pb-24">
        {e.bio && <p className="text-sm leading-relaxed text-muted-foreground">{e.bio}</p>}

        <Section icon={<GraduationCap className="size-4" />} title="المؤهلات الأكاديمية">
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Item k="الجامعة" v={e.university} /><Item k="سنة التخرج" v={e.grad_year ? String(e.grad_year) : null} />
            <div className="col-span-2"><Item k="المؤهل" v={e.qualifications} /></div>
          </dl>
        </Section>

        <Section icon={<Wrench className="size-4" />} title="المهارات والبرامج">
          <Tags xs={e.skills} />
          {e.tools.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5" dir="ltr">{e.tools.map((t) => <span key={t} className="rounded-lg border border-primary/30 bg-accent/40 px-2.5 py-1 font-display text-xs font-semibold">{t}</span>)}</div>}
        </Section>

        <Section icon={<Briefcase className="size-4" />} title="الخدمات المقدمة">
          <Tags xs={e.services.map(serviceLabel)} strong />
        </Section>

        {projects.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-base font-bold">معرض المشاريع</h2>
            <div className="no-scrollbar -mx-5 flex snap-x gap-3 overflow-x-auto px-5">
              {projects.map((p, i) => (
                <article key={i} className="surface w-72 shrink-0 snap-start overflow-hidden rounded-3xl">
                  {p.images[0] ? <img src={p.images[0]} alt={p.title} loading="lazy" width={992} height={672} className="h-40 w-full object-cover" /> : <div className="h-40 bg-secondary" />}
                  {p.images.length > 1 && <div className="flex gap-1 px-3 pt-2">{p.images.slice(1, 5).map((u) => <img key={u} src={u} alt="" loading="lazy" className="size-10 rounded-md object-cover" />)}</div>}
                  <div className="space-y-1 p-4"><h3 className="text-sm font-semibold">{p.title}</h3><p className="text-xs leading-relaxed text-muted-foreground">{p.desc}</p></div>
                </article>
              ))}
            </div>
          </section>
        )}

        <Section icon={<MessageSquareQuote className="size-4" />} title="تقييمات العملاء">
          {rv.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد تقييمات بعد.</p> : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center"><div className="font-display text-4xl font-bold">{avg.toFixed(1)}</div><Stars value={avg} /></div>
                <div className="flex-1 space-y-1.5">
                  {SUB.map(([k, l]) => (
                    <div key={k} className="flex items-center gap-2 text-[11px]">
                      <span className="w-28 shrink-0 text-muted-foreground">{l}</span>
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-red" style={{ width: `${(sub(k) / 5) * 100}%` }} /></div>
                      <span className="w-6 font-display font-bold">{sub(k).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ul className="space-y-3">
                {rv.map((r) => (
                  <li key={r.id} className="rounded-2xl bg-secondary/60 p-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">{r.reviewer_name || "عميل أكتس"}</span>
                      <Stars value={r.rating} />
                    </div>
                    {r.comment && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{new Date(r.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long" })}</span>
                      <ReportReviewDialog reviewId={r.id} sample={initial.sample} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      </main>

      <div className="fixed inset-x-0 bottom-4 z-30 px-5 pb-safe">
        <div className="mx-auto max-w-xl">
          <Button variant="hero" size="xl" className="w-full" onClick={() => setOpen(true)}>طلب خدمة هندسية</Button>
        </div>
      </div>
      <ServiceRequestSheet open={open} onOpenChange={setOpen} target={{ id: initial.sample ? null : e.id, name: e.name }} />
    </>
  );
}

function Metric({ v, l }: { v: string; l: string }) {
  return <div className="surface rounded-2xl py-3"><div className="font-display text-xl font-bold">{v}</div><div className="text-[11px] text-muted-foreground">{l}</div></div>;
}
function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="surface space-y-3 rounded-3xl p-5">
      <h2 className="flex items-center gap-2 text-base font-bold"><span className="flex size-7 items-center justify-center rounded-lg bg-accent text-primary">{icon}</span>{title}</h2>
      {children}
    </section>
  );
}
function Item({ k, v }: { k: string; v: string | null }) {
  return <div><dt className="text-[11px] text-muted-foreground">{k}</dt><dd className="font-medium">{v || "—"}</dd></div>;
}
function Tags({ xs, strong }: { xs: string[]; strong?: boolean }) {
  if (!xs.length) return <p className="text-sm text-muted-foreground">—</p>;
  return <div className="flex flex-wrap gap-1.5">{xs.map((x) => <span key={x} className={strong ? "rounded-full bg-gradient-red px-3 py-1 text-xs font-semibold text-primary-foreground" : "rounded-full bg-secondary px-3 py-1 text-xs"}>{x}</span>)}</div>;
}
