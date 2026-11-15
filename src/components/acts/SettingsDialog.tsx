import { useEffect, useRef, useState } from "react";
import { Settings, RefreshCw, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { APP_VERSION, checkAndApplyUpdate, getServiceUrl, setServiceUrl, type UpdateStatus } from "@/lib/app-updater";

const LABEL: Record<UpdateStatus, string> = {
  checking: "جارٍ البحث عن تحديث...",
  downloading: "جارٍ التنزيل...",
  applying: "جارٍ تطبيق التحديث...",
  latest: "تطبيقك على أحدث إصدار",
  error: "حدث خطأ",
};

export function SettingsDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [msg, setMsg] = useState<string>();
  useEffect(() => { if (open) { setUrl(getServiceUrl()); setStatus(null); } }, [open]);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const start = () => { stop(); timer.current = setTimeout(() => setOpen(true), 5000); };
  const stop = () => { if (timer.current) clearTimeout(timer.current); timer.current = undefined; };
  const run = () => checkAndApplyUpdate((s, m) => { setStatus(s); setMsg(m); });
  const busy = status === "checking" || status === "downloading" || status === "applying";
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button type="button" aria-label="الإعدادات"
        onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
        onContextMenu={(e) => e.preventDefault()}
        className="select-none touch-none rounded-full border border-border-strong bg-secondary/60 p-2 text-silver">
        <Settings className="size-4" />
      </button>
      <DialogContent dir="rtl" className="max-w-sm">
        <DialogHeader><DialogTitle>الإعدادات</DialogTitle></DialogHeader>
        <label className="text-sm font-semibold">عنوان خدمة الإدارة</label>
        <input dir="ltr" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..."
          className="h-11 w-full rounded-xl border border-border-strong bg-secondary/60 px-3 text-sm outline-none focus:ring-2 focus:ring-blue/30" />
        <button onClick={() => { setServiceUrl(url); setUrl(getServiceUrl()); run(); }}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-bold"><Save className="size-4" />حفظ الرابط</button>
        <button disabled={busy} onClick={run}
          className="bg-gradient-red flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-bold text-primary-foreground disabled:opacity-60">
          <RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />تحديث التطبيق
        </button>
        {status && <p className={`text-center text-sm ${status === "error" ? "text-primary" : "text-silver"}`}>{LABEL[status]}{msg ? ` — ${msg}` : ""}</p>}
        <p className="text-center text-[10px] text-muted-foreground">الإصدار {APP_VERSION}</p>
      </DialogContent>
    </Dialog>
  );
}
