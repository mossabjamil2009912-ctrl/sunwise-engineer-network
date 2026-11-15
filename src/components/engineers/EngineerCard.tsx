import { Link } from "@tanstack/react-router";
import { MapPin, Star } from "lucide-react";
import { EngineerAvatar } from "@/components/engineers/EngineerAvatar";
import { useLocalReviews } from "@/hooks/use-local-reviews";
import type { Engineer } from "@/lib/acts.functions";

export function EngineerCard({ e }: { e: Engineer }) {
  const { list } = useLocalReviews(e.id);
  const count = e.count + list.length;
  const avg = count ? (e.avg * e.count + list.reduce((a, r) => a + r.rating, 0)) / count : 0;
  return (
    <Link to="/engineers/$id" params={{ id: e.id }} className="surface group relative flex animate-rise flex-col items-center gap-1 rounded-2xl p-2.5 text-center transition-all hover:border-border-strong">
      <span className="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-background/80 px-1 py-px font-display text-[8px] font-bold">
        <Star className="size-2 fill-current text-amber-400" />{(avg || 0).toFixed(1)}
      </span>
      <EngineerAvatar url={e.photo_url} name={e.name} className="size-14 rounded-full" />
      <p className="w-full truncate text-xs font-semibold">{e.name}</p>
      <span className="max-w-full truncate rounded-full tag-tech px-2 py-0.5 text-[10px]">{e.specialty}</span>
      <p className="flex items-center gap-0.5 text-[10px] text-muted-foreground"><MapPin className="size-2.5" />{e.governorate || "—"}</p>
    </Link>
  );
}
