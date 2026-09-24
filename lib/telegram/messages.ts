export const TELEGRAM_MESSAGES = {
  welcome: (username?: string) =>
    `
👋 <b>Halo ${username ? `@${username}` : "Kak"}! Selamat datang di Artha.</b>

Artha siap mencatat pengeluaran harianmu tanpa ribet. Cukup ketik langsung apa yang kamu beli:
• <code>kopi susu 25k</code>
• <code>bensin 30.000</code>
• <code>2x 15k mie ayam</code>
• <code>$15 lunch meeting</code>

Kategori dan nominal akan otomatis dideteksi! ✨

Ketik <b>/help</b> untuk melihat panduan lengkap.
`.trim(),

  help: () =>
    `
📖 <b>Panduan Penggunaan Artha</b>

1. <b>Catat Pengeluaran:</b>
   Ketik item dan nominalnya.
   Contoh: <code>makan siang 35rb</code>

2. <b>Jumlah Multiplier:</b>
   Gunakan format <code>[qty]x</code>.
   Contoh: <code>3x 20k ramen</code>

3. <b>Multi-Mata Uang:</b>
   Bisa simbol atau kode kata uang.
   Contoh: <code>$25 buku</code> atau <code>100 usd hotel</code>

4. <b>Batal Catat:</b>
   Ketik <b>/batal</b> untuk menghapus pengeluaran terakhir.

5. <b>Rekapitulasi:</b>
   Ketik <b>/rekap</b> untuk ringkasan pengeluaranmu.
`.trim(),

  expenseRecorded: (data: {
    itemName: string;
    amountFormatted: string;
    categoryName: string;
    walletName?: string;
    warning?: string;
  }) =>
    `
✅ <b>Pengeluaran Berhasil Dicatat!</b>

📝 <b>Item:</b> ${data.itemName}
💰 <b>Nominal:</b> ${data.amountFormatted}
🏷️ <b>Kategori:</b> ${data.categoryName}${data.walletName ? `\n💳 <b>Sumber:</b> ${data.walletName}` : ""}${data.warning || ""}
`.trim(),

  parseFailed: () =>
    `
⚠️ <b>Format tidak dikenali</b>

Pastikan memasukkan nama barang dan nominal harga.
Contoh: <code>kopi 25k</code> atau <code>bensin 30.000</code>
`.trim(),

  rekapEmpty: (periodName: string) =>
    `
📭 <b>Belum Ada Pengeluaran</b>

Tidak ada catatan pengeluaran pada <b>${periodName}</b>.
Ketik pengeluaran barumu, contoh: <code>kopi 25k</code>
`.trim(),

  rekapSummary: (data: {
    periodName: string;
    totalFormatted: string;
    count: number;
    breakdown: Array<{
      name: string;
      amountFormatted: string;
      percent: number;
    }>;
  }) => {
    const breakdownText =
      data.breakdown.length > 0
        ? data.breakdown
            .map(
              (b) => `• <b>${b.name}:</b> ${b.amountFormatted} (${b.percent}%)`,
            )
            .join("\n")
        : "• <i>Tanpa kategori khusus</i>";

    return `
📊 <b>Rekap Pengeluaran (${data.periodName})</b>

💰 <b>Total Pengeluaran:</b> ${data.totalFormatted}
🧾 <b>Total Transaksi:</b> ${data.count} transaksi

<b>Rincian per Kategori:</b>
${breakdownText}

💡 <i>Gunakan <b>/rekap minggu</b> untuk 7 hari terakhir atau <b>/rekap bulan</b> untuk bulan ini.</i>
`.trim();
  },

  batalSuccess: (itemName: string, amountFormatted: string) =>
    `
🗑️ <b>Transaksi Berhasil Dibatalkan!</b>

Catatan pengeluaran berikut telah dihapus:
• <b>${itemName}</b>: ${amountFormatted}
`.trim(),

  batalNotFound: () =>
    `
⚠️ <b>Tidak ada transaksi yang bisa dibatalkan.</b>
`.trim(),
};
