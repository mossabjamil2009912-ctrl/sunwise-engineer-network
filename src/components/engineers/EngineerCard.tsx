import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { EngineerAvatar } from "@/components/engineers/EngineerAvatar";
import { useLocalReviews } from "@/hooks/use-local-reviews";
import type { Engineer } from "@/lib/acts.functions";

export function EngineerCard({ e }: { e: Engineer }) {
  const { list } = useLocalReviews(e.id);
  const count = e.count + list.length;
  const avg = count ? (e.avg * e.count + list.reduce((a, r) => a + r.rating, 0)) / count : 0;
  return (
    <Link
      to="/engineers/$id"
      params={{ id: e.id }}
      className="group relative flex animate-rise flex-col items-center gap-1.5 overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-card to-background p-3.5 text-center shadow-lg transition-all duration-200 hover:border-border-strong active:scale-[0.98]"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary/70 to-transparent" />
      <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full border border-border bg-background/70 px-1.5 py-0.5 font-display text-[10px] font-bold backdrop-blur">
        <Star className="size-2.5 fill-current text-amber-400" />{(avg || 0).toFixed(1)}
      </span>
      <div className="relative mt-1">
        <div className="rounded-full bg-gradient-to-b from-foreground/40 to-border p-[2px]">
          <EngineerAvatar url={e.photo_url} name={e.name} className="size-20 rounded-full ring-2 ring-background" />
        </div>
        <BadgeCheck aria-label="معتمد من أكتس" className="absolute -bottom-0.5 -left-0.5 size-5 rounded-full bg-background fill-primary text-primary-foreground" />
      </div>
      <p className="mt-1 w-full truncate text-sm font-bold">{e.name}</p>
      <span className="max-w-full truncate rounded-full tag-tech px-2.5 py-0.5 text-[11px]">{e.specialty}</span>
      <p className="flex items-center gap-1 text-[11px] text-muted-foreground"><MapPin className="size-3 text-primary" />{e.governorate || "—"}</p>
      <span className="mt-0.5 text-[10px] font-semibold text-muted-foreground">معتمد من أكتس</span>
    </Link>
  );
}
