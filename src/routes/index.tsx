import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Calculator, ChevronLeft, UserPlus, Users } from "lucide-react";
import logo from "@/assets/actes-logo-white.png";
import logoBlack from "@/assets/actes-logo-black.png";
import { InstallButton } from "@/components/acts/InstallButton";
import { SettingsDialog } from "@/components/acts/SettingsDialog";
import { useEffect } from "react";
import { notifyAppReady } from "@/lib/app-updater";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ACTES أكتس — منصة أنظمة الطاقة وحلولها" },
      { name: "description", content: "خدمة العملاء، بوابة المهندسين، واستقطاب كفاءات المهندسين في منصة أكتس لأنظمة الطاقة." },
      { property: "og:title", content: "ACTES أكتس — منصة أنظمة الطاقة وحلولها" },
      { property: "og:description", content: "اطلب عرض سعر لمنظومتك، استعرض المهندسين المعتمدين، أو انضم إلى قاعدة كفاءات ACTES." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const CARDS = [
  { to: "/quote", icon: Calculator, title: "خدمة العملاء", desc: "تمكين العملاء من طلب عروض أسعار لمنظومات الطاقة، وطلب الحسابات والتصاميم الهندسية المناسبة لاحتياجاتهم." },
  { to: "/engineers", icon: Users, title: "بوابة المهندسين", desc: "دليل للمهندسين المعتمدين، يتيح للعملاء استعراض ملفات المهندسين والتعرف على تخصصاتهم ومهاراتهم وخبراتهم وخدماتهم، ثم طلب المهندس المناسب لتنفيذ خدمة هندسية." },
  { to: "/join", icon: UserPlus, title: "إستقطاب كفاءات المهندسين", desc: "لطلاب الهندسة والمهندسين الراغبين في تسجيل قدراتهم ومهاراتهم والتقديم للانضمام إلى قاعدة كفاءات ACTES" },
] as const;

function HomePage() {
  const router = useRouter();
  useEffect(() => {
    notifyAppReady().catch(() => {});
    // Warm all three screens (code + CRM data) right away so taps open instantly.
    for (const c of CARDS) router.preloadRoute({ to: c.to }).catch(() => {});
  }, [router]);
  return (
    <main className="bg-ambient mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-safe pt-safe">
      <div className="relative flex flex-col items-center pt-3 text-center">
        <div className="absolute left-0 top-3"><SettingsDialog /></div>
        <img src={logo} alt="ACTES أكتس" width={505} height={218} className="h-12 w-auto logo-dark" /><img src={logoBlack} alt="ACTES أكتس" width={505} height={218} className="h-12 w-auto logo-light" />
        <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-border-strong bg-secondary/60 px-2.5 py-0.5 text-[10px] text-silver"><span className="size-1.5 rounded-full bg-blue" />طاقة شمسية • تصميم هندسي • كفاءات</span>
        <h1 className="text-gradient-silver title-ink mt-2 text-lg font-extrabold leading-snug">منصة أكتس لأنظمة الطاقة وحلولها</h1>
        <p className="text-[10px] tracking-widest text-blue">Energy Systems & Solutions</p>
      </div>
      <div className="mt-[clamp(20px,14vh,144px)] space-y-3.5">
        {CARDS.map((c, i) => (
          <Link key={c.to} to={c.to} preload="render" style={{ animationDelay: `${i * 80}ms` }}
            className={`${i === 1 ? "glass-blue" : i === 2 ? "glass-silver" : "glass-red"} animate-rise group relative flex items-start gap-3 overflow-hidden rounded-2xl p-3 transition-all active:scale-[0.98]`}>
            <span className={`pointer-events-none absolute -left-8 -top-8 size-28 rounded-full blur-2xl ${i === 1 ? "bg-blue/25" : i === 2 ? "bg-silver/20" : "bg-primary/30"}`} />
            <span className={`absolute inset-y-0 right-0 w-1 ${i === 1 ? "bg-gradient-blue" : i === 2 ? "bg-silver" : "bg-gradient-red"}`} />
            <span className={`${i === 1 ? "bg-gradient-blue text-primary-foreground" : i === 2 ? "bg-silver text-background" : "bg-gradient-red shadow-glow text-primary-foreground"} flex size-10 shrink-0 items-center justify-center rounded-xl`}>
              <c.icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold">{c.title}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{c.desc}</span>
            </span>
            <ChevronLeft className="mt-2 size-4 shrink-0 text-muted-foreground group-hover:text-blue" />
          </Link>
        ))}
      </div>
      <div className="mt-3 flex justify-center pb-2"><InstallButton /></div>
    </main>
  );
}
