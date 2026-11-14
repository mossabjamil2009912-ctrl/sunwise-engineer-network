import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/actes-logo-white.png";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Panel, StarInput, SuccessCard, errMsg } from "@/components/acts/kit";
import { submitReview } from "@/lib/acts.functions";
import { reviewInfoQuery } from "@/lib/queries";

export const Route = createFileRoute("/rate/$token")({
  head: () => ({
    meta: [
      { title: "قيّم الخدمة الهندسية — ACTS أكتس" },
      { name: "description", content: "شاركنا تقييمك للخدمة الهندسية التي حصلت عليها عبر منصة أكتس." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "قيّم الخدمة الهندسية — ACTS" },
      { property: "og:description", content: "تقييمك يساعدنا في الحفاظ على جودة مهندسي أكتس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(reviewInfoQuery(params.token)),
  component: RatePage,
});

const SUB = [["quality", "جودة العمل"], ["punctuality", "الالتزام بالمواعيد"], ["professionalism", "الاحترافية"], ["responsiveness", "سرعة الاستجابة"]] as const;
type SubKey = (typeof SUB)[number][0];
const WORDS = ["", "ضعيف", "مقبول", "جيد", "جيد جداً", "ممتاز"];

function RatePage() {
  const { token } = Route.useParams();
  const { data } = useSuspenseQuery(reviewInfoQuery(token));
  const send = useServerFn(submitReview);
  const [rating, setRating] = useState(0);
  const [s, setS] = useState<Record<SubKey, number>>({ quality: 0, punctuality: 0, professionalism: 0, responsiveness: 0 });
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const ready = rating > 0 && SUB.every(([k]) => s[k] > 0);

  let body: React.ReactNode;
  if (!data.ok) body = <Notice icon={<ShieldAlert className="size-8" />} title="رابط التقييم غير صالح" desc="تأكد من فتح الرابط كاملاً كما وصلك من فريق أكتس." />;
  else if (data.reviewed || done) body = done
    ? <SuccessCard title="شكراً لتقييمك" desc="تقييمك يساعدنا في الحفاظ على جودة الخدمة ويساعد العملاء في اختيار المهندس المناسب." />
    : <Notice icon={<CheckCircle2 className="size-8" />} title="تم تقييم هذه الخدمة مسبقاً" desc="شكراً لك، وصلنا تقييمك لهذا الطلب." />;
  else if (data.status !== "done") body = <Notice icon={<Clock className="size-8" />} title="الخدمة لم تكتمل بعد" desc="يمكنك التقييم بعد أن يؤكد فريق أكتس اكتمال الخدمة." />;
  else body = (
    <Panel className="animate-rise space-y-6">
      <div className="space-y-1 text-center">
        <p className="text-xs text-muted-foreground">{data.service}</p>
        <h1 className="text-xl font-bold">كيف كانت تجربتك{data.engineer ? ` مع ${data.engineer}` : ""}؟</h1>
      </div>
      <div className="space-y-2 text-center">
        <div className="flex justify-center"><StarInput size="lg" label="" value={rating} onChange={setRating} /></div>
        <p className="h-5 font-display text-sm font-semibold text-primary">{WORDS[rating]}</p>
      </div>
      <div className="space-y-4 rounded-2xl bg-secondary/50 p-4">
        {SUB.map(([k, l]) => <StarInput key={k} label={l} value={s[k]} onChange={(n) => setS({ ...s, [k]: n })} />)}
      </div>
      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تعليقك عن الخدمة (اختياري)" maxLength={1500} />
      {err && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
      <Button variant="hero" size="xl" className="w-full" disabled={!ready || busy} onClick={async () => {
        setBusy(true); setErr("");
        try { await send({ data: { token, rating, ...s, comment } }); setDone(true); } catch (e) { setErr(errMsg(e)); } finally { setBusy(false); }
      }}>{busy ? "جارٍ الإرسال..." : "إرسال التقييم"}</Button>
    </Panel>
  );

  return (
    <div className="relative min-h-dvh overflow-hidden pt-safe">
      <div className="bg-ambient absolute inset-0" />
      <div className="pointer-events-none absolute -top-20 left-[4%] h-56 w-1.5 rotate-[35deg] bg-gradient-red opacity-80" />
      <div className="relative mx-auto max-w-md space-y-8 px-5 py-8">
        <Link to="/" className="mx-auto block w-fit"><img src={logo} alt="ACTES أكتس" width={789} height={366} className="h-12 w-auto" /></Link>
        {body}
      </div>
    </div>
  );
}

function Notice({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Panel className="animate-rise space-y-4 p-8 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-accent text-primary">{icon}</div>
      <h1 className="text-lg font-bold">{title}</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <Button asChild variant="glass"><Link to="/">الذهاب إلى أكتس</Link></Button>
    </Panel>
  );
}
