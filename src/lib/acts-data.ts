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
  { k: "engineer", l: "مهندس ممارس", d: "لديك خبرة عملية في الميدان" },
];
/** The CRM stores only student/engineer; graduates are engineers with the category noted in their bio. */
export const crmKind = (c: Category): "student" | "engineer" => (c === "student" ? "student" : "engineer");
export const categoryNote = (c: Category) => (c === "graduate" ? "التصنيف: خريج حديث" : c === "engineer" ? "التصنيف: مهندس ممارس" : "التصنيف: طالب");

export const fileToB64 = (f: File) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] ?? "");
    r.onerror = rej;
    r.readAsDataURL(f);
  });
export const MAX_FILE_MB = 8;
