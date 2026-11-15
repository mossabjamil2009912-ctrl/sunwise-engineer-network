import type { Engineer, Review } from "./acts.functions";
import p1 from "@/assets/eng/e1.jpg";
import p2 from "@/assets/eng/e2.jpg";
import p3 from "@/assets/eng/e3.jpg";
import p4 from "@/assets/eng/e4.jpg";
import p5 from "@/assets/eng/e5.jpg";
import p6 from "@/assets/eng/e6.jpg";
import p7 from "@/assets/eng/e7.jpg";
import p8 from "@/assets/eng/e8.jpg";
import p9 from "@/assets/eng/e9.jpg";
import p10 from "@/assets/eng/e10.jpg";
import p11 from "@/assets/eng/e11.jpg";
import p12 from "@/assets/eng/e12.jpg";
import j1 from "@/assets/proj/p1.jpg";
import j2 from "@/assets/proj/p2.jpg";
import j3 from "@/assets/proj/p3.jpg";
import j4 from "@/assets/proj/p4.jpg";
const PIMG: string[] = [j1, j2, j3, j4];
// Project counts per engineer (min 9, max 26).
const PCOUNT = [26, 14, 11, 19, 9, 17, 12, 22, 10, 15, 13, 24];
const KINDS = [
  ["منظومة سكنية", 0, [5, 8, 10, 12]], ["منظومة ضخ بئر زراعي", 1, [15, 22, 30, 45]],
  ["منظومة تجارية", 2, [40, 60, 80, 120]], ["منظومة هجينة مع تخزين", 3, [10, 20, 30, 50]],
] as const;
const CITIES: Record<string, string[]> = {
  "أمانة العاصمة": ["صنعاء - حدة", "صنعاء - السبعين", "صنعاء - معين"], "تعز": ["تعز - القاهرة", "تعز - الحوبان"], "ذمار": ["ذمار - المدينة", "ذمار - عنس"],
  "عدن": ["عدن - المنصورة", "عدن - كريتر", "عدن - الشيخ عثمان"], "شبوة": ["عتق", "بيحان"], "حضرموت": ["المكلا", "سيئون"],
};
function genProjects(i: number, gov: string): Engineer["projects"] {
  const cities = CITIES[gov] ?? [gov];
  return Array.from({ length: PCOUNT[i] ?? 9 }, (_, k) => {
    const [name, img, sizes] = KINDS[(i + k) % KINDS.length]!;
    const kw = sizes[(i * 3 + k) % sizes.length]!;
    const panels = Math.round((kw * 1000) / 585);
    const bat = img === 1 ? "بدون بطاريات (VFD)" : `بطاريات ليثيوم ${Math.max(5, Math.round(kw * 1.5))} كيلوواط ساعة`;
    return {
      title: `${name} ${kw} كيلوواط`,
      desc: img === 1 ? "تصميم وتركيب مع مغير سرعة وحماية كاملة." : "تصميم وتنفيذ وتشغيل مع اختبار الأداء.",
      system: `${panels} لوح 585 واط • إنفرتر ${kw} كيلوواط • ${bat}`,
      location: `${cities[k % cities.length]}، ${gov}`,
      images: [PIMG[img]!, PIMG[(img + 1 + k) % 4]!],
    };
  });
}
const PHOTOS = [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12];
// Varied sample ratings (averages 5, 3.5, 4.3, 3, 4, 4.7 …)
const RATINGS = [[5,5],[3,4],[4,4,5],[3,3,3],[4,4],[5,4,5],[4,3,4],[5,4],[3,3,4],[5,5,5,4],[4,4,4],[4,4,5,4,4]];
const TOTALS = [324,47,186,32,93,271,58,142,39,215,76,118];
const NAMES = ["خالد","محمد","عبدالرحمن","فهد","سالم","ناصر"];


// Sample engineers requested by the owner; shown alongside CRM-approved engineers until real ones are added.
type E = Omit<Engineer, "avg" | "count" | "id" | "kind" | "photo_url" | "projects"> & { projects?: Engineer["projects"]; rv: [number, string, string][] };
const P = (t: string, d: string) => ({ title: t, desc: d, images: [] as string[] });

