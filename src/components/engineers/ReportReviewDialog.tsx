import { useServerFn } from "@tanstack/react-start";
import { Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { errMsg } from "@/components/acts/kit";
import { reportReview } from "@/lib/acts.functions";

export function ReportReviewDialog({ reviewId, sample }: { reviewId: string; sample?: boolean }) {
  const send = useServerFn(reportReview);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"><Flag className="size-3" />إبلاغ</button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="rounded-3xl border-border-strong bg-card">
        <DialogHeader className="text-right">
          <DialogTitle className="font-display">الإبلاغ عن تقييم</DialogTitle>
          <DialogDescription>ستراجع إدارة أكتس التقييم وتتخذ الإجراء المناسب.</DialogDescription>
        </DialogHeader>
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="سبب الإبلاغ..." maxLength={500} />
        <Button variant="hero" size="lg" disabled={reason.trim().length < 3 || busy} onClick={async () => {
          if (sample) { toast("هذا تقييم ضمن ملف تجريبي"); setOpen(false); return; }
          setBusy(true);
          try { await send({ data: { review_id: reviewId, reason } }); toast.success("تم إرسال البلاغ، شكراً لك"); setOpen(false); setReason(""); }
          catch (e) { toast.error(errMsg(e)); } finally { setBusy(false); }
        }}>{busy ? "جارٍ الإرسال..." : "إرسال البلاغ"}</Button>
      </DialogContent>
    </Dialog>
  );
}
