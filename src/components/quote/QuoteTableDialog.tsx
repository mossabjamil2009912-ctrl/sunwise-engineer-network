import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import header from "@/assets/quote-header.jpg";
import qr from "@/assets/quote-qr.jpg";
import { presetPrice, type Preset } from "@/lib/sizing";

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
        <div className="sticky bottom-0 bg-white p-3">
          <button type="button" onClick={onChoose} className="h-12 w-full rounded-xl bg-gradient-red font-display text-sm font-bold text-primary-foreground shadow-glow">اختيار هذه المنظومة والمتابعة</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
