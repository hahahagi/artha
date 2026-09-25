import Link from "next/link";
import {
  Wallet,
  Send,
  ArrowRight,
  Sparkles,
  CalendarClock,
  BarChart3,
  Receipt,
  Mic,
  ScanLine,
  Users,
  PiggyBank,
  FileSpreadsheet,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingView() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <Wallet className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight">Artha</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400">
                v2.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://t.me/ArthaTrackBot"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Send className="h-3.5 w-3.5 text-sky-500" />
              <span>@ArthaTrackBot</span>
            </a>
            <ThemeToggle />
            <Link href="/register">
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex rounded-xl px-4 text-xs font-semibold"
              >
                Daftar
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="sm"
                className="rounded-xl px-4 text-xs font-semibold"
              >
                Masuk
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>
              Baru di Artha v2.0 — Voice Note AI, Scan Struk OCR, Split Bill &
              Google Sheets Sync
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15]">
            Catat Pengeluaran Semudah{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Chatting & Voice Note
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Kirim teks santai atau pesan suara ke bot Telegram, foto struk
            belanja dari web, dan biarkan Artha mengenali nominal, dompet,
            kategori, hingga menyinkronkannya otomatis ke Google Sheets Anda.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full gap-2 rounded-xl text-sm font-semibold sm:w-auto"
              >
                <span>Daftar Sekarang — Gratis</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="https://t.me/ArthaTrackBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              <Send className="h-4 w-4 text-sky-500" />
              <span>Coba @ArthaTrackBot</span>
            </a>
          </div>

          {/* 3. Simulasi Chat Mockup v2.0 */}
          <div className="mx-auto mt-14 max-w-lg rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-left">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white">
                  <Send className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    Artha Telegram Bot (@ArthaTrackBot)
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ● Online 24/7 • Auto-Sync Google Sheets
                  </p>
                </div>
              </div>
              <span className="rounded-md bg-zinc-200/70 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                v2.0 AI
              </span>
            </div>

            <div className="mt-4 space-y-3 font-sans text-xs">
              {/* Bubble Chat User 1: Multi-Wallet */}
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-sky-500 px-3.5 py-2 text-white shadow-sm">
                  kopi susu 25k gopay
                </div>
              </div>
              {/* Bubble Chat Bot 1 */}
              <div className="flex justify-start">
                <div className="space-y-1.5 max-w-[85%]">
                  <div className="rounded-2xl rounded-tl-sm bg-white p-3 shadow-sm border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ✅ Pengeluaran Berhasil Dicatat!
                    </p>
                    <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                      📝 <b>Item:</b> Kopi Susu • 💰 <b>Rp 25.000</b>
                    </p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      🏷️ Kategori: Makanan • 💳 Sumber: GoPay
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-medium text-center">
                    <div className="rounded-lg border border-zinc-200 bg-white py-1 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                      🏷️ Ubah Kategori
                    </div>
                    <div className="rounded-lg border border-zinc-200 bg-white py-1 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
                      ↩️ Batalkan
                    </div>
                  </div>
                </div>
              </div>

              {/* Bubble Chat User 2: Voice Note + Split Bill */}
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-sky-500 px-3.5 py-2 text-white shadow-sm flex items-center gap-2">
                  <Mic className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    <i>&quot;Dinner sushi 300rb split 3 pakai BCA&quot;</i>
                  </span>
                </div>
              </div>
              {/* Bubble Chat Bot 2 */}
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-white p-3 shadow-sm border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 max-w-[85%]">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ✅ Pengeluaran Berhasil Dicatat!
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                    📝 <b>Item:</b> Dinner Sushi
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    🧾 Total: Rp 300.000 ÷ 3 orang →{" "}
                    <b className="text-zinc-900 dark:text-zinc-100">
                      Porsi Kamu: Rp 100.000
                    </b>
                  </p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    🏷️ Kategori: Makanan • 💳 Sumber: BCA
                  </p>
                </div>
              </div>

              {/* Bubble Chat User 3: Subscription */}
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-sky-500 px-3.5 py-2 text-white shadow-sm">
                  /sub Netflix 54k tgl 25
                </div>
              </div>
              {/* Bubble Chat Bot 3 */}
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-white p-3 shadow-sm border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 max-w-[85%]">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ✅ Langganan Berhasil Dicatat!
                  </p>
                  <p className="mt-1 text-zinc-600 dark:text-zinc-300">
                    📺 Netflix • <b>Rp 54.000/bln</b> (Tgl 25)
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    💡 Pengingat H-3 dan H-0 otomatis aktif.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Fitur Unggulan v2.0 (9 Kartu Lengkap) */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ekosistem Lengkap Pengelola Keuangan Harian
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Seluruh fitur dirancang untuk memangkas waktu pencatatan hingga di
              bawah 3 detik.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* 1. Natural Language */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">
                Natural Language & Valas
              </h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Mendukung format angka lokal{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">
                  25k
                </code>
                ,{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">
                  55.000
                </code>
                ,{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">
                  1,5jt
                </code>
                , perkalian{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">
                  2x 15rb
                </code>
                , mata uang asing ($20, SGD, EUR), hingga konfirmasi pintar jika
                Anda lupa mengetik ribuan.
              </p>
            </div>

            {/* 2. Multi-Wallet */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">
                Deteksi Multi-Wallet Otomatis
              </h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Cukup tambahkan nama dompet di chat seperti{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">
                  kopi 25k gopay
                </code>{" "}
                atau{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">
                  makan 50rb bca
                </code>
                . Mendukung Tunai, QRIS, GoPay, OVO, Dana, BCA, Mandiri, dan
                lainnya.
              </p>
            </div>

            {/* 3. Split Bill */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">Split Bill Patungan</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Makan bareng teman? Ketik{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">
                  dinner 150k split 3
                </code>{" "}
                atau{" "}
                <code className="font-mono text-zinc-700 dark:text-zinc-300">
                  taksi 80rb bagi 2
                </code>
                . Artha otomatis membagi tagihan dan hanya mencatat porsi
                pengeluaran Anda.
              </p>
            </div>

            {/* 4. Voice Note AI */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <Mic className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">
                Voice Note AI (Wit.ai)
              </h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Sedang di jalan dan malas mengetik? Kirim pesan suara berbahasa
                Indonesia ke bot Telegram. Suara Anda otomatis diubah menjadi
                teks dan dicatat ke kategori yang tepat.
              </p>
            </div>

            {/* 5. Scan Struk OCR */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <ScanLine className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">
                Scan Struk Belanja (OCR)
              </h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Unggah atau foto struk belanja minimarket dan restoran langsung
                dari Web Dashboard. Teknologi OCR mengekstrak nama merchant dan
                total tagihan secara otomatis.
              </p>
            </div>

            {/* 6. Budgeting & Alert */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
                <PiggyBank className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">
                Target Anggaran & Peringatan
              </h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Tetapkan batas anggaran bulanan per kategori. Bot akan
                memberikan peringatan otomatis saat pengeluaran Anda menyentuh
                ambang 80% (Waspada) dan 100% (Over-budget).
              </p>
            </div>

            {/* 7. Subscription Reminder & Weekly Digest */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                <CalendarClock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">
                Pengingat Langganan & Digest
              </h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Pantau tagihan rutin (Netflix, Spotify, Internet) dengan
                notifikasi otomatis H-3 dan Hari-H, ditambah laporan
                perbandingan pengeluaran mingguan setiap Senin pagi.
              </p>
            </div>

            {/* 8. Google Sheets Sync */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">
                Real-Time Google Sheets Sync
              </h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Setiap pengeluaran dari Telegram maupun Web Dashboard otomatis
                ditambahkan sebagai baris baru di Google Spreadsheet pribadi
                Anda secara real-time, lengkap dengan fitur Export CSV.
              </p>
            </div>

            {/* 9. Web Dashboard & Offline PWA */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">
                Web Dashboard & Offline PWA
              </h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Visualisasi tren bulanan, distribusi kategori & dompet, tema
                Dark/Light Mode, serta dukungan Progressive Web App (PWA) yang
                dapat di-install di HP dan diakses saat offline.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Seksi Contoh Perintah Cepat Telegram */}
      <section className="border-t border-zinc-100 py-16 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Cukup Ketik Seperti Chat Biasa
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Tidak perlu menghafal rumus rumit. Berikut contoh pesan yang
              langsung dipahami oleh{" "}
              <a
                href="https://t.me/ArthaTrackBot"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sky-600 hover:underline dark:text-sky-400"
              >
                @ArthaTrackBot
              </a>
              :
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
            {[
              {
                cmd: "kopi susu 25k gopay",
                desc: "Catat Rp 25.000 ke kategori Makanan & dompet GoPay",
              },
              {
                cmd: "2x 15rb mie ayam tunai",
                desc: "Multiplier otomatis (Rp 30.000) dengan dompet Tunai",
              },
              {
                cmd: "dinner 240k split 4 bca",
                desc: "Split bill 4 orang, catat porsi kamu Rp 60.000 (BCA)",
              },
              {
                cmd: "/sub Spotify 55.000 tgl 15",
                desc: "Aktifkan pengingat tagihan rutin setiap tanggal 15",
              },
              {
                cmd: "/rekap minggu",
                desc: "Lihat ringkasan & persentase pengeluaran 7 hari terakhir",
              },
              {
                cmd: "🎤 Voice Note (Suara)",
                desc: 'Ucapkan "beli bensin tiga puluh ribu pakai qris"',
              },
            ].map((item) => (
              <div
                key={item.cmd}
                className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60"
              >
                <code className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                  {item.cmd}
                </code>
                <p className="mt-1.5 text-zinc-500 dark:text-zinc-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="border-t border-zinc-100 py-16 text-center dark:border-zinc-800">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Mulai Kendalikan Arus Finansial Anda
          </h2>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Daftar instan menggunakan Email atau akun Google Anda, lalu
            hubungkan dengan bot Telegram dalam satu klik.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register">
              <Button
                size="lg"
                className="w-full sm:w-auto rounded-xl px-6 text-sm font-semibold"
              >
                Buat Akun Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto rounded-xl px-6 text-sm font-semibold"
              >
                Masuk ke Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400 dark:border-zinc-800">
        <p>
          © 2026 Artha v2.0 — Zero-Friction Expense & Subscription Tracker.
        </p>
      </footer>
    </div>
  );
}