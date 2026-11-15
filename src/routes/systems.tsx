import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BatteryCharging, ChevronDown, Sun, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/acts/PageHeader";
import { Chip } from "@/components/acts/kit";
import { Button } from "@/components/ui/button";
import { catalogQuery } from "@/lib/queries";
import { batteryOf, dailyProduction, presetPrice, type Preset } from "@/lib/sizing";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/systems")({
  head: () => ({
    meta: [
      { title: "المنظومات الجاهزة وأسعارها — ACTS أكتس" },
      { name: "description", content: "تصفح منظومات أكتس الجاهزة للمنازل والمنشآت التجارية مع المكونات والأسعار المحدثة." },
      { property: "og:title", content: "المنظومات الجاهزة — ACTS" },
      { property: "og:description", content: "منظومات طاقة شمسية سكنية وتجارية بأسعار محدثة من أكتس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery()),
  component: SystemsPage,
});

const fmt = (n: number, d = 1) => n.toLocaleString("en-US", { maximumFractionDigits: d });

function SystemsPage() {
  const { data } = useSuspenseQuery(catalogQuery());
  const [type, setType] = useState<"res" | "com">("res");
  const groups = useMemo(() => {
    const m = new Map<string, Preset[]>();
    for (const p of data.presets.filter((x) => x.type === type)) m.set(p.group, [...(m.get(p.group) ?? []), p]);
    return [...m.entries()];
  }, [data.presets, type]);

  return (
    <>
      <PageHeader compact title="المنظومات الجاهزة" subtitle="منظومات أكتس بمكوناتها وأسعارها المحدثة." />
      <main className="mx-auto max-w-xl space-y-4 px-5 pb-10">
        <div className="flex gap-2">
          <Chip on={type === "res"} onClick={() => setType("res")}>سكني</Chip>
          <Chip on={type === "com"} onClick={() => setType("com")}>تجاري</Chip>
        </div>
        {!data.ok && <p className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">{data.error}</p>}
        {data.ok && !groups.length && <p className="surface rounded-3xl p-8 text-center text-sm text-muted-foreground">لا توجد منظومات جاهزة حالياً.</p>}
        {groups.map(([g, list]) => (
          <section key={g} className="space-y-2">
            <h2 className="font-display text-sm font-bold text-primary">{g}</h2>
            {list.map((p) => <SystemRow key={p.title} p={p} />)}
          </section>
        ))}
        <Button asChild variant="hero" size="lg" className="w-full"><Link to="/quote">احسب منظومتك واطلب عرض سعر</Link></Button>
      </main>
    </>
  );
}

function SystemRow({ p }: { p: Preset }) {
  const [open, setOpen] = useState(false);
  const bat = batteryOf(p);
  return (
    <div className="card-silver overflow-hidden rounded-xl">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="block w-full px-3 py-2 text-right">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-xs font-bold leading-snug">{p.title}</p>
          <span className="shrink-0 rounded-lg bg-gradient-red px-2 py-0.5 font-display text-sm font-bold text-primary-foreground shadow-glow">${fmt(presetPrice(p), 0)}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] opacity-75">
          <span className="flex items-center gap-1"><Sun className="size-3.5 text-primary" />{fmt(dailyProduction(p))} ك.و.س/يوم</span>
          {bat > 0 && <span className="flex items-center gap-1"><BatteryCharging className="size-3.5 text-primary" />{fmt(bat, 2)} ك.و.س</span>}
          <span className="flex items-center gap-1"><Zap className="size-3.5 text-primary" />{p.panels} لوح</span>
          <ChevronDown className={cn("mr-auto size-4 transition-transform", open && "rotate-180")} />
        </div>
      </button>
      {open && (
        <ul className="space-y-1.5 border-t border-background/15 px-3 py-2 text-[10px] leading-relaxed">
          {p.lines.map((l, i) => (
            <li key={i} className="flex gap-2"><span className="font-display font-bold text-primary">{l.qty}×</span><span className="opacity-80">{l.name}</span><span className="mr-auto shrink-0 font-display">${fmt(l.price * l.qty, 0)}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}
