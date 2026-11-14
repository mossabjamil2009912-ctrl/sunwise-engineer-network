import type { ReactNode } from "react";
import logo from "@/assets/actes-logo-white.png";
import { InstallButton } from "@/components/acts/InstallButton";
import { cn } from "@/lib/utils";

export function PageHeader({ title, subtitle, image, children, compact }: { title: string; subtitle?: string; image?: string; children?: ReactNode; compact?: boolean }) {
  return (
    <header className={cn("relative overflow-hidden pt-safe", compact ? "pb-5" : "pb-8")}>
      {image ? (
        <>
          <img src={image} alt="" width={1280} height={832} className="absolute inset-0 h-full w-full object-cover opacity-70" />
          <div className="bg-hero-fade absolute inset-0" />
        </>
      ) : (
        <div className="bg-ambient absolute inset-0" />
      )}
      <div className="pointer-events-none absolute -top-20 left-[4%] h-56 w-1.5 rotate-[35deg] bg-gradient-red opacity-80" />
      <div className="relative mx-auto max-w-xl px-5">
        <div className="flex items-center justify-between pt-4">
          <img src={logo} alt="ACTES أكتس لأنظمة الطاقة وحلولها" width={789} height={366} className="h-10 w-auto" />
          <InstallButton />
        </div>
        <div className={cn("animate-rise", compact ? "mt-5" : "mt-10")}>
          <h1 className="text-[1.7rem] font-bold leading-tight">{title}</h1>
          {subtitle && <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{subtitle}</p>}
        </div>
        {children}
      </div>
    </header>
  );
}
