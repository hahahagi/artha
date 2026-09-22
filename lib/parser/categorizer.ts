export interface CategoryRule {
  name: string;
  keywords: string[];
}

export const DEFAULT_CATEGORY_RULES: CategoryRule[] = [
  {
    name: "Makanan & Minuman",
    keywords: [
      "makan", "minum", "kopi", "cafe", "coffee", "lunch", "dinner", "sarapan",
      "nasi", "ayam", "mie", "bakso", "sate", "burger", "pizza", "resto",
      "boba", "snack", "cemilan", "martabak", "gorengan", "roti"
    ],
  },
    {
    name: "Transportasi",
    keywords: [
      "bensin", "pertalite", "pertamax", "solar", "gojek", "goride", "gocar",
      "grab", "grabcar", "maxim", "ojol", "parkir", "tol",
      "krl", "mrt", "lrt", "busway", "kereta", "tiket kereta", "tiket pesawat", "tiket bus",
      "flight", "pesawat", "taxi", "taksi"
    ],
  },
  {
    name: "Belanja",
    keywords: [
      "belanja", "supermarket", "indomaret", "alfamart", "alfamidi", "groceries",
      "pasar", "baju", "kaos", "celana", "sepatu", "skincare", "sabun", "shampoo",
      "tokopedia", "shopee", "lazada", "tiktok shop"
    ],
  },
  {
    name: "Tagihan & Utilitas",
    keywords: [
      "listrik", "pln", "token", "air", "pdam", "wifi", "indihome", "firstmedia",
      "biznet", "pulsa", "kuota", "paket data", "bpjs", "iuran", "pajak"
    ],
  },
  {
    name: "Langganan & Hiburan",
    keywords: [
      "netflix", "spotify", "youtube", "disney", "prime", "steam", "game",
      "bioskop", "cinema", "xxi", "nonton", "buku", "topup"
    ],
  },
  {
    name: "Kesehatan",
    keywords: [
      "obat", "apotek", "dokter", "klinik", "rumah sakit", "rs", "vitamin", "masker"
    ],
  },
];

/**
 * Mengkategorikan nama item berdasarkan aturan kata kunci (keyword matching).
 * Menggunakan word boundary regex agar tidak salah mencocokkan substring (contoh: 'rs' tidak mencocokkan 'kursi').
 *
 * @param itemName - Nama item pengeluaran yang sudah di-parse
 * @param customRules - Daftar kategori kustom (opsional, fallback ke DEFAULT_CATEGORY_RULES)
 * @returns Nama kategori yang cocok atau null jika tidak ada yang cocok
 */
export function categorizeExpense(
  itemName: string,
  customRules?: CategoryRule[]
): string | null {
  if (!itemName || typeof itemName !== "string") return null;

  const text = itemName.trim().toLowerCase();
  if (!text) return null;

  const rules = customRules && customRules.length > 0 ? customRules : DEFAULT_CATEGORY_RULES;

  for (const rule of rules) {
    for (const kw of rule.keywords) {
      const normalizedKeyword = kw.trim().toLowerCase();
      if (!normalizedKeyword) continue;

      // Escape karakter khusus regex jika ada
      const escapedKw = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      // \b cocok untuk mencocokkan batas kata utuh atau frasa
      const regex = new RegExp(`(?<!\\w)${escapedKw}(?!\\w)`, "i");

      if (regex.test(text)) {
        return rule.name;
      }
    }
  }

  return null;
}