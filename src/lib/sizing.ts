// Port of the ACTES CRM QuoteBuilder selection rules (resNearest / comInvOptions / tiers / day-night).
// Systems and prices are never stored here: every function takes the presets loaded live from the CRM bridge.

export type PresetLine = { name: string; qty: number; unit: string | null; price: number; specs?: string[] };
export type Preset = { type: "res" | "com"; group: string; title: string; panels: number; pw: number; lines: PresetLine[] };

/** Price of a system = sum of price × qty over its lines. */
export const presetPrice = (p: Preset) => p.lines.reduce((s, l) => s + (Number(l.price) || 0) * (Number(l.qty) || 0), 0);
export const dailyProduction = (p: Preset) => (p.panels || 0) * (p.pw || 720) * 5.5 / 1000;
export const panelCount = (p: Preset) => p.panels || 0;

const RES_RANGES: number[][] = [[1.2], [2.5], [2.5], [4], [4], [5, 7.5], [13], [21], [31.7], [35.6], [55.4], [63.4], [71.3], [83.2], [106.9]];
export const RES_MAX_DAILY = 106.9;
const E = 0.0001;

const resList = (all: Preset[]) => all.filter((p) => p.type !== "com");
const comList = (all: Preset[]) => all.filter((p) => p.type === "com");

export const resOptions = (all: Preset[], need: number): Preset[] => {
  let best: number | null = null;
  let out: Preset[] = [];
  resList(all).forEach((p, i) => {
    for (const range of RES_RANGES[i] ?? []) {
      if (/^إنفرتر (8|12) /.test(p.group) && range < need - E) continue;
      const d = Math.abs(range - need);
      if (best === null || d < best - E) { best = d; out = [p]; }
      else if (Math.abs(d - best) <= E && !out.includes(p)) out.push(p);
    }
  });
  return out;
};

const kwOf = (p: Preset) => Number((p.group.match(/(\d+(?:\.\d+)?) كيلو/) ?? [])[1] ?? 0);
const COM_SMALL = [8, 12, 16, 20];
export const comOptions = (all: Preset[], need: number): Preset[] => {
  const list = comList(all);
  const maxDaily = (kw: number) => Math.max(0, ...list.filter((p) => kwOf(p) === kw).map(dailyProduction));
  const kws = [...new Set(list.map(kwOf))];
  const small = kws.filter((k) => COM_SMALL.includes(k));
  const big = kws.filter((k) => !COM_SMALL.includes(k));
  const smallMax = Math.max(0, ...small.map(maxDaily));
  let use = need <= smallMax && small.length ? small : big;
  if (!use.length) use = small;
  use = use.filter((k) => maxDaily(k) >= need - E).sort((a, b) => a - b);
  const out: Preset[] = [];
  for (const kw of use) {
    const groups = [...new Set(list.filter((p) => kwOf(p) === kw).map((p) => p.group))];
    for (const g of groups) {
      const pick = list.filter((p) => p.group === g).sort((a, b) => dailyProduction(a) - dailyProduction(b)).find((p) => dailyProduction(p) >= need - E);
      if (pick) out.push(pick);
    }
  }
  return out;
};

export type ComMethod = "bill" | "kwh" | "diesel";
const optionsForResBill = (all: Preset[], bill: number, price: number) => {
  const need = bill / price / 30;
  return need > RES_MAX_DAILY + E ? comOptions(all, need) : resOptions(all, need);
};
const optionsForCom = (all: Preset[], m: ComMethod, v: number, price: number) => {
  const kwh = m === "bill" ? v / price : m === "kwh" ? v : v / 0.27;
  const need = kwh / 30;
  return need <= RES_MAX_DAILY + E ? resOptions(all, need) : comOptions(all, need);
};

export type Tiers = { low?: Preset | undefined; rec: Preset; high?: Preset | undefined };
export const NO_TIER_RES = /^إنفرتر (1\.6|6\.2) /;
export const tiersFrom = (all: Preset[], opts: Preset[]): Tiers | null => {
  if (!opts.length) return null;
  const rec = opts[0]!;
  if (rec.type !== "com" && NO_TIER_RES.test(rec.group)) return { rec };
  const skip = new Set(opts.map(dailyProduction));
  const r = dailyProduction(rec);
  const fam = all.filter((p) => p.group === rec.group && p.type === rec.type && !skip.has(dailyProduction(p))).sort((a, b) => dailyProduction(a) - dailyProduction(b));
  return { low: [...fam].reverse().find((p) => dailyProduction(p) < r), rec, high: fam.find((p) => dailyProduction(p) > r) };
};

