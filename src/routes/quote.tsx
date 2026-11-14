import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero-solar.jpg";
import { PageHeader } from "@/components/acts/PageHeader";
import { QuoteWizard } from "@/components/quote/QuoteWizard";
import { kwhPriceQuery } from "@/lib/queries";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: "احسب منظومتك واطلب عرض سعر — ACTS أكتس للطاقة" },
      { name: "description", content: "احسب منظومة الطاقة الشمسية المناسبة لمنزلك أو منشأتك في خطوات بسيطة واطلب عرض سعر من أكتس." },
      { property: "og:title", content: "احسب منظومتك واطلب عرض سعر — ACTS" },
      { property: "og:description", content: "ثلاث فئات منظومات محسوبة وفق فاتورتك ونمط استهلاكك، مع تقارير PVsyst ومخططات SLD." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(kwhPriceQuery()),
  component: QuotePage,
});

function QuotePage() {
  return (
    <>
      <PageHeader image={heroImg} title="منظومتك المثالية، محسوبة بدقة" subtitle="أجب عن بضعة أسئلة لنقترح عليك ثلاث منظومات تناسب استهلاكك، ثم اطلب عرض السعر." />
      <main className="mx-auto max-w-xl px-5">
        <QuoteWizard />
      </main>
    </>
  );
}
