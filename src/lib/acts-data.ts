// Values must match the ACTES CRM lists (src/lib/acts-data.ts there) so CRM filters and admin screens line up.
export const SPECIALTIES = [
  "هندسة كهربائية",
  "هندسة ميكانيكية",
  "هندسة طاقة متجددة",
  "هندسة تحكم وأتمتة",
  "هندسة اتصالات وشبكات",
  "هندسة ميكاترونكس",
  "هندسة إلكترونيات",
  "هندسة تكنولوجيا المعلومات",
] as const;

/** Service types a customer can request. */
export const SERVICES = [
  "تركيب منظومات الطاقة",
  "الصيانة",
  "الاستشارات الهندسية",
  "التصميم والحسابات الهندسية",
  "برمجة أنظمة التحكم",
  "الإشراف الهندسي",
  "خدمات هندسية أخرى",
] as const;

/** Services an engineer offers (stored values) with display labels. */
export const REG_SERVICES = [
  { v: "تنفيذ", l: "تركيب وتنفيذ" },
  { v: "صيانة", l: "صيانة" },
  { v: "تصميم", l: "تصميم" },
  { v: "إشراف", l: "إشراف" },
  { v: "برمجة", l: "برمجة" },
  { v: "استشارات", l: "استشارات" },
] as const;
export const serviceLabel = (v: string) => REG_SERVICES.find((s) => s.v === v)?.l ?? v;

export const GOVERNORATES = ["أمانة العاصمة", "صنعاء", "عدن", "تعز", "الحديدة", "إب", "ذمار", "حضرموت", "مأرب", "حجة", "عمران", "البيضاء", "لحج", "أبين", "شبوة", "المهرة", "الجوف", "صعدة", "المحويت", "ريمة", "الضالع", "سقطرى"] as const;

export const SKILLS = [
  "تصميم منظومات الطاقة الشمسية", "حسابات الأحمال", "تمديدات كهربائية", "لوحات توزيع", "أنظمة التأريض والحماية",
  "صيانة الإنفرترات", "أنظمة البطاريات", "مضخات الطاقة الشمسية", "PLC", "SCADA", "إدارة المشاريع", "قراءة المخططات",
] as const;
export const TOOLS = ["AutoCAD", "PVsyst", "MATLAB", "ETAP", "DIALux", "Revit", "SketchUp", "Helioscope", "SolidWorks", "Proteus", "TIA Portal", "Excel"] as const;
export const QUALIFICATIONS = ["دبلوم", "بكالوريوس", "ماجستير", "دكتوراه"] as const;

export type Category = "student" | "graduate" | "engineer";
export const CATEGORIES: { k: Category; l: string; d: string }[] = [
  { k: "student", l: "طالب هندسة", d: "ما زلت في مرحلة الدراسة" },
  { k: "graduate", l: "خريج حديث", d: "تخرجت حديثاً وتبحث عن فرصتك" },
  { k: "engineer", l: "مهندس ذو خبرة", d: "لديك خبرة عملية في الميدان" },
];
/** The CRM stores only student/engineer; graduates are engineers with the category noted in their bio. */
export const crmKind = (c: Category): "student" | "engineer" => (c === "student" ? "student" : "engineer");
export const categoryNote = (c: Category) => (c === "graduate" ? "التصنيف: خريج حديث" : c === "engineer" ? "التصنيف: مهندس ذو خبرة" : "التصنيف: طالب");

export const fileToB64 = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] ?? "");
    r.onerror = rej;
    r.readAsDataURL(f);
  });
export const MAX_FILE_MB = 8;

/** Services offered per specialty (stored service values). */
export const SPECIALTY_SERVICES: Record<string, string[]> = {
  "هندسة كهربائية": ["تنفيذ", "صيانة", "تصميم", "إشراف", "استشارات"],
  "هندسة طاقة متجددة": ["تنفيذ", "صيانة", "تصميم", "إشراف", "برمجة", "استشارات"],
  "هندسة ميكانيكية": ["تنفيذ", "صيانة", "تصميم", "إشراف"],
  "هندسة تحكم وأتمتة": ["برمجة", "صيانة", "تنفيذ", "إشراف"],
  "هندسة ميكاترونكس": ["برمجة", "صيانة", "تنفيذ", "إشراف"],
  "هندسة إلكترونيات": ["صيانة", "برمجة", "تصميم"],
  "هندسة اتصالات وشبكات": ["برمجة", "صيانة", "استشارات"],
  "هندسة تكنولوجيا المعلومات": ["برمجة", "استشارات"],
};
export const servicesFor = (spec: string) => REG_SERVICES.filter((s) => (SPECIALTY_SERVICES[spec] ?? []).includes(s.v));

