import { Link } from "@tanstack/react-router";
import { Calculator, UserPlus, Users } from "lucide-react";

const TABS = [
  { to: "/", label: "عرض سعر", icon: Calculator, exact: true },
  { to: "/engineers", label: "دليل المهندسين", icon: Users, exact: false },
  { to: "/join", label: "انضم إلينا", icon: UserPlus, exact: false },
] as const;

export function BottomNav() {
  return (
    <nav className="glass shadow-nav fixed inset-x-0 bottom-0 z-40 border-t border-border pb-safe" aria-label="التنقل الرئيسي">
      <div className="mx-auto grid max-w-xl grid-cols-3 px-2 pt-1.5">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            activeOptions={{ exact: t.exact }}
            className="group relative flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold text-muted-foreground transition-colors data-[status=active]:text-foreground"
          >
            <span className="absolute -top-1.5 h-0.5 w-8 rounded-full bg-transparent transition-colors group-data-[status=active]:bg-gradient-red" />
            <span className="flex size-9 items-center justify-center rounded-xl transition-all group-data-[status=active]:bg-accent group-data-[status=active]:text-primary">
              <t.icon className="size-5" />
            </span>
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
