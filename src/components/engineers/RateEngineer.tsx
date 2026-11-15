import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function RateEngineer({ onSubmit }: { onSubmit: (rating: number, name: string, comment: string) => void }) {
  const [r, setR] = useState(0);
  const [name, setName] = useState("");
  const [c, setC] = useState("");
  const send = () => {
    if (!r) return toast.error("اختر عدد النجوم أولاً");
    onSubmit(r, name.trim(), c.trim());
    setR(0); setName(""); setC("");
    toast.success("شكراً، تم إضافة تقييمك");
  };
  return (
    <section className="surface space-y-3 rounded-3xl p-5">
      <h2 className="text-base font-bold">قيّم المهندس</h2>
      <div className="flex justify-center gap-2" dir="ltr">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} نجوم`} onClick={() => setR(n)}>
            <Star className={cn("size-8 transition", n <= r ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
          </button>
        ))}
      </div>
      <Input placeholder="اسمك (اختياري)" value={name} onChange={(e) => setName(e.target.value)} />
      <Textarea placeholder="تعليقك (اختياري)" rows={2} value={c} onChange={(e) => setC(e.target.value)} />
      <Button variant="hero" className="w-full" onClick={send}>إرسال التقييم</Button>
    </section>
  );
}
