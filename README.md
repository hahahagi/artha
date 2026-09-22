# 💎 Artha — Zero-Friction Expense & Subscription Tracker

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Telegram](https://img.shields.io/badge/Telegram_Bot-API-2CA5E0?style=for-the-badge&logo=telegram)
![Vitest](https://img.shields.io/badge/Vitest-Passing-6E9F18?style=for-the-badge&logo=vitest)
![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge)

**Aplikasi pencatat keuangan harian dan pengingat tagihan langganan otomatis tanpa ribet.**  
*Cukup chat santai di Telegram, seluruh transaksi otomatis diproses ke Web Dashboard analitik.*

[Demo Website](https://arthabot.vercel.app) • [Coba Bot Telegram](https://t.me/ArthaTrackBot)

</div>

---

## 🌟 Mengapa Artha?

Kebanyakan orang malas mencatat pengeluaran karena aplikasi keuangan konvensional terlalu merepotkan: harus membuka aplikasi, memilih dompet, mencari kategori, dan menekan belasan tombol hanya untuk mencatat segelas kopi.

**Artha mengatasi friksi tersebut:**
1. **Chat As You Spend:** Catat transaksi di aplikasi yang Anda buka setiap hari: **Telegram**.
2. **Natural Language Parser:** Mengerti bahasa gaul dan format angka lokal Indonesia (`25k`, `50.000`, `2x 15rb`, `1,5jt`) serta multi-mata uang asing (`$20`, `15 usd`, `50 eur`).
3. **Smart Categorization:** Mendeteksi otomatis 6 kategori default (*Makanan*, *Transportasi*, *Belanja*, *Tagihan*, *Hiburan*, *Kesehatan*) atau kategori kustom Anda.
4. **Subscription Reminders:** Notifikasi pengingat otomatis pada **H-3** dan **hari-H** sebelum saldo kartu Anda terpotong perpanjangan langganan.
5. **Real-time Web Dashboard & PWA:** Pantau tren pengeluaran bulanan, diagram proporsi kategori, dan pasang langsung di smartphone sebagai aplikasi native.

---

## 🏛️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────┐
│                        PENGGUNA / USER                          │
└───────────────┬─────────────────────────────────┬───────────────┘
                │ (Chat Telegram)                 │ (Akses Web / PWA)
                ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│     Telegram Bot API          │ │     Next.js Web Dashboard     │
│   (Webhook Verification)      │ │   (App Router & Tailwind UI)  │
└───────────────┬───────────────┘ └───────────────┬───────────────┘
                │                                 │
                ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Next.js Backend API                        │
│  ├── /api/telegram/webhook (Parser Engine & Bot Handlers)       │
│  ├── /api/cron/reminders   (Automated H-3 & H-0 Billing Cron)   │
│  └── /api/health           (Observability & System Ping)        │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
                ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│        Prisma ORM             │ │       Supabase Auth           │
│   (Type-Safe Client Layer)    │ │   (Google OAuth Session)      │
└───────────────┬───────────────┘ └───────────────┬───────────────┘
                │                                 │
                └────────────────┬────────────────┘
                                 ▼
                ┌─────────────────────────────────┐
                │     Supabase PostgreSQL DB      │
                │  (Users, Expenses, Subs, Cats)  │
                └─────────────────────────────────┘
```

---

## ✨ Fitur Utama

- **⚡ Zero-Friction Expense Recording:**
  - Format angka fleksibel: `kopi susu 25k`, `bensin 30.000`, `2x 15k mie ayam`.
  - Multi-Mata Uang: Otomatis mendeteksi simbol mata uang dunia (`$`, `€`, `£`, `¥`, `SGD`, `USD`, `IDR`).
- **↩️ Zero-Friction Undo:**
  - Tombol interaktif `[ ↩️ Batalkan ]` langsung di bawah pesan konfirmasi Telegram.
  - Perintah teks `/batal` untuk membatalkan pengeluaran terakhir seketika.
- **📊 Ringkasan Finansial Instan (`/rekap`):**
  - `/rekap` atau `/rekap bulan`: Rekapitulasi total pengeluaran bulan berjalan dan persentase kategori.
  - `/rekap minggu`: Ringkasan transaksi dalam 7 hari terakhir.
- **⏰ Subscription Manager & Smart Reminders:**
  - Pendaftaran cepat: `/sub Netflix 54k tgl 25`
  - Cron Job ganda: Didukung oleh **Vercel Cron** (08:00 WIB) dan **GitHub Actions Fallback**.
  - Pengingat otomatis H-3 (persiapan saldo) dan H-0 (hari perpanjangan).
- **🔗 Account Pairing Web ↔ Telegram:**
  - Tautkan akun Google web dengan bot Telegram via Deep Link satu klik tanpa login berulang.
  - Otomatis memindahkan (*merge*) seluruh transaksi lama dari bot ke akun web Anda.
- **📱 Progressive Web App (PWA):**
  - Dilengkapi *Web App Manifest*, ikon vektor responsif, dan *custom install banner*.
  - Dapat diinstal di Android, iOS, dan Desktop tanpa melalui App Store.

---

## 🛠️ Tech Stack

| Layer | Teknologi | Alasan Pemilihan |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Fullstack React dengan SSR dan Server Actions yang cepat |
| **Language** | TypeScript (Strict) | Type safety penuh dari database hingga antarmuka |
| **Database** | PostgreSQL via Supabase | Relational database tangguh dengan connection pooling |
| **ORM** | Prisma | Type-safe queries, migration otomatis, dan schema deklaratif |
| **Authentication** | Supabase Auth | Google OAuth tanpa biaya dengan perlindungan middleware |
| **Styling & UI** | Tailwind CSS + shadcn/ui | Desain modern, accessible, dan konsisten (Dark/Light mode) |
| **Data Visualization** | Recharts | Visualisasi grafik tren dan diagram kategori yang interaktif |
| **Automation** | Vercel Cron + GitHub Actions | Penjadwalan harian pengingat dengan redundansi aman |
| **Testing** | Vitest | Framework unit test cepat (69 passing test suites) |

---

## 🚀 Panduan Instalasi Lokal (Local Setup)

### 1. Prasyarat
- **Node.js 20+**
- Akun **Supabase** (Database PostgreSQL & Google Auth)
- Bot Telegram dari **BotFather**

### 2. Clone Repositori & Install Dependensi
```bash
git clone https://github.com/hahahagi/artha.git
cd artha
npm install
```

### 3. Konfigurasi Environment Variables
Salin template `.env.example` ke `.env`:
```bash
cp .env.example .env
```
Lalu lengkapi variabel berikut:
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Auth
NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# Telegram Bot
TELEGRAM_BOT_TOKEN="123456789:ABCDef..."
TELEGRAM_SECRET_TOKEN="buat_token_rahasia_bebas"

# Cron Security
CRON_SECRET="buat_token_rahasia_cron"

# Base URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup & Seeding
Sinkronkan schema database dan isi kategori default:
```bash
npx prisma db push
npx prisma db seed
```

### 5. Jalankan Unit Test
```bash
npm test
```

### 6. Jalankan Server Pengembangan
```bash
npm run dev
```
Buka `http://localhost:3000` di browser Anda.

---

## 🤖 Referensi Perintah Bot Telegram

| Perintah | Contoh Penggunaan | Penjelasan |
|---|---|---|
| *Teks Bebas* | `kopi susu 25k` | Mencatat transaksi harian |
| *Perkalian* | `2x 15k mie ayam` | Mencatat dengan jumlah multiplier (Rp 30.000) |
| *Mata Uang* | `20 usd domain` | Mencatat transaksi non-IDR |
| `/sub` | `/sub Netflix 54k tgl 25` | Mendaftarkan langganan rutin bulanan |
| `/sub list` | `/sub list` | Melihat daftar langganan aktif Anda |
| `/rekap` | `/rekap` atau `/rekap minggu` | Menampilkan ringkasan total dan persentase kategori |
| `/batal` | `/batal` | Membatalkan / menghapus catatan transaksi terakhir |
| `/help` | `/help` | Menampilkan buku panduan penggunaan bot |

---

## 🔒 Pemeriksaan Kesehatan Sistem (Observability)

Endpoint `/api/health` tersedia untuk memantau status sistem secara *real-time*:
```bash
curl https://arthabot.vercel.app/api/health
```

Contoh respon:
```json
{
  "status": "healthy",
  "timestamp": "2026-09-22T04:42:00.000Z",
  "totalLatencyMs": 45,
  "uptimeSeconds": 1420,
  "services": {
    "database": {
      "status": "connected",
      "latencyMs": 28
    },
    "telegramBot": {
      "status": "connected",
      "username": "@ArthaTrackBot"
    }
  }
}
```

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT. Bebas digunakan dan dikembangkan untuk keperluan non-komersial maupun komersial.