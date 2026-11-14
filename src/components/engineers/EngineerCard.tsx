import { Link } from "@tanstack/react-router";
import { Award, ChevronLeft, MapPin } from "lucide-react";
import { Stars } from "@/components/acts/kit";
import { EngineerAvatar } from "@/components/engineers/EngineerAvatar";
import type { Engineer } from "@/lib/acts.functions";

export function EngineerCard({ e }: { e: Engineer }) {
  return (
    <Link to="/engineers/$id" params={{ id: e.id }} className="surface group flex animate-rise items-center gap-4 rounded-3xl p-3.5 transition-all hover:border-border-strong">
      <div className="relative">
        <EngineerAvatar url={e.photo_url} name={e.name} className="size-20" />
        {e.years_exp >= 5 && (
          <span className="absolute -bottom-1.5 -left-1.5 flex size-7 items-center justify-center rounded-full border-2 border-card bg-gradient-red text-primary-foreground" title="خبرة معتمدة">
            <Award className="size-3.5" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-display font-semibold">{e.name}</p>
        <span className="inline-block rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground">{e.specialty}</span>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3" />{[e.governorate, e.city].filter(Boolean).join(" - ") || "—"}
          <span className="opacity-50">·</span>{e.years_exp} سنوات خبرة
        </p>
        <p className="flex items-center gap-1.5 text-xs">
          <Stars value={e.avg} />
          <span className="font-display font-bold">{e.count ? e.avg.toFixed(1) : "جديد"}</span>
          {e.count > 0 && <span className="text-muted-foreground">({e.count})</span>}
        </p>
      </div>
      <ChevronLeft className="size-5 text-muted-foreground transition-transform group-hover:-translate-x-1" />
    </Link>
  );
}
