# 💎 Artha v2.0 — Zero-Friction Expense & Subscription Tracker

<div align="center">

![Version](https://img.shields.io/badge/Release-v2.0.0-10b981?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Telegram](https://img.shields.io/badge/Telegram_Bot-API-2CA5E0?style=for-the-badge&logo=telegram)
![Google Sheets](https://img.shields.io/badge/Google_Sheets-Sync-34A853?style=for-the-badge&logo=google-sheets)
![Vitest](https://img.shields.io/badge/Vitest-101_Passing-6E9F18?style=for-the-badge&logo=vitest)
![PWA](https://img.shields.io/badge/PWA-Offline_Ready-orange?style=for-the-badge)

**Asisten keuangan pintar pencatat pengeluaran harian, split bill, dan pengingat tagihan langganan otomatis tanpa ribet.**  
_Kirim chat atau Voice Note di Telegram, scan struk belanja via OCR, dan pantau semuanya secara real-time di Web Dashboard & Google Sheets._

[🌐 Demo Website](https://arthabot.vercel.app) • [🤖 Coba Bot Telegram (@ArthaTrackBot)](https://t.me/ArthaTrackBot)

</div>

---

## 🌟 Mengapa Artha?

Kebanyakan orang gagal konsisten mencatat keuangan karena aplikasi konvensional terlalu merepotkan: harus membuka aplikasi, memilih dompet, mencari kategori, dan menekan belasan tombol hanya untuk mencatat segelas kopi.

**Artha v2.0 memangkas seluruh friksi tersebut:**

1. **Chat & Speak As You Spend:** Catat transaksi via chat teks atau **Voice Note Bahasa Indonesia (Wit.ai)** langsung di **Telegram**.
2. **Natural Language, Multi-Wallet & Split Bill:** Mengerti format lokal (`25k`, `50.000`, `2x 15rb`, `1,5jt`), mata uang asing (`$20`, `SGD`, `EUR`), deteksi dompet otomatis (`gopay`, `bca`, `qris`, `tunai`), hingga hitung patungan otomatis (`dinner 150k split 3`).
3. **Scan Struk Belanja (OCR):** Foto struk minimarket/restoran langsung dari Web Dashboard menggunakan **Tesseract.js** untuk mengekstrak nama toko dan _Grand Total_ secara instan.
4. **Target Anggaran (Budgeting) & Peringatan Otomatis:** Tetapkan batas pengeluaran bulanan per kategori dan terima peringatan otomatis saat pemakaian mencapai **80%** dan **100%**.
5. **Pengingat Langganan (H-3 & H-0) & Rekap Mingguan:** Notifikasi otomatis sebelum saldo terpotong perpanjangan langganan, ditambah laporan komparasi mingguan setiap Senin pagi.
6. **Real-Time Google Sheets Sync:** Setiap pengeluaran dari Telegram maupun Web Dashboard otomatis tercatat sebagai baris baru di Google Spreadsheet pribadi Anda.

---

## 🏛️ Arsitektur Sistem (v2.0)

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              PENGGUNA / USER                               │
└──────────────────┬──────────────────────────────────────┬──────────────────┘
                   │ (Teks / Voice Note / Inline Button)  │ (Web / PWA / OCR)
                   ▼                                      ▼
┌────────────────────────────────────┐  ┌────────────────────────────────────┐
│         Telegram Bot API           │  │       Next.js Web Dashboard        │
│  ├── Webhook Verification          │  │  ├── App Router & Server Actions   │
│  └── Wit.ai Speech-to-Text (Voice) │  │  ├── Tesseract.js Receipt OCR      │
└──────────────────┬─────────────────┘  │  └── Offline Service Worker (PWA)  │
                   │                    └─────────────────┬──────────────────┘
                   ▼                                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           Next.js 16 Backend API                           │
│  ├── /api/telegram/webhook (NLP Parser, Wallet, Split Bill, Ambiguity)     │
│  ├── /api/cron/reminders   (Daily 07:00 WIB H-3 & H-0 Subscription Cron)   │
│  ├── /api/cron/digest      (Monday 07:00 WIB Weekly Comparison Digest)     │
│  └── /api/health           (Observability & System Readiness Ping)         │
└───────────┬──────────────────────────────┬─────────────────────────┬───────┘
            │                              │                         │
            ▼                              ▼                         ▼
┌───────────────────────┐    ┌──────────────────────────┐  ┌─────────────────┐
│      Prisma ORM       │    │      Supabase Auth       │  │  Google Sheets  │
│  (PostgreSQL Client)  │    │ (Google OAuth & Email)   │  │   API v4 Sync   │
└───────────┬───────────┘    └─────────────┬────────────┘  └─────────────────┘
            └──────────────┬───────────────┘
                           ▼
          ┌──────────────────────────────────┐
          │      Supabase PostgreSQL DB      │
          │ (Users, Expenses, Subs, Budgets) │
          └──────────────────────────────────┘
```

---

## ✨ Fitur Utama Artha v2.0

### 🤖 1. Pencatatan Pintar via Telegram (`@ArthaTrackBot`)

- **Natural Language Parsing:** Mendukung gaya ketik bebas (`kopi susu 25k`, `bensin 30.000`, `tiket 1,5jt`, `2x 15k mie ayam`) dan valuta asing (`$20`, `15 sgd`, `50 eur`).
- **Smart Ambiguity Fallback:** Jika Anda mengetik angka tanggung seperti `kopi 25`, bot menampilkan tombol konfirmasi interaktif `[✅ Ya, Catat Rp 25.000]` atau `[❌ Batal]`.
- **Multi-Wallet Detection:** Otomatis mengenali metode pembayaran di dalam pesan (`Tunai`, `GoPay`, `OVO`, `Dana`, `ShopeePay`, `LinkAja`, `QRIS`, `BCA`, `Mandiri`, `BRI`, `BNI`, `CIMB`, `Jago`, `SeaBank`, `Kartu Kredit`).
- **Split Bill Otomatis:** Ketik `dinner 150k split 3` atau `taksi 80rb bagi 2`, bot otomatis membagi total tagihan dan mencatat porsi Anda saja.
- **Voice Note AI (Wit.ai):** Kirim pesan suara berbahasa Indonesia, otomatis ditranskripsi menjadi transaksi tanpa perlu mengetik.
- **Zero-Friction Inline Actions:** Setiap balasan bot dilengkapi tombol `[🏷️ Ubah Kategori]` untuk mengoreksi kategori secara instan dan `[↩️ Batalkan]` untuk menghapus transaksi.

### 📊 2. Web Dashboard Analitik & OCR

- **Autentikasi Fleksibel:** Login dengan **Google OAuth** atau daftar instan dengan **Email & Password** (dilengkapi fitur Lupa/Reset Password dan _Show/Hide Password_).
- **Scan Struk Belanja (OCR):** Ekstraksi otomatis nama toko/merchant dan total harga dari foto struk belanja menggunakan _Tesseract.js_ langsung di browser.
- **Manajemen Anggaran (Budgeting):** Buat batas anggaran bulanan per kategori atau keseluruhan, lengkap dengan _progress bar_ visual dan peringatan otomatis di Telegram saat mencapai **80%** dan **100%**.
- **Visualisasi Analitik Lengkap:** Grafik tren pengeluaran 6 bulan, diagram proporsi kategori, dan distribusi pengeluaran per metode pembayaran (Dompet).
- **Custom Pop-up Feedback UX:** Seluruh aksi (simpan, hapus, sinkronisasi, autentikasi) dilengkapi dialog konfirmasi modern dan _toast notification_ responsif.

### 🔄 3. Otomatisasi & Ekosistem Data

- **Pengingat Langganan Rutin (`/sub`):** Daftarkan langganan bulanan dan aktifkan/jeda status langganan dengan mudah. Cron Job mengirimkan pengingat otomatis pada **H-3** dan **Hari-H** pukul 07:00 WIB.
- **Weekly Auto-Digest:** Setiap Senin pukul 07:00 WIB, bot mengirimkan ringkasan pengeluaran 7 hari terakhir beserta persentase kenaikan/penurunan dibanding minggu sebelumnya dan 3 kategori terbesar.
- **Real-Time Google Sheets Sync & CSV Export:** Hubungkan ID/URL Google Spreadsheet Anda di halaman Pengaturan untuk menyinkronkan seluruh transaksi (baik dari Telegram maupun Web Dashboard) secara otomatis.
- **Offline-Ready PWA & Dark Mode:** Dilengkapi _Service Worker_ (`public/sw.js`) untuk _offline caching_ dan dukungan tema _Dark/Light Mode_.

---

## 🤖 Referensi Perintah & Format Chat Bot Telegram

| Fitur / Perintah    | Contoh Penggunaan             | Penjelasan                                                       |
| :------------------ | :---------------------------- | :--------------------------------------------------------------- |
| **Teks Bebas**      | `kopi susu 25k`               | Mencatat pengeluaran harian dan mendeteksi kategori otomatis     |
| **Multi-Wallet**    | `makan siang 35rb gopay`      | Mencatat pengeluaran sekaligus menyimpan sumber dompet (`GoPay`) |
| **Split Bill**      | `dinner 300k split 3 bca`     | Membagi tagihan 3 orang dan mencatat porsi Anda (`Rp 100.000`)   |
| **Multiplier**      | `2x 15k mie ayam`             | Mengalikan kuantitas otomatis (`Rp 30.000`)                      |
| **Mata Uang Asing** | `$20 domain` / `15 sgd makan` | Mencatat transaksi dalam mata uang non-IDR                       |
| **Voice Note 🎤**   | _(Kirim pesan suara)_         | Ucapkan _"beli bensin tiga puluh ribu pakai qris"_               |
| **`/sub`**          | `/sub Netflix 54k tgl 25`     | Mendaftarkan tagihan langganan bulanan (pengingat H-3 & H-0)     |
| **`/sub list`**     | `/sub list`                   | Menampilkan daftar langganan rutin beserta status aktif/dijeda   |
| **`/rekap`**        | `/rekap` atau `/rekap minggu` | Menampilkan total pengeluaran & persentase rincian per kategori  |
| **`/batal`**        | `/batal`                      | Membatalkan / menghapus catatan pengeluaran terakhir             |
| **`/link`**         | `/link <TOKEN>`               | Menautkan akun Telegram dengan akun Web Dashboard                |
| **`/help`**         | `/help`                       | Menampilkan panduan lengkap penggunaan bot                       |

---

## 🛠️ Tech Stack

| Layer              | Teknologi                            | Keterangan                                                                   |
| :----------------- | :----------------------------------- | :--------------------------------------------------------------------------- |
| **Framework**      | Next.js 16 (App Router)              | Fullstack React 19 dengan Server Components & Server Actions                 |
| **Language**       | TypeScript 5 (Strict)                | Type safety penuh dari skema database hingga komponen UI                     |
| **Database & ORM** | Supabase PostgreSQL + Prisma 6       | Relational database dengan _connection pooling_ & _type-safe query_          |
| **Authentication** | Supabase Auth (`@supabase/ssr`)      | Google OAuth & Email/Password Auth dengan proteksi middleware                |
| **Styling & UI**   | Tailwind CSS 4 + shadcn/ui           | Desain responsif, _Dark/Light Mode_, dan _Custom Feedback Provider_          |
| **AI & OCR**       | Wit.ai Speech API + Tesseract.js     | Transkripsi Voice Note Bahasa Indonesia & ekstraksi teks struk belanja       |
| **Integrations**   | Telegram Bot API + Google Sheets API | Webhook interaktif & sinkronisasi spreadsheet via Service Account            |
| **Automation**     | Vercel Cron + GitHub Actions         | Penjadwalan harian (07:00 WIB) untuk pengingat tagihan & rekap mingguan      |
| **Testing**        | Vitest                               | **101 unit tests** mencakup parser, OCR, wallet, split bill, voice, & sheets |

---

## 🚀 Panduan Instalasi Lokal (Local Setup)

### 1. Prasyarat

- **Node.js 20+**
- Akun **Supabase** (PostgreSQL Database & Auth)
- Bot Telegram dari **[@BotFather](https://t.me/BotFather)**
- _(Opsional)_ Server Access Token **Wit.ai** (untuk fitur Voice Note)
- _(Opsional)_ **Google Cloud Service Account** (untuk fitur Google Sheets Sync)

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

Isi variabel di dalam `.env`:

```env
# 1. Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# 2. Supabase Auth & Admin API
NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# 3. Telegram Bot
TELEGRAM_BOT_TOKEN="123456789:ABCDef..."
TELEGRAM_SECRET_TOKEN="buat_token_rahasia_webhook"

# 4. Cron Job Security
CRON_SECRET="buat_token_rahasia_cron"

# 5. Base Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 6. Wit.ai Speech-to-Text (Untuk Voice Note Telegram)
WIT_AI_TOKEN="server_access_token_wit_ai_anda"

# 7. Google Sheets API (Service Account Google Cloud Console)
GOOGLE_SERVICE_ACCOUNT_EMAIL="artha-bot@project-id.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...\n-----END PRIVATE KEY-----\n"
```

### 4. Sinkronisasi Database & Seeding

```bash
npx prisma db push
npx prisma db seed
```

### 5. Jalankan Unit Test & Server Pengembangan

```bash
# Menjalankan 101 unit test
npm test

# Menjalankan server development di http://localhost:3000
npm run dev
```

---

## 🔒 Observability (`/api/health`)

Pantau status koneksi database dan bot Telegram secara _real-time_:

```bash
curl https://arthabot.vercel.app/api/health
```

---

## 📦 Riwayat Rilis (Changelog)

- **`v2.0.0`** — _Major Release (Sprint 5–8)_:
  - Autentikasi Email/Password instan (tanpa friksi konfirmasi email), Lupa/Reset Password, & tombol _Show/Hide Password_.
  - Deteksi Multi-Wallet otomatis, Split Bill patungan, _Smart Ambiguity Fallback_, dan koreksi kategori via _Inline Keyboard_ Telegram.
  - Transkripsi _Voice Note_ Bahasa Indonesia menggunakan **Wit.ai** & fitur **Scan Struk Belanja (OCR)** menggunakan _Tesseract.js_.
  - Manajemen **Anggaran Bulanan (Budgeting)** dengan peringatan otomatis 80% & 100%, ditambah **Weekly Auto-Digest** setiap Senin pagi.
  - Integrasi penuh **Google Sheets Auto-Sync** (dari Telegram & Web Dashboard), _Custom Pop-up Feedback UX_, _Dark/Light Mode_, dan _Offline Service Worker (PWA)_.
- **`v1.0.0`** — _Initial Release (Sprint 1–4)_:
  - _Natural Language Expense Parser_, pengingat langganan `/sub` (H-3 & H-0), Google OAuth, Web Dashboard analitik, dan _Account Pairing_ Web ↔ Telegram.

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Lihat file [LICENSE](LICENSE) untuk informasi selengkapnya.