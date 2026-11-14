// Port of the ACTES CRM QuoteBuilder selection rules (resNearest / comInvOptions / tiers / day-night).
// Keep identical to actes-crm src/components/QuoteBuilder.tsx so app, CRM and WhatsApp bot recommend the same systems.
import { BOT_PRESETS } from "@/lib/bot-presets";

export type PresetLine = { name: string; qty: number; unit: string | null };
export type Preset = {
  type?: "res" | "com";
  group: string;
  title: string;
  items: [string, number][];
  lines?: PresetLine[];
  panels?: number;
  pw?: number;
};

const PRESETS: Preset[] = BOT_PRESETS.map((p) => ({ ...p }));

type Store = { dc: [string, number][]; hv?: number; ctrl?: number; ebc?: number; bdc?: number; other?: [string, number][] };
const com = (inv: string, invQty: number, ac: string, pv: number, mc4: number, s: Store): [string, number][] => [
  ["PV_SUNTECH_720", pv], [inv, invQty],
  ...(s.hv ? [["BAT_HITHIUM_16K_HV", s.hv] as [string, number]] : []),
  ...(s.other ?? []),
  ...s.dc, [ac, 1],
  ...(s.ctrl ? [["ctrl_hithium_hv16", s.ctrl] as [string, number]] : []),
  ...(s.ebc ? [["ctrl_hithium_hv16_ebc", s.ebc] as [string, number]] : []),
  ...(s.bdc ? [["bat_protect_dc1500_250a", s.bdc] as [string, number]] : []),
  ["mc4_connector", mc4], ["cable_cu_1500v_10mm", 1],
];
const S50 = "INV_SOLIS_50K_3P_HV", S125 = "INV_SOLIS_125K_3P_HV";
const g50 = "منظومات تجارية 50 كيلو", g125 = "منظومات تجارية 125 كيلو";
PRESETS.push(
  { type: "com", group: g50, title: "50 كيلو · 75 لوح · 4 بطارية هيثيوم (64 كيلو)", items: com(S50, 1, "ac_06", 75, 5, { dc: [["DCBOX_1500_6", 1]], hv: 4, ctrl: 1, bdc: 1 }) },
  { type: "com", group: g50, title: "2× 50 كيلو · 150 لوح · 8 بطارية هيثيوم (128 كيلو)", items: com(S50, 2, "ac_06", 150, 10, { dc: [["DCBOX_1500_10", 1]], hv: 8, ctrl: 1, ebc: 1, bdc: 1 }) },
  { type: "com", group: g50, title: "2× 50 كيلو · 180 لوح · 12 بطارية هيثيوم (192 كيلو)", items: com(S50, 2, "ac_06", 180, 12, { dc: [["DCBOX_1500_6", 2]], hv: 12, ctrl: 1, ebc: 1, bdc: 1 }) },
  { type: "com", group: g50, title: "2× 50 كيلو · 180 لوح · كبينة بايلونتك 313 كيلو", items: com(S50, 2, "ac_06", 180, 12, { dc: [["DCBOX_1500_6", 2]], other: [["CAB_PYLON_313", 1]] }) },
  { type: "com", group: g50, title: "2× 50 كيلو · 180 لوح · 13 بطارية بايلونتك M5", items: com(S50, 2, "ac_06", 180, 12, { dc: [["DCBOX_1500_6", 2]], other: [["BAT_PYLON_M5_15_68K", 13], ["KIT_M5", 1], ["RACK_M5_16", 1], ["CTRL_M5", 1]] }) },
  { type: "com", group: g125, title: "125 كيلو · 221 لوح · 12 بطارية هيثيوم (192 كيلو)", items: com(S125, 1, "ac_15", 221, 13, { dc: [["DCBOX_1500_8", 2]], hv: 12, ctrl: 1, ebc: 1, bdc: 1 }) },
  { type: "com", group: g125, title: "2× 125 كيلو · 442 لوح · 24 بطارية هيثيوم (384 كيلو)", items: com(S125, 2, "ac_15", 442, 26, { dc: [["DCBOX_1500_10", 2], ["DCBOX_1500_8", 1]], hv: 24, ctrl: 2, ebc: 2, bdc: 2 }) },
  { type: "com", group: g125, title: "2× 125 كيلو · 646 لوح · 36 بطارية هيثيوم (576 كيلو)", items: com(S125, 2, "ac_15", 646, 38, { dc: [["DCBOX_1500_10", 4]], hv: 36, ctrl: 3, ebc: 3, bdc: 3 }) },
);

export const dailyProduction = (p: Preset) => p.panels ? p.panels * (p.pw ?? 720) * 5.5 / 1000 :
  p.items.reduce((s, [k, q]) => s + (k === "PV_SUNTECH_595" ? q * 595 : k === "PV_SUNTECH_720" ? q * 720 : 0), 0) * 5.5 / 1000;
export const panelCount = (p: Preset) => p.panels || p.items.reduce((s, [k, q]) => s + (k.startsWith("PV_") ? q : 0), 0);

const RES_RANGES: number[][] = [[1.2], [2.5], [2.5], [4], [4], [5, 7.5], [13], [21], [31.7], [35.6], [55.4], [63.4], [71.3], [83.2], [106.9]];
const RES_LIST = PRESETS.filter((p) => p.type !== "com");
export const RES_MAX_DAILY = 106.9;
export const DEFAULT_KWH_PRICE = 290;
const E = 0.0001;

