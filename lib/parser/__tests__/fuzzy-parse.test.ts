import { describe, it, expect } from "vitest";
import { fuzzyParseExpense } from "../expense-parser";

describe("Parser Ambiguity Fallback (fuzzyParseExpense)", () => {
  it("mengembalikan HIGH confidence untuk format pengeluaran yang jelas", () => {
    const res1 = fuzzyParseExpense("kopi 25k");
    expect(res1.confidence).toBe("high");
    expect(res1.parsed?.amount).toBe(25000);
    expect(res1.parsed?.itemName).toBe("kopi");

    const res2 = fuzzyParseExpense("bensin 50.000 bca");
    expect(res2.confidence).toBe("high");
    expect(res2.parsed?.amount).toBe(50000);
    expect(res2.parsed?.wallet).toBe("BCA");
  });

  it("mengembalikan LOW confidence untuk input hanya nominal (tanpa nama barang)", () => {
    const res = fuzzyParseExpense("50k");
    expect(res.confidence).toBe("low");
    expect(res.reason).toBe("missing_item_name");
    expect(res.parsed?.amount).toBe(50000);
    expect(res.parsed?.itemName).toBe("Pengeluaran");
  });

  it("mengembalikan LOW confidence untuk kata kerja umum (generic verb)", () => {
    const res1 = fuzzyParseExpense("beli 100k");
    expect(res1.confidence).toBe("low");
    expect(res1.reason).toBe("generic_verb");

    const res2 = fuzzyParseExpense("bayar 50rb");
    expect(res2.confidence).toBe("low");
    expect(res2.reason).toBe("generic_verb");
  });

  it("mengembalikan LOW confidence untuk angka kecil rupiah yang mencurigakan", () => {
    const res = fuzzyParseExpense("kopi 25");
    expect(res.confidence).toBe("low");
    expect(res.reason).toBe("nominal_too_small");
    expect(res.parsed?.amount).toBe(25);
  });

  it("mengembalikan NONE confidence untuk teks acak tanpa angka", () => {
    expect(fuzzyParseExpense("halo apa kabar").confidence).toBe("none");
    expect(fuzzyParseExpense("terima kasih bot").confidence).toBe("none");
  });
});