import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/acts/PageHeader";
import { JoinWizard } from "@/components/join/JoinWizard";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "انضم إلى كفاءات أكتس الهندسية — ACTS" },
      { name: "description", content: "سجّل كطالب أو خريج أو مهندس ممارس في منصة أكتس واعرض مهاراتك ومشاريعك لعملاء الطاقة." },
      { property: "og:title", content: "انضم إلى كفاءات أكتس الهندسية" },
      { property: "og:description", content: "ثماني خطوات لإنشاء ملفك الهندسي والظهور في دليل المهندسين بعد اعتماد الإدارة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  return (
    <>
      <PageHeader compact title="انضم إلى أكتس" subtitle="للطلاب والخريجين والمهندسين ذوي الخبرة — أنشئ ملفك الهندسي وابدأ باستقبال طلبات العملاء." />
      <main className="mx-auto max-w-xl px-5">
        <JoinWizard />
      </main>
    </>
  );
}
