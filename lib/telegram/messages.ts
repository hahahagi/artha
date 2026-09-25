export const TELEGRAM_MESSAGES = {
  welcome: (username?: string) =>
    `
👋 <b>Halo ${username ? `@${username}` : "Kak"}! Selamat datang di Artha v2.0.</b>

Artha adalah asisten keuangan pintar untuk mencatat pengeluaran harian & tagihan langganan tanpa ribet.

✨ <b>Apa saja yang bisa kamu lakukan di sini?</b>
• 📝 <b>Ketik Langsung:</b> <code>kopi susu 25k</code> atau <code>bensin 30.000</code>
• 💳 <b>Multi-Wallet:</b> <code>makan siang 35rb gopay</code> (BCA, QRIS, OVO, Dana, Tunai, dll)
• 🤝 <b>Split Bill (Patungan):</b> <code>dinner 150k split 3 bca</code>
• 🔢 <b>Multiplier & Valas:</b> <code>2x 15k mie ayam</code> atau <code>$15 lunch</code>
• 🎤 <b>Voice Note AI:</b> Kirim pesan suara langsung (contoh: <i>"beli kopi dua puluh lima ribu pakai qris"</i>)
• ⏰ <b>Tagihan Rutin:</b> <code>/sub Netflix 54k tgl 25</code> (Pengingat otomatis H-3 & H-0)

🏷️ Setiap transaksi dilengkapi tombol interaktif <b>[Ubah Kategori]</b> dan <b>[Batalkan]</b> langsung di chat.

🌐 <b>Web Dashboard & Google Sheets Sync:</b>
Buka <a href="https://arthabot.vercel.app">arthabot.vercel.app</a> untuk fitur <b>Scan Struk Belanja (OCR)</b>, <b>Target Anggaran (Budget)</b>, <b>Grafik Analitik</b>, dan <b>Sinkronisasi Otomatis Google Sheets</b>.

Ketik <b>/help</b> untuk melihat panduan lengkap semua perintah!
`.trim(),

  help: () =>
    `
📖 <b>Panduan Lengkap Penggunaan Artha v2.0</b>

1️⃣ <b>Catat Pengeluaran Harian:</b>
   Ketik nama item dan nominalnya dengan gaya bebas.
   • <code>kopi susu 25k</code>
   • <code>bensin 35.000</code>
   • <code>tiket bioskop 1,5jt</code>

2️⃣ <b>Deteksi Dompet / Metode Bayar (Multi-Wallet):</b>
   Tambahkan nama bank/e-wallet di akhir pesan.
   • <code>ayam geprek 28k gopay</code>
   • <code>belanja bulanan 250rb bca</code>
   • <code>parkir 5k tunai</code>
   <i>(Mendukung: Tunai, GoPay, OVO, Dana, ShopeePay, QRIS, BCA, Mandiri, BRI, BNI, Jago, SeaBank, Kartu Kredit)</i>

3️⃣ <b>Split Bill / Patungan Otomatis:</b>
   Gunakan kata kunci <code>split [jumlah]</code>, <code>bagi [jumlah]</code>, atau <code>/[jumlah]p</code>. Artha otomatis mencatat porsi kamu saja!
   • <code>dinner sushi 300k split 3</code> → Dicatat Rp 100.000
   • <code>taksi bandara 120rb bagi 4 gopay</code> → Dicatat Rp 30.000

4️⃣ <b>Jumlah Multiplier & Mata Uang Asing:</b>
   • Multiplier: <code>3x 20k ramen</code> (Dicatat Rp 60.000)
   • Multi-Currency: <code>$25 buku</code>, <code>20 sgd makan</code>, <code>50 eur hotel</code>

5️⃣ <b>Catat via Pesan Suara (Voice Note AI) 🎤:</b>
   Malas mengetik? Tekan ikon mikrofon di Telegram dan ucapkan pengeluaranmu, misalnya:
   <i>"Makan malam empat puluh lima ribu pakai GoPay"</i>

6️⃣ <b>Koreksi Kategori & Batalkan Transaksi:</b>
   • Klik tombol <b>[🏷️ Ubah Kategori]</b> di bawah pesan balasan bot jika kategori kurang tepat.
   • Klik tombol <b>[↩️ Batalkan]</b> atau ketik <b>/batal</b> untuk menghapus transaksi terakhir.

7️⃣ <b>Manajemen Langganan Rutin (/sub):</b>
   Dapatkan notifikasi pengingat H-3 dan Hari-H sebelum saldo terpotong:
   • Daftar baru: <code>/sub Netflix 54k tgl 25</code>
   • Lihat daftar aktif: <code>/sub list</code>

8️⃣ <b>Rekapitulasi & Laporan (/rekap):</b>
   • <code>/rekap</code> atau <code>/rekap bulan</code> — Ringkasan pengeluaran bulan ini
   • <code>/rekap minggu</code> — Ringkasan 7 hari terakhir
   <i>(Bot juga mengirimkan laporan perbandingan mingguan otomatis setiap Senin pagi!)</i>

9️⃣ <b>Hubungkan ke Web Dashboard & Google Sheets:</b>
   Login di <a href="https://arthabot.vercel.app">arthabot.vercel.app</a> → menu <b>Pengaturan</b> → klik <b>Hubungkan Telegram</b> untuk menikmati fitur Scan Struk OCR, Target Budget Bulanan, dan Auto-Sync Google Sheets.
`.trim(),

  expenseRecorded: (data: {
    itemName: string;
    amountFormatted: string;
    categoryName: string;
    walletName?: string;
    warning?: string;
    splitInfo?: {
      originalFormatted: string;
      count: number;
    };
  }) =>
    `
✅ <b>Pengeluaran Berhasil Dicatat!</b>

📝 <b>Item:</b> ${data.itemName}
${data.splitInfo ? `🧾 <b>Total Tagihan:</b> ${data.splitInfo.originalFormatted} ÷ ${data.splitInfo.count} orang\n` : ""}💰 <b>Nominal${data.splitInfo ? " (Porsi Kamu)" : ""}:</b> ${data.amountFormatted}
🏷️ <b>Kategori:</b> ${data.categoryName}${data.walletName ? `\n💳 <b>Sumber:</b> ${data.walletName}` : ""}${data.warning || ""}
`.trim(),

  parseFailed: () =>
    `
⚠️ <b>Format tidak dikenali</b>

Pastikan menyertakan nama pengeluaran dan nominal harga.
<b>Contoh yang didukung:</b>
• Teks biasa: <code>kopi susu 25k</code>
• Dengan dompet: <code>makan siang 35rb gopay</code>
• Patungan: <code>dinner 150k split 3</code>
• Multiplier: <code>2x 15k mie ayam</code>
• Pesan suara: Kirim <i>Voice Note</i> langsung ke bot 🎤

Ketik <b>/help</b> untuk panduan lengkap.
`.trim(),

  rekapEmpty: (periodName: string) =>
    `
📭 <b>Belum Ada Pengeluaran</b>

Tidak ada catatan pengeluaran pada <b>${periodName}</b>.
Ketik pengeluaran barumu, contoh: <code>kopi 25k gopay</code>
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