import { parseExpenseText } from "./expense-parser";

export interface ParsedSubscription {
  serviceName: string;
  amount: number;
  currency: string;
  billingDay: number;
}

/**
 * Mem-parse teks pendaftaran langganan seperti:
 * "Netflix 54k tgl 15" atau "Spotify Rp 55.000 tanggal 25" atau "ChatGPT 20 usd tgl 1"
 */
export function parseSubscriptionText(text: string): ParsedSubscription | null {
  if (!text || typeof text !== "string") return null;

  const trimmed = text.trim();
  if (!trimmed) return null;

  // 1. Ekstrak pola tanggal: "tgl 15" atau "tanggal 15"
  const tglRegex = /\b(?:tgl|tanggal)\s*(\d{1,2})\b/i;
  const tglMatch = trimmed.match(tglRegex);

  if (!tglMatch) return null;

  const billingDay = parseInt(tglMatch[1], 10);
  if (isNaN(billingDay) || billingDay < 1 || billingDay > 31) {
    return null;
  }

  // 2. Hilangkan penanda tanggal dari teks kerja
  const textWithoutTgl = trimmed.replace(tglMatch[0], " ").trim();

  // 3. Gunakan engine expense parser untuk mengambil nama layanan & nominal
  const parsedExpense = parseExpenseText(textWithoutTgl);
  if (!parsedExpense) return null;

  return {
    serviceName: parsedExpense.itemName,
    amount: parsedExpense.amount,
    currency: parsedExpense.currency,
    billingDay,
  };
}