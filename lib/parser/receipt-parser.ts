export interface ParsedReceipt {
  merchantName?: string;
  totalAmount: number;
  rawText: string;
}

/**
 * Mengekstrak nominal total dan nama toko dari teks OCR struk
 */
export function parseReceiptText(ocrText: string): ParsedReceipt | null {
  if (!ocrText || typeof ocrText !== "string") return null;

  const lines = ocrText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return null;

  // 1. Deteksi Nama Toko / Merchant (biasanya di 3 baris teratas)
  let merchantName: string | undefined;
  for (let i = 0; i < Math.min(4, lines.length); i++) {
    const line = lines[i];
    // Abaikan jika baris hanya tanggal, nomor invoice, atau kata sambutan
    if (
      line.length >= 3 &&
      !/^\d+$/.test(line) &&
      !/\d{2}[-/.]\d{2}[-/.]\d{2,4}/.test(line) &&
      !/(struk|receipt|nota|bon|selamat datang|welcome|kasir|cashier)/i.test(line)
    ) {
      merchantName = line.replace(/[^a-zA-Z0-9\s&.-]/g, "").trim();
      if (merchantName) break;
    }
  }

  // 2. Deteksi Total Nominal
  // Prioritas A: Baris yang mengandung kata TOTAL, SUB TOTAL, JUMLAH, TAGIHAN
  let detectedAmount: number | null = null;
  const totalRegex =
    /(?:total(?:\s+bayar|\s+belanja|\s+akhir)?|grand\s*total|sub\s*total|jumlah(?:\s+bayar)?|tagihan)\s*[:=]?\s*(?:rp\.?\s*)?([\d.,]+)/i;

  for (const line of lines) {
    const match = line.match(totalRegex);
    if (match) {
      const num = cleanAndParseAmount(match[1]);
      if (num && num > 0) {
        detectedAmount = num;
        break;
      }
    }
  }

  // Prioritas B: Jika label TOTAL tidak ditemukan, cari angka nominal terbesar sebelum kata "KEMBALI"
  if (!detectedAmount) {
    const candidates: number[] = [];
    let isAfterKembali = false;

    for (const line of lines) {
      if (/kembali(?:an)?/i.test(line)) {
        isAfterKembali = true;
      }
      if (!isAfterKembali) {
        const matches = line.matchAll(
          /(?:rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d+)?|\d{4,})/gi,
        );
        for (const m of matches) {
          const num = cleanAndParseAmount(m[1]);
          if (num && num >= 1000 && num < 100_000_000) {
            candidates.push(num);
          }
        }
      }
    }

    if (candidates.length > 0) {
      detectedAmount = Math.max(...candidates);
    }
  }

  if (!detectedAmount || detectedAmount <= 0) return null;

  return {
    merchantName,
    totalAmount: detectedAmount,
    rawText: ocrText,
  };
}

function cleanAndParseAmount(str: string): number | null {
  const cleaned = str.replace(/[^\d]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? null : num;
}