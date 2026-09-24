import { describe, it, expect } from "vitest";
import { parseExpenseText } from "../expense-parser";
import { detectWallet } from "../wallet-detector";

describe("Wallet Detector Engine", () => {
  it("mendeteksi berbagai e-wallet dan bank Indonesia", () => {
    expect(detectWallet("kopi gopay")?.wallet).toBe("GoPay");
    expect(detectWallet("bensin bca")?.wallet).toBe("BCA");
    expect(detectWallet("makan siang ovo")?.wallet).toBe("OVO");
    expect(detectWallet("belanja via dana")?.wallet).toBe("DANA");
    expect(detectWallet("nasi padang pakai spay")?.wallet).toBe("ShopeePay");
    expect(detectWallet("tiket kereta mandiri")?.wallet).toBe("Mandiri");
    expect(detectWallet("martabak tunai")?.wallet).toBe("Cash");
    expect(detectWallet("hotel cc")?.wallet).toBe("Kartu Kredit");
  });

  it("membersihkan teks dari keyword wallet", () => {
    const res = detectWallet("kopi susu 25k gopay");
    expect(res?.wallet).toBe("GoPay");
    expect(res?.cleanedText).toBe("kopi susu 25k");
  });

  it("mengembalikan null jika tidak ada keyword wallet", () => {
    expect(detectWallet("kopi susu")).toBeNull();
  });
});

describe("Expense Parser dengan Multi-Wallet Integration", () => {
  it("mengekstrak nominal, nama item, dan wallet sekaligus", () => {
    const parsed1 = parseExpenseText("kopi susu 25k gopay");
    expect(parsed1).toEqual({
      itemName: "kopi susu",
      amount: 25000,
      currency: "IDR",
      wallet: "GoPay",
    });

    const parsed2 = parseExpenseText("bensin 30rb via bca");
    expect(parsed2).toEqual({
      itemName: "bensin",
      amount: 30000,
      currency: "IDR",
      wallet: "BCA",
    });

    const parsed3 = parseExpenseText("makan 50k tunai");
    expect(parsed3).toEqual({
      itemName: "makan",
      amount: 50000,
      currency: "IDR",
      wallet: "Cash",
    });
  });
});