import { describe, it, expect } from "vitest";
import { parseExpenseText } from "../expense-parser";

describe("Split Bill Parser", () => {
  it("membagi tagihan menggunakan kata 'bagi N'", () => {
    const res = parseExpenseText("makan bareng 120k bagi 3");
    expect(res).toEqual({
      itemName: "makan bareng",
      amount: 40000,
      currency: "IDR",
      splitCount: 3,
      originalAmount: 120000,
    });
  });

  it("membagi tagihan menggunakan kata 'split N'", () => {
    const res = parseExpenseText("dinner 200rb split 4");
    expect(res).toEqual({
      itemName: "dinner",
      amount: 50000,
      currency: "IDR",
      splitCount: 4,
      originalAmount: 200000,
    });
  });

  it("membagi tagihan menggunakan simbol '/N'", () => {
    const res = parseExpenseText("karaoke 500k /5");
    expect(res).toEqual({
      itemName: "karaoke",
      amount: 100000,
      currency: "IDR",
      splitCount: 5,
      originalAmount: 500000,
    });
  });

  it("membulatkan ke atas jika hasil bagi memiliki desimal", () => {
    const res = parseExpenseText("pizza 100k dibagi 3");
    expect(res?.amount).toBe(33334);
    expect(res?.originalAmount).toBe(100000);
    expect(res?.splitCount).toBe(3);
  });

  it("bekerja berdampingan dengan wallet detector", () => {
    const res = parseExpenseText("makan 90k bagi 3 via gopay");
    expect(res?.amount).toBe(30000);
    expect(res?.wallet).toBe("GoPay");
    expect(res?.itemName).toBe("makan");
  });
});