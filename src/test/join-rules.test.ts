import { describe, it, expect } from "vitest";
import { servicesFor, skillsFor } from "@/lib/acts-data";
describe("join specialty rules", () => {
  it("telecom has no installation service", () => {
    expect(servicesFor("هندسة اتصالات وشبكات").map((s) => s.v)).toEqual(["صيانة", "برمجة", "استشارات"]);
  });
  it("telecom programming offers monitoring skills", () => {
    expect(skillsFor("هندسة اتصالات وشبكات", "برمجة").skills).toContain("إعداد المراقبة عن بُعد");
  });
  it("IT offers only programming and consulting", () => {
    expect(servicesFor("هندسة تكنولوجيا المعلومات").map((s) => s.v)).toEqual(["برمجة", "استشارات"]);
  });
});
