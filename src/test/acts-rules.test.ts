import { describe, expect, it } from "vitest";
import { batteryOf, presetPrice, quoteTiers as qt, type Preset } from "@/lib/sizing";
import snapshot from "./fixtures/crm-presets.json";

// Snapshot of the CRM bridge presets, used only to exercise the selection rules.
const P = snapshot as Preset[];
const quoteTiers = (path: "res" | "com", m: "bill" | "kwh", v: number, n: 30 | 50 | 70, price = 290) => qt(P, path, m, v, n, price);
import { crmKind } from "@/lib/acts-data";

describe("quote sizing", () => {
  it("70% night usage recommends more battery than a 50/50 split", () => {
    const even = quoteTiers("res", "bill", 100000, 50)!;
    const night = quoteTiers("res", "bill", 100000, 70)!;
    expect(batteryOf(night.rec)).toBeGreaterThan(batteryOf(even.rec));
  });

  it("70% day usage recommends less battery than a 50/50 split", () => {
    const even = quoteTiers("res", "bill", 100000, 50)!;
    const day = quoteTiers("res", "bill", 100000, 30)!;
    expect(batteryOf(day.rec)).toBeLessThan(batteryOf(even.rec));
  });

  it("a monthly kWh figure gives the same home system as the equivalent bill", () => {
    const byKwh = quoteTiers("res", "kwh", 1000, 50, 290)!;
    const byBill = quoteTiers("res", "bill", 290000, 50, 290)!;
    expect(byKwh.rec.title).toBe(byBill.rec.title);
  });
});

describe("system price", () => {
  it("is the sum of price × qty over the system lines", () => {
    const p: Preset = { type: "res", group: "g", title: "t", panels: 1, pw: 595, lines: [
      { name: "a", unit: null, price: 110, qty: 2 }, { name: "b", unit: null, price: 2.5, qty: 20 },
    ] };
    expect(presetPrice(p)).toBe(270);
  });
  it("no systems from the CRM means no suggestion", () => {
    expect(qt([], "res", "bill", 100000, 50, 290)).toBeNull();
  });
});

describe("join categories", () => {
  it("graduates and practising engineers are sent to the CRM as engineers, students as students", () => {
    expect(crmKind("graduate")).toBe("engineer");
    expect(crmKind("engineer")).toBe("engineer");
    expect(crmKind("student")).toBe("student");
  });
});
