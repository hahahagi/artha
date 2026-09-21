export interface ParsedExpense {
  itemName: string;
  amount: number;
  currency: string;
}

// Peta konversi simbol dan kata mata uang ke kode ISO 4217
const CURRENCY_MAP: Record<string, string> = {
  "$": "USD",
  "€": "EUR",
  "£": "GBP",
  "¥": "JPY",
  "rp": "IDR",
  "usd": "USD",
  "eur": "EUR",
  "euro": "EUR",
  "gbp": "GBP",
  "jpy": "JPY",
  "sgd": "SGD",
  "myr": "MYR",
  "idr": "IDR",
};

export function parseExpenseText(
  text: string,
  defaultCurrency = "IDR"
): ParsedExpense | null {
  if (!text || typeof text !== "string") return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Deteksi Mata Uang (simbol atau kode kata)
  const currencyRegex = /(\$|€|£|¥|\b(?:rp|usd|eur|euro|gbp|jpy|sgd|myr|idr)\b)/i;
  const currMatch = trimmed.match(currencyRegex);
  let currency = defaultCurrency;
  if (currMatch) {
    const key = currMatch[1].toLowerCase().replace(".", "");
    currency = CURRENCY_MAP[key] ?? defaultCurrency;
  }

  // 2. Deteksi Multiplier Kuantitas (contoh: 2x 15k, 3x50rb)
  const multiplierRegex = /\b(\d+)\s*x\s*/i;
  const multMatch = trimmed.match(multiplierRegex);
  const qty = multMatch ? parseInt(multMatch[1], 10) : 1;

  // Hilangkan multiplier dari teks kerja agar tidak mengganggu pencarian nominal
  const workingText = multMatch
    ? trimmed.replace(multMatch[0], " ")
    : trimmed;

  // 3. Deteksi Pola Nominal Angka
  // Mendukung format ribuan bertitik (25.000), desimal (25,5k), satuan k/rb/jt, atau angka polos
  const amountRegex = /(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta)?\b/i;
  const amountMatch = workingText.match(amountRegex);

  if (!amountMatch) return null;

  const fullAmountMatchStr = amountMatch[0];
  let numStr = amountMatch[1];
  const unit = amountMatch[2]?.toLowerCase();

  // Normalisasi angka titik ribuan vs desimal koma
  if (/^\d{1,3}(\.\d{3})+/.test(numStr)) {
    if (numStr.includes(",")) {
      const parts = numStr.split(",");
      numStr = parts[0].replace(/\./g, "") + "." + parts[1];
    } else {
      numStr = numStr.replace(/\./g, "");
    }
  } else {
    numStr = numStr.replace(",", ".");
  }

  const rawNum = parseFloat(numStr);
  if (isNaN(rawNum) || rawNum <= 0) return null;

  // Tentukan pengali satuan
  let multiplier = 1;
  if (unit === "k" || unit === "rb" || unit === "ribu") multiplier = 1_000;
  if (unit === "jt" || unit === "juta") multiplier = 1_000_000;

  const totalAmount = Math.round(rawNum * multiplier * qty);
  if (isNaN(totalAmount) || totalAmount <= 0) return null;

  // 4. Bersihkan Teks untuk Menghasilkan Nama Item
  let itemName = workingText.replace(fullAmountMatchStr, " ");
  itemName = itemName.replace(currencyRegex, " ");
  itemName = itemName
    .replace(/^[\s\-–—:]+|[\s\-–—:]+$/g, "") // Hapus dash/tanda baca di awal/akhir
    .replace(/\s+/g, " ")                    // Rapikan multiple spasi
    .trim();

  // Jika nama barang kosong atau hanya simbol, reject
  if (!itemName) return null;

  return {
    itemName,
    amount: totalAmount,
    currency,
  };
}