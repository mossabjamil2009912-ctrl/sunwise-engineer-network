import { useEffect, useState } from "react";
import logo from "@/assets/actes-logo-white.png";

// Launch screen: pure CSS fade-out so it renders identically on server and client.
export function Splash() {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setGone(true), 1700);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] flex animate-splash-out flex-col items-center justify-center overflow-hidden bg-background">
      <div className="absolute -top-24 left-[38%] h-[70vh] w-2 animate-slash bg-gradient-red opacity-80 blur-[1px]" />
      <div className="bg-ambient absolute inset-0" />
      <img src={logo} alt="" width={789} height={366} className="relative w-52 animate-splash-logo" />
      <p className="relative mt-5 animate-rise text-sm tracking-wide text-muted-foreground [animation-delay:0.35s]">Energy Systems & Solutions</p>
    </div>
  );
}
