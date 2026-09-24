import { describe, it, expect } from "vitest";
import { parseReceiptText } from "../receipt-parser";

describe("Receipt OCR Parser", () => {
  it("mengekstrak merchant dan total dengan kata kunci TOTAL", () => {
    const sample = `
      INDOMARET POINT
      JL. SUDIRMAN NO 12
      ROTI TAWAR    18.000
      SUSU UHT      22.000
      TOTAL         40.000
      TUNAI         50.000
      KEMBALI       10.000
    `;
    const res = parseReceiptText(sample);
    expect(res?.merchantName).toBe("INDOMARET POINT");
    expect(res?.totalAmount).toBe(40000);
  });

  it("mengekstrak nominal berlabel GRAND TOTAL", () => {
    const sample = `
      KOPI KENANGAN
      1x Latte 28.000
      GRAND TOTAL: Rp 28.000
      Terima Kasih
    `;
    const res = parseReceiptText(sample);
    expect(res?.merchantName).toBe("KOPI KENANGAN");
    expect(res?.totalAmount).toBe(28000);
  });

  it("mengambil nominal terbesar jika tidak ada label total", () => {
    const sample = `
      WARUNG MAKAN
      Ayam Bakar 25.000
      Es Teh 5.000
      30.000
      KEMBALI 20.000
    `;
    const res = parseReceiptText(sample);
    expect(res?.totalAmount).toBe(30000);
  });

  it("mengembalikan null jika teks kosong", () => {
    expect(parseReceiptText("")).toBeNull();
  });
});