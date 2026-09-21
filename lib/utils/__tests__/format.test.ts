import { describe, it, expect } from "vitest";
import { formatCurrency } from "../format";

describe("Format Currency Utility", () => {
  it("memformat IDR dengan benar tanpa desimal", () => {
    const res = formatCurrency(25000, "IDR");
    expect(res).toContain("Rp");
    expect(res).toContain("25.000");
  });

  it("memformat USD dengan simbol $", () => {
    const res = formatCurrency(50, "USD");
    expect(res).toContain("$");
    expect(res).toContain("50");
  });

  it("fallback ke kode mata uang jika tidak dikenali", () => {
    const res = formatCurrency(100, "XYZ");
    expect(res).toContain("XYZ");
    expect(res).toContain("100");
  });
});