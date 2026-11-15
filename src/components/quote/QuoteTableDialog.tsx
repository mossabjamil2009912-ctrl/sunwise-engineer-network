import { BatteryCharging, Sun, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import logo from "@/assets/actes-logo-white.png";
import { batteryOf, dailyProduction, panelCount, presetPrice, type Preset } from "@/lib/sizing";

const fmt = (n: number, d = 1) => n.toLocaleString("en-US", { maximumFractionDigits: d });

export function QuoteTableDialog({ p, open, onOpenChange, onChoose }: { p: Preset; open: boolean; onOpenChange: (v: boolean) => void; onChoose: () => void }) {
  const lines = p.lines ?? [];
  const bat = batteryOf(p);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl" className="max-h-[90vh] w-[95vw] max-w-lg overflow-y-auto border-silver/30 bg-background/95 p-0 backdrop-blur-xl">
        <div className="border-b border-silver/20 bg-gradient-to-b from-secondary to-background px-4 pb-3 pt-5 text-center">
          <img src={logo} alt="ACTES" className="mx-auto h-9 w-auto" />
          <p className="mt-1 text-[10px] text-silver">أكتس لأنظمة وحلول الطاقة — ACTES Energy Systems</p>
          <DialogTitle className="mt-3 font-display text-base font-bold text-foreground">عرض سعر تقديري</DialogTitle>
          <DialogDescription className="text-xs text-silver">{p.title}</DialogDescription>
          <div className="mt-3 flex flex-wrap justify-center gap-2 text-[10px]">
            <span className="tag-tech flex items-center gap-1 rounded-full px-2 py-0.5"><Sun className="size-3 text-blue" />{fmt(dailyProduction(p))} ك.و.س/يوم</span>
            {bat > 0 && <span className="tag-tech flex items-center gap-1 rounded-full px-2 py-0.5"><BatteryCharging className="size-3 text-blue" />{fmt(bat, 2)} ك.و.س</span>}
            <span className="tag-tech flex items-center gap-1 rounded-full px-2 py-0.5"><Zap className="size-3 text-blue" />{panelCount(p)} لوح × {p.pw}W</span>
          </div>
        </div>
        <div className="px-3">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-secondary text-silver">
                <th className="p-2 text-center">#</th>
                <th className="p-2 text-right">الصنف والمواصفات</th>
                <th className="p-2 text-center">الكمية</th>
                <th className="p-2 text-center">السعر</th>
                <th className="p-2 text-center">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="border-b border-silver/15 align-top">
                  <td className="p-2 text-center text-silver">{i + 1}</td>
                  <td className="p-2">
                    <p className="font-semibold text-foreground">{l.name}</p>
                    {!!l.specs?.length && <ul className="mt-1 space-y-0.5 text-[9.5px] leading-relaxed text-muted-foreground">{l.specs.map((s, j) => <li key={j}>• {s}</li>)}</ul>}
                  </td>
                  <td className="whitespace-nowrap p-2 text-center">{fmt(l.qty, 2)} {l.unit ?? ""}</td>
                  <td className="whitespace-nowrap p-2 text-center">${fmt(l.price, 2)}</td>
                  <td className="whitespace-nowrap p-2 text-center font-bold">${fmt(l.price * l.qty, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="sticky bottom-0 space-y-3 border-t border-silver/20 bg-background/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold">الإجمالي</span>
            <span className="price-badge rounded-lg px-3 py-1 font-display text-lg font-bold">${fmt(presetPrice(p), 0)}</span>
          </div>
          <button type="button" onClick={onChoose} className="h-12 w-full rounded-xl bg-gradient-red font-display text-sm font-bold text-primary-foreground shadow-glow">اختيار هذه المنظومة والمتابعة</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
