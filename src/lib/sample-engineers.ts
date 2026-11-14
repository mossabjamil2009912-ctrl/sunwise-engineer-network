import eng1 from "@/assets/eng-1.jpg";
import eng2 from "@/assets/eng-2.jpg";
import eng3 from "@/assets/eng-3.jpg";
import project1 from "@/assets/project-1.jpg";
import project2 from "@/assets/project-2.jpg";
import type { Engineer, Review } from "@/lib/acts.functions";

// Sample profiles shown only while the CRM has no approved engineers yet, so the directory is never empty.
// They are clearly labelled as samples; requests from them go to ACTES staff without an engineer attached.
export const isSampleId = (id: string) => id.startsWith("sample-");

export const SAMPLE_ENGINEERS: (Engineer & { reviews: Review[] })[] = [
  {
    id: "sample-1", kind: "engineer", name: "م. عبدالله الحميري", photo_url: eng1, specialty: "هندسة كهربائية",
    university: "جامعة صنعاء", grad_year: 2014, qualifications: "بكالوريوس هندسة كهربائية — قوى وآلات",
    skills: ["تصميم منظومات الطاقة الشمسية", "حسابات الأحمال", "لوحات توزيع", "أنظمة التأريض والحماية"],
    tools: ["AutoCAD", "PVsyst", "ETAP"], services: ["تصميم", "تنفيذ", "إشراف"], years_exp: 11,
    projects: [
      { title: "محطة طاقة شمسية لمصنع 125 كيلو", desc: "تصميم وإشراف على تركيب 221 لوحاً مع تخزين 192 كيلو وات ساعة.", images: [project1] },
      { title: "غرفة تحكم وتخزين لمستشفى خاص", desc: "تركيب إنفرترات هجينة مع رف بطاريات ليثيوم وحماية كاملة.", images: [project2] },
    ],
    governorate: "أمانة العاصمة", city: "صنعاء", bio: "مهندس كهرباء متخصص في المنظومات التجارية والمتوسطة، أشرف على أكثر من 80 مشروعاً.",
    avg: 4.8, count: 3,
    reviews: [
      { id: "r1", rating: 5, quality: 5, punctuality: 5, professionalism: 5, responsiveness: 4, comment: "عمل نظيف ومنظم، والتزم بالموعد تماماً.", reviewer_name: "أبو محمد", created_at: "2026-09-12" },
      { id: "r2", rating: 5, quality: 5, punctuality: 4, professionalism: 5, responsiveness: 5, comment: "شرح لنا كل شيء بالتفصيل قبل التركيب.", reviewer_name: "سالم", created_at: "2026-08-03" },
      { id: "r3", rating: 4, quality: 5, punctuality: 4, professionalism: 4, responsiveness: 4, comment: null, reviewer_name: "منى", created_at: "2026-06-21" },
    ],
  },
  {
    id: "sample-2", kind: "engineer", name: "م. رحاب العبسي", photo_url: eng2, specialty: "هندسة طاقة متجددة",
    university: "جامعة العلوم والتكنولوجيا", grad_year: 2018, qualifications: "ماجستير في أنظمة الطاقة المتجددة",
    skills: ["تصميم منظومات الطاقة الشمسية", "أنظمة البطاريات", "مضخات الطاقة الشمسية"],
    tools: ["PVsyst", "Helioscope", "MATLAB", "Excel"], services: ["تصميم", "استشارات"], years_exp: 7,
    projects: [{ title: "دراسة جدوى لمزرعة في تهامة", desc: "تقرير PVsyst كامل لمضخة 30 حصان مع مقارنة الديزل.", images: [project1] }],
    governorate: "تعز", city: "تعز", bio: "أصمم المنظومات بدقة وأعدّ تقارير PVsyst ومخططات SLD الاحترافية.",
    avg: 4.9, count: 2,
    reviews: [
      { id: "r4", rating: 5, quality: 5, punctuality: 5, professionalism: 5, responsiveness: 5, comment: "تقرير ممتاز وواضح جداً.", reviewer_name: "شركة النخبة", created_at: "2026-10-01" },
      { id: "r5", rating: 5, quality: 5, punctuality: 5, professionalism: 5, responsiveness: 4, comment: null, reviewer_name: "عمر", created_at: "2026-07-14" },
    ],
  },
  {
    id: "sample-3", kind: "engineer", name: "م. فهد الصبري", photo_url: eng3, specialty: "هندسة تحكم وأتمتة",
    university: "جامعة عدن", grad_year: 2021, qualifications: "بكالوريوس هندسة تحكم وأتمتة",
    skills: ["PLC", "SCADA", "صيانة الإنفرترات"], tools: ["TIA Portal", "AutoCAD", "Proteus"], services: ["صيانة", "برمجة", "تنفيذ"], years_exp: 4,
    projects: [{ title: "أتمتة محطة ضخ مياه", desc: "برمجة PLC لتشغيل المضخات آلياً حسب إنتاج الألواح.", images: [project2] }],
    governorate: "عدن", city: "المنصورة", bio: "متخصص في صيانة الإنفرترات وبرمجة أنظمة التحكم والمراقبة عن بُعد.",
    avg: 4.6, count: 1,
    reviews: [{ id: "r6", rating: 5, quality: 5, punctuality: 4, professionalism: 5, responsiveness: 5, comment: "أصلح العطل في نفس اليوم.", reviewer_name: "ناصر", created_at: "2026-09-30" }],
  },
];
