import { Download, Share } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallButton() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone;
    if (standalone) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIos(isIos);
    if (isIos) setShow(true);
    const h = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); setShow(true); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  if (!show) return null;
  return (
    <button
      type="button"
      onClick={async () => {
        if (evt) { await evt.prompt(); setEvt(null); setShow(false); return; }
        if (ios) toast("ثبّت أكتس على جهازك", { description: "اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».", icon: <Share className="size-4" /> });
      }}
      className="glass flex items-center gap-1.5 rounded-full border border-border-strong px-3 py-1.5 text-xs font-semibold"
    >
      <Download className="size-3.5 text-primary" /> ثبّت التطبيق
    </button>
  );
}