export type DayNight = 30 | 50 | 70;
export const batteryOf = (p: Preset) => Number((p.title.match(/\((\d+(?:\.\d+)?) كيلو\)/) ?? p.title.match(/(?:بطارية|بايلونتك) ([\d.]+)/) ?? [])[1] ?? 0);
export const shiftDayNight = (all: Preset[], rec: Preset, night: DayNight): Preset => {
  if (night === 50) return rec;
  const fam = all.filter((p) => p.group === rec.group && p.type === rec.type);
  const more = night === 70, b = batteryOf(rec);
  if (rec.type !== "com") {
    const i = fam.indexOf(rec), dir = more ? 1 : -1;
    for (let j = i + dir; j >= 0 && j < fam.length; j += dir) if (fam[j]!.title !== rec.title) return fam[j]!;
    return rec;
  }
  const d = dailyProduction(rec);
  return [...fam].sort((x, y) => dailyProduction(x) - dailyProduction(y)).find((p) => dailyProduction(p) >= d - E && (more ? batteryOf(p) > b : batteryOf(p) < b)) ?? rec;
};
const tiersDayNight = (all: Preset[], t: Tiers | null, night: DayNight): Tiers | null => {
  if (!t || night === 50) return t;
  const r = shiftDayNight(all, t.rec, night);
  return r === t.rec ? t : tiersFrom(all, [r]);
};

/** App entry: residential kWh input is converted to the equivalent bill so it follows the bot's residential path. */
export function quoteTiers(all: Preset[], path: "res" | "com", method: ComMethod, amount: number, night: DayNight, price: number): Tiers | null {
  if (!(amount > 0) || !(price > 0) || !all.length) return null;
  const base = path === "res"
    ? tiersFrom(all, optionsForResBill(all, method === "kwh" ? amount * price : amount, price))
    : tiersFrom(all, optionsForCom(all, method, amount, price));
  return tiersDayNight(all, base, night);
}

/** Daily need in kWh for the entered amount. */
export const dailyNeed = (method: "bill" | "kwh", amount: number, price: number) =>
  (method === "bill" ? amount / price : amount) / 30;

// ===== Industrial / agricultural paths: always picked from the CRM commercial presets =====
export type LoadNight = DayNight | 0; // 0 = daytime only (no batteries)
export const HP_KW = 0.746;
/** Operating hours per day for each day/night share (0 = daytime only). */
const HOURS: Record<LoadNight, number> = { 0: 7, 30: 10, 50: 14, 70: 20 };
const BATTERY_LINE = /بطارية|بطاريات|battery|هيثيوم|HTHIUM|HUTHIUM|بايلونتك|استند/i;

/** Daytime-only variant: drop battery packs and their racks/accessories; price follows automatically. */
export const withoutBatteries = (p: Preset): Preset => ({
  ...p,
  title: p.title.replace(/\s*·\s*بطارية\s*[\d.]+/, "") + " · بدون بطاريات",
  lines: p.lines.filter((l) => !BATTERY_LINE.test(l.name)),
});

/** Need for an industrial/agricultural request: daily kWh and the minimum inverter kW. */
export function loadNeed(method: "bill" | "kwh" | "diesel" | "load", amount: number, night: LoadNight, price: number, unit: "kw" | "hp") {
  if (method === "load") {
    const kw = unit === "hp" ? amount * HP_KW : amount;
    return { daily: kw * HOURS[night], minKw: kw * 1.25 };
  }
  const kwh = method === "bill" ? amount / price : method === "kwh" ? amount : amount / 0.27;
  return { daily: kwh / 30, minKw: 0 };
}

export function loadTiers(all: Preset[], daily: number, minKw: number, night: LoadNight): Tiers | null {
  const list = comList(all);
  if (!list.length || !(daily > 0)) return null;
  const groups = [...new Set(list.map((p) => p.group))]
    .map((g) => ({ g, kw: kwOf(list.find((p) => p.group === g)!), fam: list.filter((p) => p.group === g).sort((a, b) => dailyProduction(a) - dailyProduction(b)) }))
    .filter((x) => x.kw >= minKw - E)
    .sort((a, b) => a.kw - b.kw || (a.g.includes("3 فاز") ? 1 : -1));
  if (!groups.length) return null;
  const fit = groups.find((x) => dailyProduction(x.fam[x.fam.length - 1]!) >= daily - E) ?? groups[groups.length - 1]!;
  let rec = fit.fam.find((p) => dailyProduction(p) >= daily - E) ?? fit.fam[fit.fam.length - 1]!;
  if (night === 30 || night === 70) rec = shiftDayNight(all, rec, night);
  const i = fit.fam.indexOf(rec);
  const t: Tiers = { low: fit.fam.slice(0, i).reverse().find((p) => dailyProduction(p) < dailyProduction(rec)), rec, high: fit.fam.slice(i + 1).find((p) => dailyProduction(p) > dailyProduction(rec)) };
  if (night !== 0) return t;
  const strip = (p?: Preset) => (p ? withoutBatteries(p) : undefined);
  return { low: strip(t.low), rec: withoutBatteries(t.rec), high: strip(t.high) };
}
