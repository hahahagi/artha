import { describe, it, expect } from "vitest";
import { parseExpenseText } from "../expense-parser";

describe("Expense Parser Engine", () => {
  describe("Format Nominal Lokal Indonesia", () => {
    it("parsing satuan k (kopi susu 25k)", () => {
      const res = parseExpenseText("kopi susu 25k");
      expect(res).toEqual({ itemName: "kopi susu", amount: 25000, currency: "IDR" });
    });

    it("parsing satuan rb (makan siang 35rb)", () => {
      const res = parseExpenseText("makan siang 35rb");
      expect(res).toEqual({ itemName: "makan siang", amount: 35000, currency: "IDR" });
    });

    it("parsing satuan ribu (martabak 40ribu)", () => {
      const res = parseExpenseText("martabak 40ribu");
      expect(res).toEqual({ itemName: "martabak", amount: 40000, currency: "IDR" });
    });

    it("parsing satuan jt & desimal koma (sewa kos 1,5jt)", () => {
      const res = parseExpenseText("sewa kos 1,5jt");
      expect(res).toEqual({ itemName: "sewa kos", amount: 1500000, currency: "IDR" });
    });

    it("parsing satuan juta (service mobil 2juta)", () => {
      const res = parseExpenseText("service mobil 2juta");
      expect(res).toEqual({ itemName: "service mobil", amount: 2000000, currency: "IDR" });
    });

    it("parsing pemisah ribuan titik (bensin 30.000)", () => {
      const res = parseExpenseText("bensin 30.000");
      expect(res).toEqual({ itemName: "bensin", amount: 30000, currency: "IDR" });
    });

    it("parsing jutaan pemisah titik (belanja bulanan 1.250.000)", () => {
      const res = parseExpenseText("belanja bulanan 1.250.000");
      expect(res).toEqual({ itemName: "belanja bulanan", amount: 1250000, currency: "IDR" });
    });

    it("parsing angka polos tanpa satuan (parkir 5000)", () => {
      const res = parseExpenseText("parkir 5000");
      expect(res).toEqual({ itemName: "parkir", amount: 5000, currency: "IDR" });
    });
  });

  describe("Posisi Angka & Prefix Rp", () => {
    it("angka di depan nama item (25k kopi espresso)", () => {
      const res = parseExpenseText("25k kopi espresso");
      expect(res).toEqual({ itemName: "kopi espresso", amount: 25000, currency: "IDR" });
    });

    it("format titik di depan (50.000 makan malam)", () => {
      const res = parseExpenseText("50.000 makan malam");
      expect(res).toEqual({ itemName: "makan malam", amount: 50000, currency: "IDR" });
    });

    it("prefix Rp (Rp 25.000 sate ayam)", () => {
      const res = parseExpenseText("Rp 25.000 sate ayam");
      expect(res).toEqual({ itemName: "sate ayam", amount: 25000, currency: "IDR" });
    });

    it("prefix rp tanpa spasi (rp50k bensin)", () => {
      const res = parseExpenseText("rp50k bensin");
      expect(res).toEqual({ itemName: "bensin", amount: 50000, currency: "IDR" });
    });
  });

  describe("Multiplier Kuantitas", () => {
    it("multiplier format '2x 15k kopi'", () => {
      const res = parseExpenseText("2x 15k kopi");
      expect(res).toEqual({ itemName: "kopi", amount: 30000, currency: "IDR" });
    });

    it("multiplier format di belakang 'mie ayam 3x20rb'", () => {
      const res = parseExpenseText("mie ayam 3x20rb");
      expect(res).toEqual({ itemName: "mie ayam", amount: 60000, currency: "IDR" });
    });
  });

  describe("Multi-Currency", () => {
    it("simbol USD di depan ($50 lunch meeting)", () => {
      const res = parseExpenseText("$50 lunch meeting");
      expect(res).toEqual({ itemName: "lunch meeting", amount: 50, currency: "USD" });
    });

    it("kata USD di belakang (hotel booking 120 usd)", () => {
      const res = parseExpenseText("hotel booking 120 usd");
      expect(res).toEqual({ itemName: "hotel booking", amount: 120, currency: "USD" });
    });

    it("simbol Euro (€35 dinner)", () => {
      const res = parseExpenseText("€35 dinner");
      expect(res).toEqual({ itemName: "dinner", amount: 35, currency: "EUR" });
    });

    it("simbol Yen (¥3000 souvenir jepang)", () => {
      const res = parseExpenseText("¥3000 souvenir jepang");
      expect(res).toEqual({ itemName: "souvenir jepang", amount: 3000, currency: "JPY" });
    });

    it("mata uang SGD (transport mrt 15 sgd)", () => {
      const res = parseExpenseText("transport mrt 15 sgd");
      expect(res).toEqual({ itemName: "transport mrt", amount: 15, currency: "SGD" });
    });
  });

  describe("Edge Cases & Invalid Input", () => {
    it("membersihkan separator dash (bensin 30.000 - motor)", () => {
      const res = parseExpenseText("bensin 30.000 - motor");
      expect(res).not.toBeNull();
      expect(res?.amount).toBe(30000);
      expect(res?.itemName).toContain("bensin");
    });

    it("return null jika teks tanpa nominal (hanya beli kopi)", () => {
      const res = parseExpenseText("hanya beli kopi");
      expect(res).toBeNull();
    });

    it("return null jika hanya nominal tanpa nama barang (25000)", () => {
      const res = parseExpenseText("25000");
      expect(res).toBeNull();
    });

    it("return null jika string kosong atau hanya spasi", () => {
      expect(parseExpenseText("")).toBeNull();
      expect(parseExpenseText("   ")).toBeNull();
    });
  });
});