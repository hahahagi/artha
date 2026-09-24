/**
 * Peta standarisasi keyword wallet ke nama resmi
 */
const WALLET_MAP: Record<string, string> = {
  bca: "BCA",
  bni: "BNI",
  bri: "BRI",
  mandiri: "Mandiri",
  cimb: "CIMB",
  jago: "Bank Jago",
  seabank: "SeaBank",
  gopay: "GoPay",
  "go-pay": "GoPay",
  ovo: "OVO",
  dana: "DANA",
  shopeepay: "ShopeePay",
  spay: "ShopeePay",
  linkaja: "LinkAja",
  qris: "QRIS",
  cash: "Cash",
  tunai: "Cash",
  "kartu kredit": "Kartu Kredit",
  cc: "Kartu Kredit",
  debit: "Debit",
};

export interface WalletDetectionResult {
  wallet: string;
  cleanedText: string;
}

/**
 * Mendeteksi nama wallet/sumber dana dari teks dan mengembalikan teks yang sudah dibersihkan
 */
export function detectWallet(text: string): WalletDetectionResult | null {
  if (!text || typeof text !== "string") return null;

  // Regex menangani awalan opsional seperti 'via', 'pakai', 'pake', 'by'
  const walletRegex =
    /(?:(?:via|pake|pakai|by)\s+)?\b(bca|bni|bri|mandiri|cimb|jago|seabank|gopay|go-pay|ovo|dana|shopeepay|spay|linkaja|qris|cash|tunai|kartu\s+kredit|cc|debit)\b/i;

  const match = text.match(walletRegex);
  if (!match) return null;

  const matchedRaw = match[0];
  const keyword = match[1].toLowerCase().replace(/\s+/, " ");
  const standardizedWallet = WALLET_MAP[keyword] || keyword.toUpperCase();

  // Bersihkan keyword wallet dari teks item
  const cleanedText = text
    .replace(matchedRaw, " ")
    .replace(/^[\s\-–—:]+|[\s\-–—:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    wallet: standardizedWallet,
    cleanedText: cleanedText || text.trim(),
  };
}