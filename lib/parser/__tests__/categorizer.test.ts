import { describe, it, expect } from "vitest";
import { categorizeExpense, DEFAULT_CATEGORY_RULES } from "../categorizer";

describe("Expense Categorizer Engine", () => {
  describe("Kategori Default", () => {
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
    });

    it("mengkategorikan Belanja", () => {
      expect(categorizeExpense("belanja bulanan indomaret")).toBe("Belanja");
      expect(categorizeExpense("alfamart snack")).toBe("Makanan & Minuman"); // Kopi/snack diutamakan sesuai urutan rule atau belanja
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

  describe("Akurasi Kata & Word Boundary", () => {
    it("tidak mencocokkan substring di dalam kata lain ('rs' tidak mencocokkan 'kursi')", () => {
      // 'rs' adalah keyword Kesehatan, tetapi 'kursi kantor' bukan pengeluaran kesehatan
      expect(categorizeExpense("kursi kantor")).toBeNull();
    });

    it("case-insensitive matching (huruf besar dan kecil)", () => {
      expect(categorizeExpense("KOPI ESPRESSO")).toBe("Makanan & Minuman");
      expect(categorizeExpense("BeNsIn PeRtAlItE")).toBe("Transportasi");
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
      // Fallback ke null karena tidak ada di customRules
      expect(categorizeExpense("kopi", customRules)).toBeNull();
    });
  });

  describe("Edge Cases & Input Tidak Valid", () => {
    it("mengembalikan null untuk item yang tidak dikenali", () => {
      expect(categorizeExpense("bayar kas bendahara")).toBeNull();
    });

    it("mengembalikan null untuk string kosong atau spasi", () => {
      expect(categorizeExpense("")).toBeNull();
      expect(categorizeExpense("   ")).toBeNull();
    });
  });
});