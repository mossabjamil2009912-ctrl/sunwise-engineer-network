import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Chip, Field, SelectBox, SuccessCard, errMsg } from "@/components/acts/kit";
import { sendServiceRequest } from "@/lib/acts.functions";
import { GOVERNORATES, SERVICES } from "@/lib/acts-data";

type Target = { id: string | null; name: string | null; services?: string[] };

export function ServiceRequestSheet({ open, onOpenChange, target }: { open: boolean; onOpenChange: (o: boolean) => void; target: Target }) {
  const send = useServerFn(sendServiceRequest);
  const [f, setF] = useState({ service: "", name: "", phone: "", gov: "", city: "", location: "", description: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o && done) { setDone(false); setF({ service: "", name: "", phone: "", gov: "", city: "", location: "", description: "" }); }
  };
  const ok = f.service && f.phone.replace(/\D/g, "").length >= 9;

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
            <Field group label="نوع الخدمة *">
              <div className="flex flex-wrap gap-2">{(target.services?.length ? target.services : SERVICES).map((s) => <Chip key={s} on={f.service === s} onClick={() => setF({ ...f, service: s })}>{s}</Chip>)}</div>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الاسم"><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={120} /></Field>
              <Field label="الهاتف / واتساب *"><Input dir="ltr" inputMode="tel" className="text-left" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/[^\d+\s-]/g, "") })} maxLength={20} /></Field>
              <Field label="المحافظة"><SelectBox value={f.gov} onChange={(g) => setF({ ...f, gov: g })} options={GOVERNORATES} placeholder="اختر" /></Field>
            </div>
            <Field label="موقع المشروع"><Input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="الحي، الشارع، أو رابط الموقع" maxLength={300} /></Field>
            {err && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
            <Button variant="hero" size="xl" className="w-full" disabled={!ok || busy} onClick={async () => {
              setBusy(true); setErr("");
              try {
                await send({ data: {
                  engineer_id: target.id, name: f.name, phone: f.phone, service: f.service, governorate: f.gov,
                  location: f.location, description: `طلب خدمة: ${f.service}${target.name ? ` — مع ${target.name}` : ""}`,
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
