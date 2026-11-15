import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import header from "@/assets/quote-header.jpg";
import qr from "@/assets/quote-qr.jpg";
import { presetPrice, type Preset } from "@/lib/sizing";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileBarChart2, Network, ShoppingCart, CheckCircle2 } from "lucide-react";
import { sendReportRequest } from "@/lib/acts.functions";
import { GOVERNORATES } from "@/lib/acts-data";

const money = (n: number) => "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });

export function QuoteTableDialog({ p, open, onOpenChange, onChoose }: { p: Preset; open: boolean; onOpenChange: (v: boolean) => void; onChoose: () => void }) {
  const lines = p.lines ?? [];
  const d = new Date();
  const pad = (x: number) => String(x).padStart(2, "0");
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  const notes = [
    "الأسعار غير شاملة أعمال التركيب ما لم يُذكر خلاف ذلك.",
    ...(lines.some((l) => /كابل/.test(l.name)) ? ["كمية الكابل (1 متر) لتحديد سعر المتر، ويُحدد الطول الفعلي حسب مسافة الموقع."] : []),
  ];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] w-[96vw] max-w-lg overflow-y-auto border-0 bg-white p-0">
        <div className="qt">
          <DialogTitle className="sr-only">عرض سعر {p.title}</DialogTitle>
          <DialogDescription className="sr-only">جدول أصناف المنظومة وأسعارها</DialogDescription>
          <img className="hdr" src={header} alt="ACTES" />
          <table className="info"><tbody>
            <tr><td className="l">المنظومة:</td><td className="val">{p.title}</td><td className="l">التاريخ:</td><td className="val"><span className="ltr">{date}</span></td></tr>
            <tr><td className="l">العملة:</td><td className="val">الدولار الأمريكي</td><td /><td /></tr>
          </tbody></table>
          <table className="items">
            <colgroup><col style={{ width: 16 }} /><col /><col style={{ width: 28 }} /><col style={{ width: 26 }} /><col style={{ width: 36 }} /><col style={{ width: 40 }} /></colgroup>
            <thead><tr><th>م</th><th>الصنف والمواصفات</th><th>الوحدة</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="it">
                  <td className="c">{i + 1}</td>
                  <td><div className="t">{l.name}</div>{!!l.specs?.length && <div className="sp">{l.specs.map((s, j) => <div key={j} className="sl">{s}</div>)}</div>}</td>
                  <td className="c">{l.unit ?? "حبة"}</td>
                  <td className="c">{l.qty}</td>
                  <td className="m"><span className="ltr">{money(l.price)}</span></td>
                  <td className="m"><span className="ltr">{money(l.price * l.qty)}</span></td>
                </tr>
              ))}
              <tr className="tot"><td colSpan={5} className="lbl">الإجمالي الكلي</td><td className="m"><span className="ltr">{money(presetPrice(p))}</span></td></tr>
            </tbody>
          </table>
          <div className="notes"><b>ملاحظات:</b><br />{notes.map((n, i) => <div key={i}>{i + 1}. {n}</div>)}</div>
          <table className="ft"><tbody><tr>
            <td style={{ width: 44 }}><img src={qr} alt="QR" /></td>
            <td style={{ textAlign: "center" }}><span className="ltr">www.actesgroup.com · info@actesgroup.com</span></td>
          </tr></tbody></table>
        </div>
        <ReportActions p={p} onChoose={onChoose} />
      </DialogContent>
    </Dialog>
  );
}

const MSG = {
  pvsyst: "تم استلام طلب دراسة PVsyst بنجاح! فريق أكتس الهندسي يعمل حالياً على دراسة منظومتك وسيرسل لك تقرير المحاكاة عبر الواتساب خلال الساعات القادمة.",
  sld: "تم استلام طلب مخطط التوصيل (SLD) بنجاح! فريق أكتس الهندسي يقوم بتجهيز المخطط وسيرسله لك عبر الواتساب خلال الساعات القادمة.",
};

function ReportActions({ p, onChoose }: { p: Preset; onChoose: () => void }) {
  const send = useServerFn(sendReportRequest);
  const [kind, setKind] = useState<null | "pvsyst" | "sld">(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<null | "pvsyst" | "sld">(null);
  const inp = "h-11 w-full rounded-xl border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 outline-none focus:border-blue-600";
  const submit = async () => {
    if (!kind) return;
    setErr("");
    if (name.trim().length < 2 || phone.replace(/\D/g, "").length < 7 || (kind === "pvsyst" && !city)) { setErr("يرجى تعبئة جميع الخانات"); return; }
    setBusy(true);
    try { await send({ data: { kind, name, phone, city: kind === "pvsyst" ? city : undefined, system: p.title, price: presetPrice(p) || 1 } }); setDone(kind); setKind(null); }
    catch (e) { setErr(e instanceof Error ? e.message : "تعذّر إرسال الطلب"); }
    finally { setBusy(false); }
  };
  const btn = (k: "pvsyst" | "sld", label: string, Icon: typeof Network) => (
    <button type="button" onClick={() => { setKind(kind === k ? null : k); setDone(null); setErr(""); }}
      className={"flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border-2 font-display text-xs font-bold transition " + (kind === k ? "border-blue-700 bg-blue-700 text-white" : "border-blue-700/40 bg-blue-50 text-blue-900")}>
      <Icon className="size-4" />{label}
    </button>
  );
  return (
    <div className="sticky bottom-0 space-y-2 border-t border-slate-200 bg-white p-3">
      {done && <div className="flex gap-2 rounded-xl bg-emerald-50 p-3 text-xs leading-6 text-emerald-900"><CheckCircle2 className="mt-1 size-4 shrink-0" />{MSG[done]}</div>}
      {kind && (
        <div className="space-y-2 rounded-xl bg-slate-100 p-3">
          <input className={inp} placeholder="الاسم الكامل" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={inp} placeholder="رقم الواتساب" inputMode="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))))} />
          {kind === "pvsyst" && (
            <select className={inp} value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">المحافظة</option>
              {GOVERNORATES.map((g) => { const v = typeof g === "string" ? g : (g as { value: string }).value; const l = typeof g === "string" ? g : (g as { label?: string; value: string }).label ?? v; return <option key={v} value={v}>{l}</option>; })}
            </select>
          )}
          {err && <p className="text-xs font-bold text-red-600">{err}</p>}
          <button type="button" disabled={busy} onClick={submit} className="h-11 w-full rounded-xl bg-blue-800 font-display text-sm font-bold text-white disabled:opacity-60">{busy ? "جارٍ الإرسال…" : kind === "pvsyst" ? "إرسال طلب دراسة PVsyst" : "إرسال طلب مخطط SLD"}</button>
        </div>
      )}
      <div className="flex gap-2">
        {btn("pvsyst", "دراسة PVsyst", FileBarChart2)}
        {btn("sld", "مخطط SLD", Network)}
      </div>
      <button type="button" onClick={onChoose} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-red font-display text-sm font-bold text-primary-foreground shadow-glow"><ShoppingCart className="size-4" />متابعة الشراء</button>
    </div>
  );
}
