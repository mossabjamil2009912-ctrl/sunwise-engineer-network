import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search, SlidersHorizontal, Sparkles, WifiOff } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/acts/PageHeader";
import { Chip, SelectBox } from "@/components/acts/kit";
import { EngineerCard } from "@/components/engineers/EngineerCard";
import { ServiceRequestSheet } from "@/components/engineers/ServiceRequestSheet";
import { GOVERNORATES, REG_SERVICES, SPECIALTIES } from "@/lib/acts-data";
import { engineersQuery } from "@/lib/queries";

export const Route = createFileRoute("/engineers/")({
  head: () => ({
    meta: [
      { title: "دليل المهندسين المعتمدين — ACTS أكتس" },
      { name: "description", content: "ابحث عن مهندسي الطاقة المعتمدين حسب التخصص والمحافظة ونوع الخدمة واطلب خدمة هندسية." },
      { property: "og:title", content: "دليل المهندسين المعتمدين — ACTS" },
      { property: "og:description", content: "كفاءات هندسية معتمدة في التركيب والصيانة والتصميم والإشراف مع تقييمات العملاء." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(engineersQuery()),
  component: EngineersPage,
});

function EngineersPage() {
  const { data } = useSuspenseQuery(engineersQuery());
  const list = data.items;
  const [q, setQ] = useState("");
  const [sp, setSp] = useState("");
  const [gov, setGov] = useState("");
  const [svc, setSvc] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [reqOpen, setReqOpen] = useState(false);

  const shown = useMemo(() => {
    const t = q.trim();
    return list
      .filter((e) => (!sp || e.specialty === sp) && (!gov || e.governorate === gov) && (!svc || e.services.includes(svc)))
      .filter((e) => !t || `${e.name} ${e.specialty} ${e.skills.join(" ")} ${e.tools.join(" ")} ${e.city ?? ""}`.toLowerCase().includes(t.toLowerCase()))
      .sort((a, b) => b.avg - a.avg);
  }, [list, q, sp, gov, svc]);
  const active = [sp, gov, svc].filter(Boolean).length;

  return (
    <>
      <PageHeader compact title="دليل المهندسين" subtitle="كفاءات هندسية معتمدة من أكتس — اختر المهندس المناسب واطلب خدمتك.">
        <div className="mt-5 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pr-11" placeholder="ابحث بالاسم، المهارة أو البرنامج" value={q} onChange={(e) => setQ(e.target.value)} aria-label="بحث" />
          </div>
          <button type="button" onClick={() => setShowFilters(!showFilters)} aria-label="الفلاتر" aria-expanded={showFilters}
            className="surface relative flex size-12 items-center justify-center rounded-xl">
            <SlidersHorizontal className="size-5" />
            {active > 0 && <span className="absolute -left-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{active}</span>}
          </button>
        </div>
      </PageHeader>
      <main className="mx-auto max-w-xl space-y-4 px-5">
        {showFilters && (
          <div className="surface animate-rise space-y-3 rounded-3xl p-4">
            <SelectBox value={sp} onChange={setSp} options={SPECIALTIES} placeholder="كل التخصصات" />
            <SelectBox value={gov} onChange={setGov} options={GOVERNORATES} placeholder="كل المحافظات" />
            <div className="flex flex-wrap gap-2">
              <Chip on={!svc} onClick={() => setSvc("")}>كل الخدمات</Chip>
              {REG_SERVICES.map((s) => <Chip key={s.v} on={svc === s.v} onClick={() => setSvc(svc === s.v ? "" : s.v)}>{s.l}</Chip>)}
            </div>
            {active > 0 && <button type="button" className="text-xs font-semibold text-primary" onClick={() => { setSp(""); setGov(""); setSvc(""); }}>مسح الفلاتر</button>}
          </div>
        )}

        <button type="button" onClick={() => setReqOpen(true)} className="flex w-full items-center gap-3 rounded-3xl border border-dashed border-primary/50 bg-accent/30 p-4 text-right">
          <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-red text-primary-foreground shadow-glow"><Sparkles className="size-5" /></span>
          <span className="flex-1"><b className="block font-display text-sm">لا تعرف من تختار؟</b><span className="text-xs text-muted-foreground">اطلب خدمة ودع أكتس تختار المهندس الأنسب</span></span>
        </button>

        {data.offline && (
          <p className="flex items-center gap-2 rounded-2xl bg-secondary p-3 text-xs text-muted-foreground"><WifiOff className="size-4" />تعذّر تحديث القائمة من الخادم الآن.</p>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{shown.length} مهندس</span><span>مرتبة حسب التقييم</span>
        </div>
        <div className="space-y-3">
          {shown.map((e) => <EngineerCard key={e.id} e={e} />)}
          {!shown.length && <p className="surface rounded-3xl p-8 text-center text-sm text-muted-foreground">{list.length ? "لا يوجد مهندسون مطابقون لبحثك." : "لا يوجد مهندسون معتمدون حالياً — اطلب خدمتك وسيختار لك فريق أكتس المهندس المناسب."}</p>}
        </div>
      </main>
      <ServiceRequestSheet open={reqOpen} onOpenChange={setReqOpen} target={{ id: null, name: null }} />
    </>
  );
}
