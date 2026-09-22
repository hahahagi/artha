import Link from "next/link";
import {
  Wallet,
  Send,
  ArrowRight,
  Sparkles,
  CalendarClock,
  BarChart3,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
            <span className="font-bold text-lg tracking-tight">Artha</span>
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
              Beta
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://t.me/ArthaTrackBot"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Bot Telegram</span>
            </a>
            <Link href="/login">
              <Button size="sm" className="rounded-xl px-4 text-xs font-semibold">
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
            <span>Zero-Friction Expense & Subscription Tracker</span>
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15]">
            Catat Pengeluaran Semudah{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Chatting di Telegram
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">
            Cukup kirim chat santai ke bot Telegram, Artha otomatis mengenali nominal, kategori, dan menyajikannya ke dalam dashboard analitik yang rapi.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="w-full gap-2 rounded-xl text-sm font-semibold sm:w-auto">
                <span>Mulai Sekarang — Gratis</span>
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
              <span>Coba di Telegram</span>
            </a>
          </div>

          {/* 3. Simulasi Chat Mockup */}
          <div className="mx-auto mt-14 max-w-lg rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 text-left">
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-white">
                <Send className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">Artha Telegram Bot</p>
                <p className="text-[10px] text-zinc-400">Online 24/7</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 font-sans text-xs">
              {/* Bubble Chat User */}
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-sky-500 px-3.5 py-2 text-white shadow-sm">
                  kopi susu 25k
                </div>
              </div>
              {/* Bubble Chat Bot */}
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-white p-3 shadow-sm border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">✅ Pengeluaran Dicatat!</p>
                  <p className="mt-1 text-zinc-500">☕ Kopi Susu • <b>Rp 25.000</b></p>
                  <p className="text-[10px] text-zinc-400">Kategori: Makanan & Minuman</p>
                </div>
              </div>
              {/* Bubble Chat User 2 */}
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-tr-sm bg-sky-500 px-3.5 py-2 text-white shadow-sm">
                  /sub Netflix 54k tgl 25
                </div>
              </div>
              {/* Bubble Chat Bot 2 */}
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm bg-white p-3 shadow-sm border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">✅ Langganan Terdaftar!</p>
                  <p className="mt-1 text-zinc-500">📺 Netflix • <b>Rp 54.000/bln</b> (Tgl 25)</p>
                  <p className="text-[10px] text-zinc-400">💡 Pengingat H-3 dan H-0 otomatis aktif.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Fitur Unggulan (3 Pilar) */}
      <section className="border-t border-zinc-100 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Kenapa Menggunakan Artha?
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Dirancang untuk mengatasi rasa malas mencatat keuangan harian.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Receipt className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">Natural Language Parsing</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Mendukung gaya ketik alami orang Indonesia: <code className="font-mono text-zinc-700 dark:text-zinc-300">25k</code>, <code className="font-mono text-zinc-700 dark:text-zinc-300">55.000</code>, perkalian <code className="font-mono text-zinc-700 dark:text-zinc-300">2x 15rb</code>, dan multi-mata uang asing ($20, SGD, EUR).
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                <CalendarClock className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">Subscription Reminder</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Pantau tagihan rutin bulanan (Netflix, Spotify, Internet). Bot akan otomatis mengirimkan notifikasi H-3 dan hari-H sebelum saldo Anda terpotong.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-base">Web Dashboard & PWA</h3>
              <p className="mt-2 text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
                Dashboard analitik dengan grafik tren, diagram proporsi kategori, serta tabel dengan filter dan sorting. Dapat di-install langsung di layar smartphone Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="py-16 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Mulai Kendalikan Arus Finansial Anda
          </h2>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Daftar dalam 10 detik menggunakan akun Google Anda dan sambungkan dengan bot Telegram.
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button size="lg" className="rounded-xl px-6 text-sm font-semibold">
                Masuk dengan Google
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-zinc-100 py-8 text-center text-xs text-zinc-400 dark:border-zinc-800">
        <p>© 2026 Artha — Zero-Friction Expense & Subscription Tracker.</p>
      </footer>
    </div>
  );
}