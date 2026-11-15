import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Preset } from "./sizing";

// Public ACTS actions. Each one validates input here, then forwards to the ACTES CRM, which stores
// everything and is where staff review quotes, service requests, engineer sign-ups and ratings.

const crm = async () => (await import("./crm.server")).callCrm;
const opt = (n: number) => z.string().trim().max(n).optional().nullable().transform((v) => v || null);
const Phone = z.string().trim().min(6, "رقم الهاتف قصير").max(20).regex(/^[+\d\s-]+$/, "رقم الهاتف غير صحيح");
const Url = z.string().url().max(2000);

export type Engineer = {
  id: string;
  kind: "student" | "engineer";
  name: string;
  photo_url: string | null;
  specialty: string;
  university: string | null;
  grad_year: number | null;
  qualifications: string | null;
  skills: string[];
  tools: string[];
  services: string[];
  years_exp: number;
  projects: { title: string; desc: string; images: string[] }[];
  governorate: string | null;
  city: string | null;
  bio: string | null;
  avg: number;
  count: number;
};
export type Review = {
  id: string;
  rating: number;
  quality: number;
  punctuality: number;
  professionalism: number;
  responsiveness: number;
  comment: string | null;
  reviewer_name: string | null;
  created_at: string;
};

export type Catalog = { ok: boolean; kwh_price: number; presets: Preset[]; error: string | null };

/** Live kWh price and ready-made systems from the CRM; nothing is hard-coded in the app. */
export const getCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<Catalog> => {
  try {
    const { getBridge } = await import("./crm.server");
    const r = await getBridge<{ kwh_price: number; presets: Preset[] }>();
    const presets = (r.presets ?? []).map((p) => ({
      type: p.type === "com" ? ("com" as const) : ("res" as const), group: String(p.group), title: String(p.title),
      panels: Number(p.panels) || 0, pw: Number(p.pw) || 0,
      lines: (p.lines ?? []).map((l) => ({ name: String(l.name), unit: l.unit ?? null, qty: Number(l.qty) || 0, price: Number(l.price) || 0, specs: l.specs ?? [] })),
    }));
    return { ok: true, kwh_price: Number(r.kwh_price) || 0, presets, error: null };
  } catch (e) {
    return { ok: false, kwh_price: 0, presets: [], error: e instanceof Error ? e.message : "تعذّر تحميل المنظومات" };
  }
});

export const sendQuoteRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      phone: Phone,
      name: opt(120),
      city: opt(80),
      path: z.enum(["res", "com"]),
      method: z.enum(["bill", "kwh", "diesel"]),
      amount: z.number().positive().max(1e9),
      night: z.union([z.literal(30), z.literal(50), z.literal(70)]),
      system: z.string().trim().min(1).max(300),
      reports: z.array(z.enum(["pvsyst", "sld"])).max(2),
    }).parse(d),
  )
  .handler(async ({ data }) => (await crm())<{ ok: boolean }>("quoteRequest", data));

export const listEngineers = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const items = await (await crm())<Engineer[]>("listEngineers");
    return { items: items ?? [], offline: false };
  } catch {
    return { items: [] as Engineer[], offline: true };
  }
});

export const getEngineer = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => (await crm())<{ engineer: Omit<Engineer, "avg" | "count">; reviews: Review[] }>("getEngineer", data));

export const uploadFile = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      file_name: z.string().min(1).max(200),
      mime: z.string().regex(/^(image\/|application\/pdf)/, "نوع الملف غير مسموح").max(100),
      b64: z.string().max(14_000_000, "الملف كبير جداً"),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const r = await (await crm())<string | { url: string; name?: string }>("upload", data);
    const url = typeof r === "string" ? r : r?.url;
    if (!url) throw new Error("تعذّر رفع الملف، حاول مجدداً.");
    return { url, name: (typeof r === "object" && r?.name) || data.file_name };
  });

export const registerEngineer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      kind: z.enum(["student", "engineer"]),
      name: z.string().trim().min(2).max(120),
      phone: Phone,
      email: z.string().trim().email().max(200).optional().or(z.literal("")).transform((v) => v || null),
      photo_url: Url.nullable(),
      specialty: z.string().trim().min(2).max(80),
      university: opt(160),
      grad_year: z.number().int().min(1970).max(2040).nullable(),
      qualifications: opt(1000),
      skills: z.array(z.string().trim().min(1).max(80)).max(40),
      tools: z.array(z.string().trim().min(1).max(80)).max(40),
      services: z.array(z.string().max(40)).max(10),
      years_exp: z.number().int().min(0).max(60),
      projects: z.array(z.object({ title: z.string().trim().min(1).max(160), desc: z.string().max(1000), images: z.array(Url).max(6) })).max(10),
      governorate: opt(80),
      city: opt(80),
      bio: opt(1500),
    }).parse(d),
  )
  .handler(async ({ data }) => (await crm())<{ ok: boolean }>("register", data));

export const sendServiceRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({
      engineer_id: z.string().uuid().nullable(),
      name: opt(120),
      phone: Phone,
      service: z.string().trim().min(2).max(80),
      governorate: opt(80),
      city: opt(80),
      location: opt(300),
      description: z.string().trim().min(5, "اكتب وصفاً أوضح للعمل").max(3000),
      attachments: z.array(z.object({ url: Url, name: z.string().max(200) })).max(8),
    }).parse(d),
  )
  .handler(async ({ data }) => (await crm())<{ ok: boolean }>("serviceRequest", data));

export const getReviewInfo = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ token: z.string().min(10).max(64) }).parse(d))
  .handler(async ({ data }) => {
    try {
      const r = await (await crm())<{ service: string; status: string; engineer: string | null; name: string | null; reviewed: boolean }>("reviewInfo", data);
      return { ok: true as const, ...r };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "الرابط غير صحيح" };
    }
  });

const Star = z.number().int().min(1).max(5);
export const submitReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ token: z.string().min(10).max(64), rating: Star, quality: Star, punctuality: Star, professionalism: Star, responsiveness: Star, comment: opt(1500), reviewer_name: opt(120) }).parse(d),
  )
  .handler(async ({ data }) => (await crm())<{ ok: boolean }>("submitReview", data));

export const reportReview = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ review_id: z.string().uuid(), reason: z.string().trim().min(3, "اكتب سبب الإبلاغ").max(500) }).parse(d))
  .handler(async ({ data }) => (await crm())<{ ok: boolean }>("reportReview", data));
