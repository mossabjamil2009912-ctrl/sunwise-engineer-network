import { describe, expect, it } from "vitest";
import { batteryOf, quoteTiers } from "@/lib/sizing";
import { crmKind } from "@/lib/acts-data";

describe("quote sizing", () => {
  it("70% night usage recommends more battery than a 50/50 split", () => {
    const even = quoteTiers("res", "bill", 300000, 50)!;
    const night = quoteTiers("res", "bill", 300000, 70)!;
    expect(batteryOf(night.rec)).toBeGreaterThan(batteryOf(even.rec));
  });

  it("70% day usage recommends less battery than a 50/50 split", () => {
    const even = quoteTiers("res", "bill", 300000, 50)!;
    const day = quoteTiers("res", "bill", 300000, 30)!;
    expect(batteryOf(day.rec)).toBeLessThan(batteryOf(even.rec));
  });

  it("a monthly kWh figure gives the same home system as the equivalent bill", () => {
    const byKwh = quoteTiers("res", "kwh", 1000, 50, 290)!;
    const byBill = quoteTiers("res", "bill", 290000, 50, 290)!;
    expect(byKwh.rec.title).toBe(byBill.rec.title);
  });
});

describe("join categories", () => {
  it("graduates and practising engineers are sent to the CRM as engineers, students as students", () => {
    expect(crmKind("graduate")).toBe("engineer");
    expect(crmKind("engineer")).toBe("engineer");
    expect(crmKind("student")).toBe("student");
  });
});
