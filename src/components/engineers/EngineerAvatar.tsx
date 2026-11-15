import { cn } from "@/lib/utils";

export function EngineerAvatar({ url, name, className }: { url: string | null; name: string; className?: string }) {
  const initial = name.replace(/^م\.\s*/, "").trim().slice(0, 1);
  return url ? (
    <img src={url} alt={name} loading="lazy" decoding="async" width={160} height={160} className={cn("shrink-0 rounded-2xl object-cover", className)} />
  ) : (
    <div className={cn("flex shrink-0 items-center justify-center rounded-2xl bg-gradient-red font-display text-2xl font-bold text-primary-foreground", className)}>{initial}</div>
  );
}