const RAW: E[] = [
  { name: "م. أحمد عبدالله الحمادي", specialty: "هندسة طاقة متجددة", university: "جامعة صنعاء", grad_year: 2014, qualifications: "ماجستير", skills: ["تصميم المنظومات", "حسابات الأحمال", "دراسات الجدوى"], tools: ["PVsyst", "AutoCAD", "Helioscope"], services: ["تصميم", "استشارات", "إشراف"], years_exp: 11, governorate: "أمانة العاصمة", city: "صنعاء", bio: "متخصص في تصميم ومحاكاة محطات الطاقة الشمسية التجارية والزراعية.", projects: [P("محطة 250 كيلوواط لمصنع أغذية", "تصميم ومحاكاة PVsyst وإشراف على التنفيذ.")], rv: [[5, "خالد", "دراسة دقيقة واحترافية عالية."], [5, "محمد", "التزام ممتاز بالمواعيد."]] },
  { name: "م. سامي علي الشرعبي", specialty: "هندسة طاقة متجددة", university: "جامعة تعز", grad_year: 2016, qualifications: "بكالوريوس", skills: ["تمديدات DC/AC", "هياكل التثبيت", "المنظومات الهجينة ومتحكمات MPPT"], tools: ["AutoCAD", "Excel"], services: ["تنفيذ", "صيانة", "برمجة"], years_exp: 9, governorate: "تعز", city: "تعز", bio: "تنفيذ منظومات سكنية وتجارية متكاملة.", projects: [P("منظومة 40 كيلوواط لمستشفى", "تركيب وبرمجة إنفرترات هجينة.")], rv: [[5, "عبدالرحمن", "عمل نظيف ومتقن."], [4, "فهد", "سريع الاستجابة."]] },
  { name: "م. عبدالكريم يحيى الآنسي", specialty: "هندسة طاقة متجددة", university: "جامعة ذمار", grad_year: 2018, qualifications: "بكالوريوس", skills: ["مغيرات سرعة المضخات VFD", "تصميم المنظومات"], tools: ["PVsyst", "Excel"], services: ["تصميم", "تنفيذ", "برمجة"], years_exp: 7, governorate: "ذمار", city: "ذمار", bio: "خبرة في منظومات ضخ الآبار الزراعية.", projects: [P("منظومة ضخ بئر 75 حصان", "تصميم وتركيب مع VFD.")], rv: [[5, "صالح", "وفّر علينا الديزل بالكامل."]] },
  { name: "م. وليد حسن باعباد", specialty: "هندسة كهربائية", university: "جامعة عدن", grad_year: 2012, qualifications: "بكالوريوس", skills: ["لوحات التوزيع والقواطع", "التأريض والحماية من الصواعق"], tools: ["AutoCAD", "ETAP"], services: ["تنفيذ", "تصميم", "إشراف"], years_exp: 13, governorate: "عدن", city: "المنصورة", bio: "لوحات توزيع ومنظومات تجارية.", projects: [P("مجمع تجاري 120 كيلوواط", "تصميم لوحات وإشراف.")], rv: [[5, "نبيل", "خبرة واضحة."], [4, "ماجد", "جيد جداً."]] },
  { name: "م. مروان عبده القاضي", specialty: "هندسة كهربائية", university: "جامعة إب", grad_year: 2017, qualifications: "بكالوريوس", skills: ["فحص البطاريات", "قياس العزل وتشخيص الأعطال"], tools: ["Excel"], services: ["صيانة", "تنفيذ"], years_exp: 8, governorate: "إب", city: "إب", bio: "صيانة وفحص منظومات البطاريات.", projects: [P("صيانة 30 منظومة سكنية", "فحص ومعايرة دورية.")], rv: [[4, "أيمن", "حل المشكلة بسرعة."]] },
  { name: "م. فيصل سالم العولقي", specialty: "هندسة كهربائية", university: "جامعة حضرموت", grad_year: 2015, qualifications: "بكالوريوس", skills: ["تمديدات DC/AC", "مراقبة الجودة والسلامة"], tools: ["AutoCAD", "MS Project"], services: ["تنفيذ", "إشراف", "استشارات"], years_exp: 10, governorate: "شبوة", city: "عتق", bio: "تنفيذ منظومات للمرافق الحكومية.", projects: [P("مدرسة 60 كيلوواط", "إشراف كامل على التنفيذ.")], rv: [[5, "علي", "محترف جداً."]] },
  { name: "م. هشام محمد الصبري", specialty: "هندسة اتصالات وشبكات", university: "جامعة صنعاء", grad_year: 2016, qualifications: "بكالوريوس", skills: ["إعداد المراقبة عن بُعد", "ربط الإنفرترات بالإنترنت ومراكز المراقبة", "ربط أجهزة الطاقة بإنترنت الأشياء IoT"], tools: ["FusionSolar", "Solarman", "Modbus Poll"], services: ["برمجة", "صيانة", "استشارات"], years_exp: 9, governorate: "أمانة العاصمة", city: "صنعاء", bio: "مراقبة المحطات وربطها بالمنصات السحابية.", projects: [P("مراقبة 15 محطة لحظياً", "لوحة مراقبة وتنبيهات أعطال.")], rv: [[5, "ياسر", "صرت أتابع المنظومة من الجوال."]] },
  { name: "م. عادل ناصر المرادي", specialty: "هندسة اتصالات وشبكات", university: "جامعة سبأ", grad_year: 2019, qualifications: "بكالوريوس", skills: ["معالجة انقطاع الاتصال ونقل البيانات", "ضبط شبكات Wi-Fi / 4G / LAN في المحطات"], tools: ["Wireshark", "Deye Cloud"], services: ["صيانة", "برمجة"], years_exp: 6, governorate: "مأرب", city: "مأرب", bio: "شبكات واتصال محطات الطاقة.", projects: [P("ربط محطة زراعية بـ 4G", "مراقبة عن بُعد.")], rv: [[4, "حمود", "شغل ممتاز."]] },
  { name: "م. عمر سعيد بن شملان", specialty: "هندسة تحكم وأتمتة", university: "جامعة حضرموت", grad_year: 2013, qualifications: "ماجستير", skills: ["أنظمة إدارة الطاقة", "مغيرات سرعة المضخات VFD", "بروتوكولات Modbus/RS485/CAN"], tools: ["TIA Portal", "VictronConnect"], services: ["برمجة", "تنفيذ", "إشراف"], years_exp: 12, governorate: "حضرموت", city: "المكلا", bio: "أنظمة إدارة الطاقة والأتمتة الصناعية.", projects: [P("EMS لمصنع ثلج", "دمج شمسي وديزل وشبكة.")], rv: [[5, "سالم", "نظام ذكي ووفّر كثيراً."]] },
  { name: "م. رامي عبدالسلام الأغبري", specialty: "هندسة تحكم وأتمتة", university: "جامعة صنعاء", grad_year: 2020, qualifications: "بكالوريوس", skills: ["برمجة وضبط الإنفرترات", "مغيرات سرعة المضخات VFD"], tools: ["TIA Portal", "Solarman"], services: ["برمجة", "صيانة"], years_exp: 5, governorate: "صنعاء", city: "بني الحارث", bio: "برمجة مضخات وإنفرترات.", projects: [P("برمجة 20 مضخة زراعية", "ضبط VFD وحماية.")], rv: [[4, "عبدالله", "متعاون جداً."]] },
  { name: "م. ياسين أحمد الزبيدي", specialty: "هندسة ميكانيكية", university: "جامعة الحديدة", grad_year: 2015, qualifications: "بكالوريوس", skills: ["هياكل التثبيت", "إدارة المشاريع"], tools: ["SolidWorks", "AutoCAD"], services: ["تصميم", "تنفيذ", "إشراف"], years_exp: 10, governorate: "الحديدة", city: "الحديدة", bio: "تصميم هياكل التثبيت المقاومة للرياح والملوحة.", projects: [P("هياكل محطة ساحلية", "تصميم مقاوم للتآكل.")], rv: [[5, "إبراهيم", "هيكل متين جداً."]] },
  { name: "م. نزار خالد السقاف", specialty: "هندسة إلكترونيات", university: "جامعة صنعاء", grad_year: 2014, qualifications: "بكالوريوس", skills: ["صيانة ومعايرة الإنفرترات", "المنظومات الهجينة ومتحكمات MPPT"], tools: ["Proteus"], services: ["صيانة", "برمجة", "تصميم"], years_exp: 11, governorate: "أمانة العاصمة", city: "صنعاء", bio: "إصلاح كروت الإنفرترات ومتحكمات الشحن.", projects: [P("إصلاح أكثر من 300 إنفرتر", "مختلف الماركات.")], rv: [[5, "طارق", "أصلح الإنفرتر بعد ما يئست."], [5, "مهيب", "أمين وسعره مناسب."]] },
];

