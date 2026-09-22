import { describe, it, expect } from "vitest";
import { categorizeExpense } from "../categorizer";

describe("Expense Categorizer Engine", () => {
  describe("Kategori Default Standar", () => {
    it("mengkategorikan Makanan & Minuman", () => {
      expect(categorizeExpense("kopi susu")).toBe("Makanan & Minuman");
      expect(categorizeExpense("nasi goreng ayam")).toBe("Makanan & Minuman");
      expect(categorizeExpense("lunch meeting")).toBe("Makanan & Minuman");
      expect(categorizeExpense("martabak manis")).toBe("Makanan & Minuman");
    });

    it("mengkategorikan Transportasi", () => {
      expect(categorizeExpense("bensin pertamax")).toBe("Transportasi");
      expect(categorizeExpense("parkir motor")).toBe("Transportasi");
      expect(categorizeExpense("gojek ke kantor")).toBe("Transportasi");
      expect(categorizeExpense("tiket krl")).toBe("Transportasi");
      expect(categorizeExpense("tiket kereta api")).toBe("Transportasi");
      expect(categorizeExpense("tiket pesawat garuda")).toBe("Transportasi");
    });

    it("mengkategorikan Belanja", () => {
      expect(categorizeExpense("belanja bulanan indomaret")).toBe("Belanja");
      expect(categorizeExpense("alfamart snack")).toBe("Makanan & Minuman"); // Snack diutamakan
      expect(categorizeExpense("sabun mandi")).toBe("Belanja");
      expect(categorizeExpense("kaos polos")).toBe("Belanja");
    });

    it("mengkategorikan Tagihan & Utilitas", () => {
      expect(categorizeExpense("token listrik")).toBe("Tagihan & Utilitas");
      expect(categorizeExpense("tagihan pdam air")).toBe("Tagihan & Utilitas");
      expect(categorizeExpense("isi paket data")).toBe("Tagihan & Utilitas");
      expect(categorizeExpense("iuran wifi indihome")).toBe("Tagihan & Utilitas");
    });

    it("mengkategorikan Langganan & Hiburan", () => {
      expect(categorizeExpense("langganan netflix")).toBe("Langganan & Hiburan");
      expect(categorizeExpense("spotify premium")).toBe("Langganan & Hiburan");
      expect(categorizeExpense("tiket bioskop xxi")).toBe("Langganan & Hiburan");
      expect(categorizeExpense("topup steam wallet")).toBe("Langganan & Hiburan");
    });

    it("mengkategorikan Kesehatan", () => {
      expect(categorizeExpense("beli vitamin c")).toBe("Kesehatan");
      expect(categorizeExpense("obat flu apotek")).toBe("Kesehatan");
      expect(categorizeExpense("konsultasi dokter")).toBe("Kesehatan");
    });
  });

  describe("Akurasi Batas Kata (Word Boundary)", () => {
    it("tidak mencocokkan substring di dalam kata lain ('rs' tidak mencocokkan 'kursi')", () => {
      expect(categorizeExpense("kursi kantor")).toBeNull();
    });

    it("tidak mencocokkan kata tiket umum ke transportasi jika bukan tiket transportasi", () => {
      // 'tiket' umum tanpa kata kereta/pesawat/bus tidak boleh langsung masuk Transportasi
      expect(categorizeExpense("tiket konser coldplay")).toBeNull();
    });

    it("case-insensitive matching (huruf besar dan kecil)", () => {
      expect(categorizeExpense("KOPI ESPRESSO")).toBe("Makanan & Minuman");
      expect(categorizeExpense("BeNsIn PeRtAlItE")).toBe("Transportasi");
    });
  });

  describe("Edge Cases: Tanda Baca & Whitespace Ekstrem", () => {
    it("mengenali keyword yang dikelilingi tanda baca (koma, kurung, strip)", () => {
      expect(categorizeExpense("nasi padang (bungkus)")).toBe("Makanan & Minuman");
      expect(categorizeExpense("kopi, roti & snack")).toBe("Makanan & Minuman");
      expect(categorizeExpense("go-jek / grab")).toBe("Transportasi");
    });

    it("menangani input dengan spasi liar, newline, dan tab", () => {
      expect(categorizeExpense("\n\t  nasi goreng ayam \t\n")).toBe("Makanan & Minuman");
    });
  });

  describe("Aturan Kustom (Custom Category Rules)", () => {
    it("menggunakan custom rules jika disediakan", () => {
      const customRules = [
        { name: "Peliharaan", keywords: ["whiskas", "cat food", "vet"] },
        { name: "Hobi", keywords: ["gunpla", "gundam"] },
      ];

      expect(categorizeExpense("beli whiskas kucing", customRules)).toBe("Peliharaan");
      expect(categorizeExpense("gunpla rg rx-78", customRules)).toBe("Hobi");
      expect(categorizeExpense("kopi", customRules)).toBeNull();
    });

    it("menangani karakter khusus regex pada kata kunci kustom (misal: tanda + atau .)", () => {
      const customRules = [
        { name: "Streaming", keywords: ["disney+"] },
        { name: "Kursus", keywords: ["c++ tutorial"] },
      ];

      expect(categorizeExpense("langganan disney+", customRules)).toBe("Streaming");
      expect(categorizeExpense("belajar c++ tutorial online", customRules)).toBe("Kursus");
    });

    it("fallback ke aturan default jika customRules yang dikirim berupa array kosong", () => {
      expect(categorizeExpense("kopi susu", [])).toBe("Makanan & Minuman");
    });

    it("mengabaikan kata kunci kosong atau hanya spasi pada custom rules", () => {
      const customRules = [
        { name: "Kosong", keywords: ["", "   "] },
        { name: "Valid", keywords: ["keyboard"] },
      ];

      expect(categorizeExpense("beli keyboard mekanik", customRules)).toBe("Valid");
      expect(categorizeExpense("apapun", customRules)).toBeNull();
    });
  });

  describe("Edge Cases: Input Tidak Valid & Tipe Data Aneh", () => {
    it("mengembalikan null untuk item yang tidak dikenali", () => {
      expect(categorizeExpense("bayar kas bendahara")).toBeNull();
    });

    it("mengembalikan null untuk string kosong atau spasi", () => {
      expect(categorizeExpense("")).toBeNull();
      expect(categorizeExpense("   ")).toBeNull();
    });

    it("mengembalikan null jika input berupa null, undefined, atau tipe data bukan string", () => {
      expect(categorizeExpense(null as unknown as string)).toBeNull();
      expect(categorizeExpense(undefined as unknown as string)).toBeNull();
      expect(categorizeExpense(12345 as unknown as string)).toBeNull();
    });
  });
});