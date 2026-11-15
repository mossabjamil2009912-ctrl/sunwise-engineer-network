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
import w_design1 from "@/assets/work/design1.jpg";
import w_design2 from "@/assets/work/design2.jpg";
import w_design3 from "@/assets/work/design3.jpg";
import w_install1 from "@/assets/work/install1.jpg";
import w_install2 from "@/assets/work/install2.jpg";
import w_install3 from "@/assets/work/install3.jpg";
import w_hv1 from "@/assets/work/hv1.jpg";
import w_hv2 from "@/assets/work/hv2.jpg";
import w_hv3 from "@/assets/work/hv3.jpg";
import w_lv1 from "@/assets/work/lv1.jpg";
import w_lv2 from "@/assets/work/lv2.jpg";
import w_lv3 from "@/assets/work/lv3.jpg";

import w_maint1 from "@/assets/work/maint1.jpg";
import w_maint2 from "@/assets/work/maint2.jpg";
import w_maint3 from "@/assets/work/maint3.jpg";
import w_telecom1 from "@/assets/work/telecom1.jpg";
import w_telecom2 from "@/assets/work/telecom2.jpg";
import w_telecom3 from "@/assets/work/telecom3.jpg";
import w_control1 from "@/assets/work/control1.jpg";
import w_control2 from "@/assets/work/control2.jpg";
import w_control3 from "@/assets/work/control3.jpg";
import w_mech1 from "@/assets/work/mech1.jpg";
import w_mech2 from "@/assets/work/mech2.jpg";
import w_mech3 from "@/assets/work/mech3.jpg";
import w_elec1 from "@/assets/work/elec1.jpg";
import w_elec2 from "@/assets/work/elec2.jpg";
import w_elec3 from "@/assets/work/elec3.jpg";
const WIMG: Record<string,string[]> = {design:[w_design1,w_design2,w_design3],install:[w_install1,w_install2,w_install3],hv:[w_hv1,w_hv2,w_hv3],lv:[w_lv1,w_lv2,w_lv3],maint:[w_maint1,w_maint2,w_maint3],telecom:[w_telecom1,w_telecom2,w_telecom3],control:[w_control1,w_control2,w_control3],mech:[w_mech1,w_mech2,w_mech3],elec:[w_elec1,w_elec2,w_elec3]};
type W = [string, string, string, number];
// 3 works per engineer, matching his actual role (title, description, scope, image index).
const WORKS: Record<string, W[]> = {
  hv: [
    ["تنفيذ محطة هجينة جهد عالي HV بقدرة 360 كيلوواط ذروة", "تركيب 500 لوح بقدرة 720 واط مع 4 إنفرترات هجينة جهد عالي وتخزين 1 ميجاوات/ساعة.", "500 لوح × 720W • 4 إنفرترات HV • تخزين 1MWh", 2],
    ["تنفيذ محطة تخزين صناعية جهد عالي 3 ميجاوات/ساعة", "تركيب كبائن بطاريات BESS جهد عالي وربطها بالمحطة الشمسية ولوحات الحماية.", "تخزين 3MWh • بطاريات HV • لوحات حماية وتوزيع", 0],
    ["تنفيذ محطة جهد عالي لمصنع بقدرة 250 كيلوواط", "تركيب الألواح والإنفرترات الصناعية وتشغيل المحطة واستلامها.", "350 لوح × 720W • إنفرترين HV • تخزين 500kWh", 1],
  ],
  lv: [
    ["تركيب منظومة جهد منخفض LV لمحل تجاري 15 كيلوواط", "تركيب ألواح وإنفرتر هجين وبطاريات ليثيوم 48 فولت.", "24 لوح × 720W • إنفرتر LV 15kW • بطاريات 30kWh", 1],
    ["تركيب منظومة سكنية جهد منخفض 8 كيلوواط", "تركيب وتمديدات DC/AC وتشغيل المنظومة للمنزل.", "12 لوح × 720W • إنفرتر LV 8kW • بطاريات 15kWh", 0],
    ["تركيب منظومة ضخ زراعي جهد منخفض 30 كيلوواط", "تركيب ألواح ومغير سرعة VFD لمضخة بئر.", "42 لوح × 720W • مغير سرعة VFD • حماية DC", 2],
  ],
  design: [
    ["دراسة ومحاكاة PVsyst لمحطة تجارية 120 كيلوواط", "تقرير إنتاجية سنوية وتحليل خسائر وتوجيه الألواح.", "دراسة إنتاجية • تقرير PVsyst • توصيات فنية", 2],
    ["مخططات SLD ونوتة حسابية لمنظومة ضخ زراعي 45 كيلوواط", "إعداد المخطط الأحادي وحساب الكابلات والحمايات.", "مخطط SLD • حساب مقاطع الكابلات • اختيار الحمايات", 1],
    ["إشراف هندسي واستلام محطة 250 كيلوواط لمصنع", "متابعة التنفيذ وفحص الجودة واستلام الأعمال.", "إشراف • فحص جودة • استلام نهائي", 3],
  ],
  install: [
    ["تنفيذ منظومة هجينة 30 كيلوواط لمستشفى", "تركيب الألواح والإنفرترات والتمديدات وتشغيل المنظومة.", "51 لوح 585 واط • إنفرتر هجين 30 كيلوواط • بطاريات 45 كيلوواط ساعة", 3],
    ["تنفيذ منظومة سكنية 10 كيلوواط", "تركيب وتشغيل واختبار الأداء.", "17 لوح 585 واط • إنفرتر 10 كيلوواط • بطاريات 15 كيلوواط ساعة", 0],
    ["تنفيذ منظومة ضخ بئر 22 كيلوواط", "تركيب الألواح والهياكل ومغير السرعة.", "38 لوح 585 واط • VFD 22 كيلوواط • بدون بطاريات", 1],
  ],
  maint: [
    ["فحص حراري وتشخيص أعطال محطة 60 كيلوواط", "كشف النقاط الساخنة واستبدال الألواح المتضررة.", "تصوير حراري • قياس عزل • تقرير أعطال", 2],
    ["صيانة ومعايرة بنك بطاريات ليثيوم ونظام BMS", "فحص الخلايا وموازنتها وتحديث إعدادات الشحن.", "فحص خلايا • موازنة • ضبط BMS", 3],
    ["صيانة دورية لـ 30 منظومة سكنية", "تنظيف وفحص التوصيلات والحمايات.", "عقد صيانة سنوي • فحص حمايات • تقارير دورية", 0],
  ],
  telecom: [
    ["ربط ومراقبة محطة 80 كيلوواط عن بُعد عبر IoT", "لوحة مراقبة لحظية وتنبيهات عند الأعطال.", "بوابة IoT • منصة سحابية • تنبيهات أعطال", 2],
    ["إعداد منصات المراقبة Deye Cloud وFusionSolar لـ 15 محطة", "ربط الإنفرترات بالإنترنت وتطبيق الجوال.", "Dataloggers • ربط سحابي • تطبيق الجوال", 0],
    ["معالجة انقطاع نقل البيانات لمحطة ري عبر 4G", "تشخيص الشبكة وإعادة ضبط الاتصال.", "شبكة 4G • Modbus/RS485 • تشخيص اتصال", 1],
  ],
  control: [
    ["برمجة نظام إدارة الطاقة EMS لمصنع ثلج", "دمج الشمسي والديزل والشبكة بأولوية ذكية.", "EMS • تكامل شمسي/ديزل/شبكة • Modbus", 3],
    ["برمجة وضبط مغير سرعة VFD لمضخة 75 حصان", "ضبط منحنيات التشغيل والحمايات.", "VFD • MPPT • حماية تشغيل جاف", 1],
    ["أتمتة منظومة هجينة لمجمع تجاري", "برمجة الإنفرترات ومنطق التحويل التلقائي.", "برمجة إنفرترات • ATS • مراقبة", 2],
  ],
  mech: [
    ["تصميم هياكل تثبيت لمحطة ساحلية 100 كيلوواط", "هياكل مقاومة للرياح والتآكل.", "حساب أحمال الرياح • مجلفن على الساخن • تصميم قواعد", 2],
    ["تصميم هياكل أرضية لمنظومة ضخ زراعي", "تحديد الميل الأمثل وتوزيع الأوزان.", "هياكل أرضية • زاوية ميل • خرسانة", 1],
    ["إشراف على تثبيت هياكل أسطح لمبنى تجاري", "فحص التثبيت وتحمل السطح.", "فحص أحمال السطح • إشراف تثبيت", 0],
  ],
  elec: [
    ["إصلاح بوردات تحكم إنفرترات صناعية", "تشخيص وإصلاح على مستوى المكونات.", "إصلاح بوردات • استبدال مكونات • اختبار", 3],
    ["تشخيص أعطال إنفرترات هجينة لـ 12 منظومة", "قراءة رموز الأعطال وتحديث البرامج.", "تشخيص • تحديث Firmware • اختبار تشغيل", 0],
    ["تصميم دائرة مراقبة جهد وتيار للبطاريات", "حساسات وقراءات لحظية.", "حساسات جهد وتيار • لوحة إلكترونية", 2],
  ],
};
const CITIES: Record<string, string[]> = {
  "أمانة العاصمة": ["صنعاء - حدة", "صنعاء - السبعين", "صنعاء - معين"], "تعز": ["تعز - القاهرة", "تعز - الحوبان"], "ذمار": ["ذمار - المدينة", "ذمار - عنس"],
  "عدن": ["عدن - المنصورة", "عدن - كريتر", "عدن - الشيخ عثمان"], "شبوة": ["عتق", "بيحان"], "حضرموت": ["المكلا", "سيئون"],
};
const HV = [3, 5, 8]; // وليد، فيصل، عمر
function genProjects(i: number, e: { services?: string[] | null; specialty?: string | null; governorate?: string | null }): Engineer["projects"] {
  const sv = e.services ?? []; const sp = e.specialty ?? "";
  const key = sv.includes("تنفيذ") ? (HV.includes(i) ? "hv" : "lv") : sp.includes("اتصالات") ? "telecom" : sp.includes("تحكم") ? "control" : sp.includes("ميكانيك") ? "mech" : sp.includes("إلكترون") ? "elec"
    : sv[0] === "صيانة" ? "maint" : sv[0] === "تنفيذ" ? "install" : "design";
  const cities = CITIES[e.governorate ?? ""] ?? [e.governorate ?? ""];
  return WORKS[key]!.map(([title, desc, system], k) => ({
    title, desc, system, location: `${cities[k % cities.length]}، ${e.governorate}`,
    images: [WIMG[key]![k]!],
  }));
}
const PHOTOS = [p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11,p12];
// Varied sample ratings (averages 5, 3.5, 4.3, 3, 4, 4.7 …)
const RATINGS = [[5,5],[3,4],[4,4,5],[3,3,3],[4,4],[5,4,5],[4,3,4],[5,4],[3,3,4],[5,5,5,4],[4,4,4],[4,4,5,4,4]];
const PTOTAL = [26,14,11,19,9,24,12,8,22,10,15,17];
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
  { name: "م. ياسين أحمد الزبيدي", specialty: "هندسة ميكانيكية", university: "جامعة الحديدة", grad_year: 2015, qualifications: "بكالوريوس", skills: ["هياكل التثبيت", "إدارة المشاريع"], tools: ["SolidWorks", "AutoCAD"], services: ["تصميم", "إشراف", "استشارات"], years_exp: 10, governorate: "الحديدة", city: "الحديدة", bio: "تصميم هياكل التثبيت المقاومة للرياح والملوحة.", projects: [P("هياكل محطة ساحلية", "تصميم مقاوم للتآكل.")], rv: [[5, "إبراهيم", "هيكل متين جداً."]] },
  { name: "م. نزار خالد السقاف", specialty: "هندسة إلكترونيات", university: "جامعة صنعاء", grad_year: 2014, qualifications: "بكالوريوس", skills: ["صيانة ومعايرة الإنفرترات", "المنظومات الهجينة ومتحكمات MPPT"], tools: ["Proteus"], services: ["صيانة", "برمجة", "تصميم"], years_exp: 11, governorate: "أمانة العاصمة", city: "صنعاء", bio: "إصلاح كروت الإنفرترات ومتحكمات الشحن.", projects: [P("إصلاح أكثر من 300 إنفرتر", "مختلف الماركات.")], rv: [[5, "طارق", "أصلح الإنفرتر بعد ما يئست."], [5, "مهيب", "أمين وسعره مناسب."]] },
];

