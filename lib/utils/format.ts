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