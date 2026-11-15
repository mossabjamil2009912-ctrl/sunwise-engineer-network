import { createFileRoute, Link } from "@tanstack/react-router";
import { Calculator, ChevronLeft, UserPlus, Users } from "lucide-react";
import logo from "@/assets/actes-logo-white.png";
import { InstallButton } from "@/components/acts/InstallButton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ACTS أكتس — منصة أنظمة الطاقة وحلولها" },
      { name: "description", content: "خدمة العملاء، بوابة المهندسين، واستقطاب كفاءات المهندسين في منصة أكتس لأنظمة الطاقة." },
      { property: "og:title", content: "ACTS أكتس — منصة أنظمة الطاقة وحلولها" },
      { property: "og:description", content: "اطلب عرض سعر لمنظومتك، استعرض المهندسين المعتمدين، أو انضم إلى قاعدة كفاءات ACTS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const CARDS = [
  { to: "/quote", icon: Calculator, title: "خدمة العملاء", desc: "تمكين العملاء من طلب عروض أسعار لمنظومات الطاقة، وطلب الحسابات والتصاميم الهندسية المناسبة لاحتياجاتهم." },
  { to: "/engineers", icon: Users, title: "بوابة المهندسين", desc: "دليل للمهندسين المعتمدين، يتيح للعملاء استعراض ملفات المهندسين والتعرف على تخصصاتهم ومهاراتهم وخبراتهم وخدماتهم، ثم طلب المهندس المناسب لتنفيذ خدمة هندسية." },
  { to: "/join", icon: UserPlus, title: "إستقطاب كفاءات المهندسين", desc: "لطلاب الهندسة والمهندسين الراغبين في تسجيل قدراتهم ومهاراتهم والتقديم للانضمام إلى قاعدة كفاءات ACTS" },
] as const;

function HomePage() {
  return (
    <main className="bg-ambient mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-safe pt-safe">
      <div className="flex flex-col items-center pt-5 text-center">
        <img src={logo} alt="ACTES أكتس" width={789} height={366} className="h-10 w-auto" />
        <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-border-strong bg-secondary/60 px-2.5 py-0.5 text-[10px] text-silver"><span className="size-1.5 rounded-full bg-blue" />طاقة شمسية • تصميم هندسي • كفاءات</span>
        <h1 className="text-gradient-silver mt-2 text-lg font-extrabold leading-snug">منصة أكتس لأنظمة الطاقة وحلولها</h1>
        <p className="text-[10px] tracking-widest text-blue">Energy Systems & Solutions</p>
      </div>
      <div className="mt-4 space-y-2.5">
        {CARDS.map((c, i) => (
          <Link key={c.to} to={c.to} style={{ animationDelay: `${i * 80}ms` }}
            className="surface animate-rise group relative flex items-start gap-3 overflow-hidden rounded-2xl p-3.5 transition-all active:scale-[0.98] hover:border-blue/60">
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
      <div className="mt-4 flex justify-center pb-3"><InstallButton /></div>
    </main>
  );
}