const uuid = (i: number) => `5a3e0000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;

export const SAMPLE: { engineer: Omit<Engineer, "avg" | "count">; reviews: Review[] }[] = RAW.map(({ rv, ...e }, i) => ({
  engineer: { ...e, review_total: TOTALS[i] ?? 32, id: uuid(i), kind: "engineer", photo_url: PHOTOS[i] ?? null, projects: genProjects(i, e.governorate ?? "") },
  reviews: (RATINGS[i] ?? rv.map((x) => x[0])).map((r, j) => [r, rv[j]?.[1] ?? NAMES[j % NAMES.length], rv[j]?.[2] ?? (r >= 4 ? "تعامل محترم وعمل جيد." : "العمل مقبول ويحتاج سرعة أكبر.")] as [number, string, string]).map(([r, n, c], j) => ({ id: uuid(100 + i * 10 + j), rating: r, quality: r, punctuality: r, professionalism: r, responsiveness: Math.max(4, r - (j % 2)), comment: c, reviewer_name: n, created_at: "2026-10-01T10:00:00Z" })),
}));

export const sampleList = (): Engineer[] =>
  SAMPLE.map(({ engineer, reviews }, i) => ({ ...engineer, count: TOTALS[i] ?? reviews.length, avg: reviews.reduce((a, r) => a + r.rating, 0) / reviews.length }));
export const sampleById = (id: string) => SAMPLE.find((s) => s.engineer.id === id);