const uuid = (i: number) => `5a3e0000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`;

export const SAMPLE: { engineer: Omit<Engineer, "avg" | "count">; reviews: Review[] }[] = RAW.map(({ rv, ...e }, i) => ({
  engineer: { ...e, review_total: TOTALS[i] ?? 32, projects_total: PTOTAL[i] ?? 8, id: uuid(i), kind: "engineer", photo_url: PHOTOS[i] ?? null, projects: genProjects(i, e) },
  reviews: (RATINGS[i] ?? rv.map((x) => x[0])).map((r, j) => [r, rv[j]?.[1] ?? NAMES[j % NAMES.length], rv[j]?.[2] ?? (r >= 4 ? "تعامل محترم وعمل جيد." : "العمل مقبول ويحتاج سرعة أكبر.")] as [number, string, string]).map(([r, n, c], j) => ({ id: uuid(100 + i * 10 + j), rating: r, quality: r, punctuality: r, professionalism: r, responsiveness: Math.max(4, r - (j % 2)), comment: c, reviewer_name: n, created_at: "2026-10-01T10:00:00Z" })),
}));

export const sampleList = (): Engineer[] =>
  SAMPLE.map(({ engineer, reviews }, i) => ({ ...engineer, count: TOTALS[i] ?? reviews.length, avg: reviews.reduce((a, r) => a + r.rating, 0) / reviews.length }));
export const sampleById = (id: string) => SAMPLE.find((s) => s.engineer.id === id);
