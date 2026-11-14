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
    <main className="bg-ambient mx-auto min-h-screen max-w-xl px-5 pb-32 pt-safe">
      <div className="flex flex-col items-center pt-10 text-center">
        <img src={logo} alt="ACTES أكتس" width={789} height={366} className="h-16 w-auto" />
        <h1 className="mt-4 text-xl font-bold">منصة أكتس لأنظمة الطاقة وحلولها</h1>
        <p className="mt-1 text-xs text-muted-foreground">Energy Systems & Solutions</p>
      </div>
      <div className="mt-8 space-y-4">
        {CARDS.map((c, i) => (
          <Link key={c.to} to={c.to} style={{ animationDelay: `${i * 80}ms` }}
            className="surface animate-rise group flex items-start gap-4 rounded-2xl border border-border p-5 transition-colors hover:border-primary/60">
            <span className="bg-gradient-red shadow-glow flex size-12 shrink-0 items-center justify-center rounded-xl text-primary-foreground">
              <c.icon className="size-6" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-bold">{c.title}</span>
              <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">{c.desc}</span>
            </span>
            <ChevronLeft className="mt-3 size-5 shrink-0 text-muted-foreground group-hover:text-primary" />
          </Link>
        ))}
      </div>
      <div className="mt-8 flex justify-center"><InstallButton /></div>
    </main>
  );
}
