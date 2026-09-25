/**
 * Memformat nominal angka ke format mata uang yang sesuai (misal: IDR -> Rp 25.000).
 */
export function formatCurrency(amount: number, currency = "IDR"): string {
  try {
    const cleanCurrency = currency.toUpperCase();
    if (cleanCurrency === "IDR") {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      })
        .format(amount)
        .replace(/\u00a0/g, " "); // Rapikan non-breaking space jadi spasi standar
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: cleanCurrency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback jika kode currency tidak standar
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
  }
}

/**
 * Memformat input angka menjadi string dengan pemisah ribuan titik (.) otomatis
 * Contoh: "25000" -> "25.000", "1500000" -> "1.500.000", 0 -> ""
 */
export function formatThousandInput(value: string | number): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  const numeric = parseInt(digits, 10);
  if (isNaN(numeric) || numeric === 0) return "";
  return numeric.toLocaleString("id-ID");
}

/**
 * Mengubah string berformat ribuan ("25.000") kembali menjadi number murni (25000)
 */
export function parseThousandInput(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) || 0;
}