type SK = { skills: string[]; tools: string[] };
const BASE: Record<string, SK> = {
  "تنفيذ": { skills: ["تمديدات DC/AC", "لوحات التوزيع والقواطع", "التأريض والحماية من الصواعق", "هياكل التثبيت"], tools: ["AutoCAD", "Excel"] },
  "صيانة": { skills: ["صيانة ومعايرة الإنفرترات", "فحص البطاريات", "الكشف الحراري", "قياس العزل وتشخيص الأعطال"], tools: ["Excel"] },
  "تصميم": { skills: ["حسابات الأحمال", "تصميم المنظومات", "حسابات الكابلات وهبوط الجهد"], tools: ["PVsyst", "AutoCAD", "Helioscope", "ETAP", "Excel"] },
  "إشراف": { skills: ["إدارة المشاريع", "مراقبة الجودة والسلامة", "استلام الأعمال"], tools: ["MS Project", "Excel"] },
  "برمجة": { skills: ["برمجة وضبط الإنفرترات", "المنظومات الهجينة ومتحكمات MPPT", "أنظمة إدارة الطاقة", "مغيرات سرعة المضخات VFD", "بروتوكولات Modbus/RS485/CAN"], tools: ["Solarman", "FusionSolar", "VictronConnect", "Deye Cloud"] },
  "استشارات": { skills: ["دراسات الجدوى", "تقييم كفاءة المنظومات", "مراجعة التصاميم"], tools: ["PVsyst", "RETScreen", "Excel"] },
};
const TELECOM: Record<string, SK> = {
  "برمجة": { skills: ["ربط الإنفرترات بالإنترنت ومراكز المراقبة", "إعداد المراقبة عن بُعد", "ربط الإنفرترات بتطبيقات الهاتف ومنصات الويب", "الاتصال بين الإنفرترات والبطاريات وأجهزة القياس", "ربط أجهزة الطاقة بإنترنت الأشياء IoT", "جمع بيانات الإنتاج والاستهلاك", "ربط حساسات الحرارة والإشعاع والجهد والتيار", "تنبيهات الأعطال وانخفاض الإنتاج", "مراقبة أداء المحطات لحظياً"], tools: ["FusionSolar", "Solarman", "Deye Cloud", "SolisCloud", "VictronConnect / VRM", "Modbus Poll"] },
  "صيانة": { skills: ["معالجة انقطاع الاتصال ونقل البيانات", "تشخيص أعطال الشبكات والاتصالات", "ضبط شبكات Wi-Fi / 4G / LAN في المحطات"], tools: ["Wireshark", "PuTTY", "Modbus Poll"] },
  "استشارات": { skills: ["استشارات حلول المراقبة وإنترنت الأشياء", "دعم فني لشبكات المحطات"], tools: ["Excel"] },
};
/** Skills/tools offered for a given specialty + service. */
export const skillsFor = (spec: string, service: string): SK =>
  (spec === "هندسة اتصالات وشبكات" ? TELECOM[service] : undefined) ?? BASE[service] ?? { skills: [], tools: [] };

// Detailed engineering services shown on an engineer profile, by specialty (display only).
export const SPECIALTY_DETAILS: Record<string, string[]> = {
  "هندسة طاقة متجددة": ["تصميم منظومات الطاقة الشمسية", "دراسة ومحاكاة PVsyst", "حساب الأحمال والاستهلاك", "تنفيذ وتركيب المنظومات", "منظومات ضخ الآبار", "الإشراف على المشاريع", "دراسات الجدوى"],
  "هندسة كهربائية": ["تصميم لوحات التوزيع", "مخططات SLD", "التأريض والحماية من الصواعق", "تمديدات DC/AC", "فحص وصيانة المنظومات", "الإشراف على التنفيذ"],
  "هندسة اتصالات وشبكات": ["ربط الإنفرترات بالمراقبة عن بعد", "إعداد منصات المراقبة", "أنظمة إنترنت الأشياء IoT", "ربط الحساسات وأجهزة القياس", "معالجة انقطاع الاتصال", "الدعم الفني والاستشارات"],
  "هندسة تحكم وأتمتة": ["برمجة الإنفرترات", "أنظمة إدارة الطاقة EMS", "برمجة مغيرات السرعة VFD", "بروتوكولات Modbus/RS485", "أتمتة المضخات", "الاستشارات الفنية"],
  "هندسة ميكانيكية": ["تصميم هياكل التثبيت", "حسابات الأحمال الإنشائية", "تركيب منظومات الضخ", "صيانة المضخات", "الإشراف على التنفيذ"],
  "هندسة إلكترونيات": ["إصلاح كروت الإنفرترات", "صيانة متحكمات الشحن MPPT", "معايرة أجهزة القياس", "فحص البطاريات وأنظمة BMS", "برمجة المتحكمات"],
};
export const serviceDetails = (spec: string, services: string[]) => {
  const d = SPECIALTY_DETAILS[spec];
  return d && d.length ? d : services;
};
