import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatThousandInput,
  parseThousandInput,
} from "../format";

describe("Format Currency Utility", () => {
  describe("Mata Uang Rupiah (IDR)", () => {
    it("memformat nominal IDR positif tanpa desimal", () => {
      const res = formatCurrency(25000, "IDR");
      expect(res).toContain("Rp");
      expect(res).toContain("25.000");
    });

    it("memformat angka nol (0 IDR)", () => {
      const res = formatCurrency(0, "IDR");
      expect(res).toContain("Rp");
      expect(res).toContain("0");
    });

    it("memformat nominal negatif", () => {
      const res = formatCurrency(-50000, "IDR");
      expect(res).toContain("50.000");
    });

    it("menangani kode mata uang huruf kecil (idr)", () => {
      const res = formatCurrency(10000, "idr");
      expect(res).toContain("Rp");
      expect(res).toContain("10.000");
    });

    it("menggunakan IDR sebagai default jika currency tidak diisi", () => {
      const res = formatCurrency(75000);
      expect(res).toContain("Rp");
      expect(res).toContain("75.000");
    });
  });

  describe("Mata Uang Asing & Multi-Currency", () => {
    it("memformat USD dengan simbol $ dan 2 digit desimal", () => {
      const res = formatCurrency(50.5, "USD");
      expect(res).toContain("$");
      expect(res).toContain("50.50");
    });

    it("memformat JPY (Yen Jepang)", () => {
      const res = formatCurrency(1500, "JPY");
      expect(res).toMatch(/¥|JPY/);
      expect(res).toContain("1,500");
    });

    it("memformat EUR (Euro)", () => {
      const res = formatCurrency(100, "EUR");
      expect(res).toMatch(/€|EUR/);
      expect(res).toContain("100");
    });

    it("memformat SGD (Dolar Singapura)", () => {
      const res = formatCurrency(25, "SGD");
      expect(res).toMatch(/SGD|\$/);
      expect(res).toContain("25");
    });
  });

  describe("Fallback & Error Handling", () => {
    it("fallback ke kode mata uang jika kode currency tidak standar", () => {
      const res = formatCurrency(100, "XYZ");
      expect(res).toContain("XYZ");
      expect(res).toContain("100");
    });

    it("menangani karakter simbol yang memicu error Intl", () => {
      const res = formatCurrency(999, "123!@#");
      expect(res).toContain("999");
    });
  });

  describe("Thousand Separator Input Helper", () => {
    it("memformat angka ribuan dan jutaan dengan titik otomatis", () => {
      expect(formatThousandInput(500)).toBe("500");
      expect(formatThousandInput(25000)).toBe("25.000");
      expect(formatThousandInput("1500000")).toBe("1.500.000");
      expect(formatThousandInput("Rp 75.000")).toBe("75.000");
    });

    it("mengembalikan string kosong untuk 0 atau input kosong", () => {
      expect(formatThousandInput(0)).toBe("");
      expect(formatThousandInput("")).toBe("");
      expect(formatThousandInput("abc")).toBe("");
    });

    it("mem-parsing string bertitik kembali menjadi number murni", () => {
      expect(parseThousandInput("25.000")).toBe(25000);
      expect(parseThousandInput("1.500.000")).toBe(1500000);
      expect(parseThousandInput("")).toBe(0);
    });
  });
});
