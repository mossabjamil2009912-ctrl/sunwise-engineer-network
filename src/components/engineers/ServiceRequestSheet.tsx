import { useServerFn } from "@tanstack/react-start";
import { FileText, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Chip, Field, SelectBox, SuccessCard, errMsg } from "@/components/acts/kit";
import { useUploader } from "@/components/acts/useUploader";
import { sendServiceRequest } from "@/lib/acts.functions";
import { GOVERNORATES, SERVICES } from "@/lib/acts-data";

type Target = { id: string | null; name: string | null };

export function ServiceRequestSheet({ open, onOpenChange, target }: { open: boolean; onOpenChange: (o: boolean) => void; target: Target }) {
  const send = useServerFn(sendServiceRequest);
  const { upload, uploading } = useUploader();
  const fileRef = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ service: "", name: "", phone: "", gov: "", city: "", location: "", description: "" });
  const [files, setFiles] = useState<{ url: string; name: string; image: boolean }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o && done) { setDone(false); setF({ service: "", name: "", phone: "", gov: "", city: "", location: "", description: "" }); setFiles([]); }
  };
  const ok = f.service && f.phone.replace(/\D/g, "").length >= 9 && f.description.trim().length >= 5;

  return (
    <Sheet open={open} onOpenChange={close}>
      <SheetContent side="bottom" dir="rtl" className="max-h-[92dvh] overflow-y-auto rounded-t-3xl border-border-strong bg-card px-5 pb-10">
        {done ? (
          <div className="pt-6">
            <SuccessCard title="تم إرسال طلب الخدمة" desc="سيراجع فريق أكتس طلبك ويتواصل معك لتأكيد التفاصيل والموعد." onBack={() => close(false)} backLabel="إغلاق" />
          </div>
        ) : (
          <div className="space-y-5">
            <SheetHeader className="text-right">
              <SheetTitle className="font-display text-xl">طلب خدمة هندسية</SheetTitle>
              <SheetDescription>{target.name ? `مع ${target.name}` : "سيختار فريق أكتس المهندس الأنسب لطلبك"}</SheetDescription>
            </SheetHeader>
            <Field label="نوع الخدمة *">
              <div className="flex flex-wrap gap-2">{SERVICES.map((s) => <Chip key={s} on={f.service === s} onClick={() => setF({ ...f, service: s })}>{s}</Chip>)}</div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الاسم"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={120} /></Field>
              <Field label="الهاتف / واتساب *"><Input dir="ltr" inputMode="tel" className="text-left" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/[^\d+\s-]/g, "") })} maxLength={20} /></Field>
              <Field label="المحافظة"><SelectBox value={f.gov} onChange={(g) => setF({ ...f, gov: g })} options={GOVERNORATES} placeholder="اختر" /></Field>
              <Field label="المدينة"><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} maxLength={80} /></Field>
            </div>
            <Field label="موقع المشروع"><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="الحي، الشارع، أو رابط الموقع" maxLength={300} /></Field>
            <Field label="وصف العمل *"><Textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="صف المطلوب: نوع المنظومة، المشكلة، الموعد المناسب..." maxLength={3000} /></Field>
            <Field label="مرفقات (صور أو PDF)" hint={`${files.length}/8`}>
              <div className="flex flex-wrap gap-2">
                {files.map((x, i) => (
                  <div key={x.url} className="relative size-20 overflow-hidden rounded-xl border border-border bg-secondary">
                    {x.image ? <img src={x.url} alt={x.name} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-1 p-1 text-[10px] text-muted-foreground"><FileText className="size-5" /><span className="line-clamp-1">{x.name}</span></div>}
                    <button type="button" aria-label="حذف" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="absolute left-1 top-1 rounded-full bg-background/80 p-0.5"><X className="size-3" /></button>
                  </div>
                ))}
                {files.length < 8 && (
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="flex size-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border-strong text-[11px] text-muted-foreground">
                    <Paperclip className="size-5" />{uploading ? "جارٍ الرفع" : "إرفاق"}
                  </button>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple hidden onChange={async (e) => {
                const list = Array.from(e.target.files ?? []).slice(0, 8 - files.length);
                e.target.value = "";
                setErr("");
                for (const file of list) {
                  try { const r = await upload(file); setFiles((p) => [...p, { ...r, image: file.type.startsWith("image/") }]); } catch (x) { setErr(errMsg(x)); }
                }
              }} />
            </Field>
            {err && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
            <Button variant="hero" size="xl" className="w-full" disabled={!ok || busy || uploading} onClick={async () => {
              setBusy(true); setErr("");
              try {
                await send({ data: {
                  engineer_id: target.id, name: f.name, phone: f.phone, service: f.service, governorate: f.gov, city: f.city,
                  location: f.location, description: target.id || !target.name ? f.description : `${f.description}\n(من ملف: ${target.name})`,
                  attachments: files.map(({ url, name }) => ({ url, name })),
                } });
                setDone(true);
              } catch (x) { setErr(errMsg(x)); } finally { setBusy(false); }
            }}>{busy ? "جارٍ الإرسال..." : "إرسال الطلب"}</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