export const resOptions = (need: number): Preset[] => {
  let best: number | null = null;
  let out: Preset[] = [];
  RES_LIST.forEach((p, i) => {
    for (const range of RES_RANGES[i] ?? []) {
      if (/^إنفرتر (8|12) /.test(p.group) && range < need - E) continue;
      const d = Math.abs(range - need);
      if (best === null || d < best - E) { best = d; out = [p]; }
      else if (Math.abs(d - best) <= E && !out.includes(p)) out.push(p);
    }
  });
  return out;
};

const COM_LIST = PRESETS.filter((p) => p.type === "com");
const kwOf = (p: Preset) => Number((p.group.match(/(\d+(?:\.\d+)?) كيلو/) ?? [])[1] ?? 0);
const COM_SMALL = [8, 12, 16, 20];
export const comOptions = (need: number): Preset[] => {
  const maxDaily = (kw: number) => Math.max(0, ...COM_LIST.filter((p) => kwOf(p) === kw).map(dailyProduction));
  const kws = [...new Set(COM_LIST.map(kwOf))];
  const small = kws.filter((k) => COM_SMALL.includes(k));
  const big = kws.filter((k) => !COM_SMALL.includes(k));
  const smallMax = Math.max(0, ...small.map(maxDaily));
  let use = need <= smallMax && small.length ? small : big;
  if (!use.length) use = small;
  use = use.filter((k) => maxDaily(k) >= need - E).sort((a, b) => a - b);
  const out: Preset[] = [];
  for (const kw of use) {
    const groups = [...new Set(COM_LIST.filter((p) => kwOf(p) === kw).map((p) => p.group))];
    for (const g of groups) {
      const pick = COM_LIST.filter((p) => p.group === g).sort((a, b) => dailyProduction(a) - dailyProduction(b)).find((p) => dailyProduction(p) >= need - E);
      if (pick) out.push(pick);
    }
  }
  return out;
};

export const optionsForResBill = (bill: number, price = DEFAULT_KWH_PRICE): Preset[] => {
  const need = bill / price / 30;
  return need > RES_MAX_DAILY + E ? comOptions(need) : resOptions(need);
};
export type ComMethod = "bill" | "kwh" | "diesel";
export const optionsForCom = (m: ComMethod, v: number, price = DEFAULT_KWH_PRICE): Preset[] => {
  const kwh = m === "bill" ? v / price : m === "kwh" ? v : v / 0.27;
  const need = kwh / 30;
  return need <= RES_MAX_DAILY + E ? resOptions(need) : comOptions(need);
};

export type Tiers = { low?: Preset | undefined; rec: Preset; high?: Preset | undefined };
export const NO_TIER_RES = /^إنفرتر (1\.6|6\.2) /;
export const tiersFrom = (opts: Preset[]): Tiers | null => {
  if (!opts.length) return null;
  const rec = opts[0]!;
  if (rec.type !== "com" && NO_TIER_RES.test(rec.group)) return { rec };
  const skip = new Set(opts.map(dailyProduction));
  const r = dailyProduction(rec);
  const fam = PRESETS.filter((p) => p.group === rec.group && (p.type ?? "res") === (rec.type ?? "res") && !skip.has(dailyProduction(p))).sort((a, b) => dailyProduction(a) - dailyProduction(b));
  return { low: [...fam].reverse().find((p) => dailyProduction(p) < r), rec, high: fam.find((p) => dailyProduction(p) > r) };
};

export type DayNight = 30 | 50 | 70;
export const batteryOf = (p: Preset) => Number((p.title.match(/\((\d+(?:\.\d+)?) كيلو\)/) ?? p.title.match(/(?:بطارية|بايلونتك) ([\d.]+)/) ?? [])[1] ?? 0);
export const shiftDayNight = (rec: Preset, night: DayNight): Preset => {
  if (night === 50) return rec;
  const fam = PRESETS.filter((p) => p.group === rec.group && (p.type ?? "res") === (rec.type ?? "res"));
  const more = night === 70, b = batteryOf(rec);
  if (rec.type !== "com") {
    const i = fam.indexOf(rec), dir = more ? 1 : -1;
    for (let j = i + dir; j >= 0 && j < fam.length; j += dir) if (fam[j]!.title !== rec.title) return fam[j]!;
    return rec;
  }
  const d = dailyProduction(rec);
  return [...fam].sort((x, y) => dailyProduction(x) - dailyProduction(y)).find((p) => dailyProduction(p) >= d - E && (more ? batteryOf(p) > b : batteryOf(p) < b)) ?? rec;
};
export const tiersDayNight = (t: Tiers | null, night: DayNight): Tiers | null => {
  if (!t || night === 50) return t;
  const r = shiftDayNight(t.rec, night);
  return r === t.rec ? t : tiersFrom([r]);
};
export const tieredOptions = (path: "res" | "com", m: ComMethod, v: number, price = DEFAULT_KWH_PRICE) =>
  tiersFrom(path === "res" ? optionsForResBill(v, price) : optionsForCom(m, v, price));

/** App entry: residential kWh input is converted to the equivalent bill so it follows the bot's residential path. */
export function quoteTiers(path: "res" | "com", method: "bill" | "kwh", amount: number, night: DayNight, price = DEFAULT_KWH_PRICE): Tiers | null {
  if (!(amount > 0)) return null;
  const base = path === "res"
    ? tieredOptions("res", "bill", method === "kwh" ? amount * price : amount, price)
    : tieredOptions("com", method, amount, price);
  return tiersDayNight(base, night);
}

/** Daily need in kWh for the entered amount. */
export const dailyNeed = (method: "bill" | "kwh", amount: number, price = DEFAULT_KWH_PRICE) =>
  (method === "bill" ? amount / price : amount) / 30;
