import { describe, expect, it } from "vitest";
import presets from "./fixtures/crm-presets.json";
import { loadNeed, loadTiers, type Preset } from "@/lib/sizing";

const all = presets as unknown as Preset[];
describe("industrial / agricultural sizing", () => {
  it("daytime-only removes batteries and picks a commercial system", () => {
    const n = loadNeed("load", 10, 0, 290, "hp");
    const t = loadTiers(all, n.daily, n.minKw, 0)!;
    expect(t.rec.type).toBe("com");
    expect(t.rec.lines.some((l) => /بطارية/.test(l.name))).toBe(false);
  });
  it("inverter is at least 1.25x the load", () => {
    const n = loadNeed("load", 12, 50, 290, "kw");
    const t = loadTiers(all, n.daily, n.minKw, 50)!;
    expect(Number(t.rec.group.match(/(\d+)/)![1])).toBeGreaterThanOrEqual(15);
    expect(t.rec.lines.some((l) => /بطارية/.test(l.name))).toBe(true);
  });
});
