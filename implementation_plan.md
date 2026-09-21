# Artha — Zero-Friction Expense & Subscription Tracker (Improved Plan)

## Ringkasan Perubahan dari Plan Asli

Plan asli sudah solid untuk MVP. Berikut area-area yang di-improve:

### Apa yang Sudah Bagus (Dipertahankan)
- ✅ Next.js App Router + Prisma + Supabase — stack yang tepat
- ✅ Telegram bot sebagai input utama — UX friction rendah
- ✅ Parser bahasa Indonesia — differentiator kuat
- ✅ Skema database — sudah normalized dan masuk akal
- ✅ Alur pairing web ↔ Telegram — well-thought

### Apa yang Di-Improve

| Area | Plan Asli | Improved |
|------|-----------|----------|
| **Deployment** | Asumsi Vercel (bisa kena limit) | Strategi 100% gratis eksplisit dengan fallback |
| **Cron Job** | Vercel Cron (1/hari di free tier) | Vercel Cron cukup, tapi ada fallback via GitHub Actions |
| **Parser** | Hanya regex sederhana | Tambah edge case: format titik ribuan `25.000`, negatif, multi-item |
| **Error Handling** | Tidak disebutkan | Error handling & logging strategy |
| **Testing** | Hanya disebut "tulis unit test" | Testing strategy eksplisit dengan Vitest |
| **Commit Strategy** | Tidak ada | Conventional Commits + branch per sprint |
| **Security** | Minimal | Rate limiting, input sanitization, webhook validation |
| **Monitoring** | Tidak ada | Basic health check & error alerting via Telegram |
| **Mobile UX** | Tidak disebutkan | PWA-ready, responsive-first dashboard |
| **CI/CD** | Tidak ada | GitHub Actions untuk lint, test, preview deploy |

---

## 1. Strategi Deployment 100% Gratis

> [!IMPORTANT]
> Semua layanan di bawah ini gratis tanpa kartu kredit, cukup untuk ratusan user aktif.

| Komponen | Layanan | Free Tier |
|----------|---------|-----------|
| **Hosting & API** | Vercel (Hobby) | 100GB bandwidth, Serverless Functions, Edge |
| **Database** | Supabase (Free) | PostgreSQL 500MB, 50k rows/bulan auth |
| **Bot Hosting** | Sama (Next.js API route di Vercel) | Webhook mode, no polling |
| **Cron** | Vercel Cron | 1 cron job/hari (cukup untuk reminder harian) |
| **Cron Fallback** | GitHub Actions | 2000 menit/bulan (cadangan jika Vercel limit) |
| **Domain** | Vercel subdomain (`artha.vercel.app`) | Gratis |
| **Monitoring** | Vercel Analytics (built-in) + Telegram self-alert | Gratis |
| **Version Control** | GitHub (Public/Private) | Unlimited |

### Kapan Perlu Upgrade?
- Database > 500MB → Upgrade Supabase ($25/bln) atau migrasi ke Neon (free tier 3GB)
- Traffic > 100GB/bln → Upgrade Vercel atau pindah ke Cloudflare Pages (unlimited bandwidth)

---

## 2. Struktur Folder (Improved)

Perubahan dari plan asli:
- Tambah `__tests__/` untuk testing structure
- Tambah `lib/utils/` untuk shared utilities
- Tambah `lib/telegram/validate.ts` untuk webhook security
- Tambah `types/` untuk shared TypeScript types
- Tambah `.github/workflows/` untuk CI/CD

```text
artha/
├── .github/
│   └── workflows/
│       ├── ci.yml                        # Lint + test on PR
│       └── cron-fallback.yml             # Fallback reminder via GitHub Actions
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx                    # Sidebar, header, session guard
│   │   ├── page.tsx                      # Dashboard overview
│   │   ├── expenses/page.tsx             # Tabel transaksi
│   │   ├── subscriptions/page.tsx        # Kartu langganan
│   │   └── settings/page.tsx             # Pairing & kategori
│   ├── api/
│   │   ├── telegram/
│   │   │   └── webhook/route.ts
│   │   ├── cron/
│   │   │   └── reminders/route.ts
│   │   └── health/route.ts               # [NEW] Health check endpoint
│   ├── layout.tsx                        # Root layout
│   ├── manifest.ts                       # [NEW] PWA manifest
│   └── globals.css
├── components/
│   ├── ui/                               # Shadcn/ui components
│   ├── dashboard/                        # Dashboard-specific components
│   └── telegram/                         # Pairing UI components
├── lib/
│   ├── parser/
│   │   ├── expense-parser.ts
│   │   ├── categorizer.ts
│   │   └── __tests__/                    # [NEW] Co-located tests
│   │       ├── expense-parser.test.ts
│   │       └── categorizer.test.ts
│   ├── telegram/
│   │   ├── bot.ts
│   │   ├── messages.ts
│   │   └── validate.ts                   # [NEW] Webhook signature validation
│   ├── prisma.ts
│   └── utils/                            # [NEW]
│       ├── format.ts                     # Format Rupiah, tanggal, dll
│       └── rate-limit.ts                 # Simple in-memory rate limiter
├── types/
│   └── index.ts                          # Shared TypeScript interfaces
├── prisma/
│   └── schema.prisma
├── vercel.json
├── vitest.config.ts                      # [NEW]
└── .env.example                          # [NEW] Dokumentasi env vars
```

---

## 3. Perbaikan Parser (`expense-parser.ts`)

### Edge cases yang belum di-handle plan asli:

| Input | Expected | Plan Asli | Improved |
|-------|----------|-----------|----------|
| `kopi 25.000` | 25000 | ❌ Parsed as 25.0 | ✅ Deteksi format titik ribuan |
| `25.000 kopi` | 25000 | ❌ Sama | ✅ Handle angka di depan |
| `makan 2x 15k` | 30000 | ❌ Tidak support | ✅ Deteksi multiplier `2x` |
| `$50 lunch` | 50 USD | ❌ Tidak support | ✅ Deteksi currency prefix |
| `lunch 50 usd` | 50 USD | ❌ Tidak support | ✅ Deteksi currency suffix |
| `bensin 50rb, parkir 5k` | 2 entries | ❌ Hanya 1 | ⚠️ Fase 2 (multi-item) |
| ` kopi  25k ` | 25000 | ✅ Trim | ✅ Trim |

### Improved parser (perubahan utama):

```typescript
export interface ParsedExpense {
  itemName: string;
  amount: number;
  currency: string; // [NEW] "IDR", "USD", "EUR", etc.
}

// Currency detection map
const CURRENCY_MAP: Record<string, string> = {
  // Symbols
  "$": "USD", "€": "EUR", "£": "GBP", "¥": "JPY",
  "rp": "IDR",
  // Keywords
  "usd": "USD", "eur": "EUR", "euro": "EUR",
  "gbp": "GBP", "jpy": "JPY", "sgd": "SGD",
  "myr": "MYR", "idr": "IDR",
};

export function parseExpenseText(
  text: string,
  defaultCurrency = "IDR"
): ParsedExpense | null {
  const cleanText = text.trim();

  // Pola yang di-improve:
  // 1. Handle format titik ribuan Indonesia: 25.000 → 25000
  // 2. Handle "Rp" prefix: Rp25.000, Rp 25k
  // 3. Handle angka di depan ATAU di belakang item name
  // 4. Handle multiplier: 2x 15k = 30000

  // Step 1: Cek multiplier pattern "2x 15k makan" atau "makan 2x15k"
  const multiplierMatch = cleanText.match(/(\d+)\s*x\s*/i);
  const qty = multiplierMatch ? parseInt(multiplierMatch[1]) : 1;

  const textWithoutQty = multiplierMatch
    ? cleanText.replace(multiplierMatch[0], "")
    : cleanText;

  // Step 2: Match nominal — titik sebagai pemisah ribuan jika diikuti 3 digit
  const pattern = /(?:rp\.?\s*)?(\d{1,3}(?:\.\d{3})*|\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta)?/i;
  const match = textWithoutQty.match(pattern);

  if (!match) return null;

  // Step 3: Parse angka — handle titik ribuan vs desimal
  let rawStr = match[1];
  const hasDotThousands = /^\d{1,3}(\.\d{3})+$/.test(rawStr);
  if (hasDotThousands) {
    rawStr = rawStr.replace(/\./g, ""); // 25.000 → 25000
  } else {
    rawStr = rawStr.replace(",", "."); // 25,5 → 25.5
  }
  const rawNum = parseFloat(rawStr);

  const unit = match[2]?.toLowerCase();
  let multiplier = 1;
  if (unit === "k" || unit === "rb" || unit === "ribu") multiplier = 1_000;
  if (unit === "jt" || unit === "juta") multiplier = 1_000_000;

  const amount = Math.round(rawNum * multiplier * qty);

  // Step 4: Detect currency dari prefix/suffix
  const currencyPattern = /(\$|€|£|¥|rp\.?|usd|eur|euro|gbp|jpy|sgd|myr|idr)\b/i;
  const currencyMatch = cleanText.match(currencyPattern);
  const currency = currencyMatch
    ? CURRENCY_MAP[currencyMatch[1].toLowerCase().replace(".", "")] ?? defaultCurrency
    : defaultCurrency;

  // Step 5: Ambil item name
  const itemName = textWithoutQty
    .replace(match[0], "")
    .replace(currencyPattern, "")   // Hapus currency indicator dari item name
    .replace(/^\s*[-–—]\s*/, "")    // Hapus dash separator
    .trim();

  if (!itemName || isNaN(amount) || amount <= 0) return null;

  return { itemName, amount, currency };
}
```

---

## 4. Perbaikan Database Schema

### Perubahan dari plan asli:
- Tambah `@@map` untuk table naming yang konsisten
- Tambah `updatedAt` pada model yang mutable
- Tambah `source` enum pada Expense (untuk track asal input)
- Tambah `currency` field (future-proof tapi nullable)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ExpenseSource {
  TELEGRAM
  WEB
}

model User {
  id               String         @id @default(cuid())
  email            String?        @unique
  telegramChatId   BigInt?        @unique
  telegramUsername  String?
  linkToken        String?        @unique
  linkTokenExpiry  DateTime?      // [NEW] Token expiry time
  defaultCurrency  String         @default("IDR") // [NEW] Multi-currency
  createdAt        DateTime       @default(now())
  updatedAt        DateTime       @updatedAt      // [NEW]

  expenses         Expense[]
  subscriptions    Subscription[]
  categories       Category[]

  @@map("users")
}

model Category {
  id        String    @id @default(cuid())
  userId    String?
  name      String
  keywords  String[]
  user      User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expenses  Expense[]

  @@unique([userId, name])  // [NEW] Prevent duplicate category names per user
  @@map("categories")
}

model Expense {
  id          String        @id @default(cuid())
  userId      String
  amount      Int
  itemName    String
  categoryId  String?
  rawText     String
  currency    String        @default("IDR")      // [NEW] Multi-currency
  source      ExpenseSource @default(TELEGRAM)  // [NEW] Track input source
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt           // [NEW]

  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  category    Category?     @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
  @@map("expenses")
}

model Subscription {
  id             String    @id @default(cuid())
  userId         String
  serviceName    String
  amount         Int
  currency       String    @default("IDR")       // [NEW] Multi-currency
  billingDay     Int       // 1-31
  isActive       Boolean   @default(true)
  lastNotifiedAt DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt              // [NEW]

  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, serviceName])  // [NEW] Prevent duplicate subscription
  @@index([userId, isActive])
  @@map("subscriptions")
}
```

---

## 5. Security Improvements

### 5a. Telegram Webhook Validation (tidak ada di plan asli)

```typescript
// lib/telegram/validate.ts
import crypto from "crypto";

export function validateTelegramWebhook(
  body: string,
  secretToken: string,
  headerToken: string | null
): boolean {
  // Telegram mengirim X-Telegram-Bot-Api-Secret-Token header
  return headerToken === secretToken;
}
```

### 5b. Rate Limiting (tidak ada di plan asli)

```typescript
// lib/utils/rate-limit.ts
const requests = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(
  key: string,
  maxRequests = 30,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const record = requests.get(key);

  if (!record || now > record.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  record.count++;
  return record.count > maxRequests;
}
```

---

## 6. CI/CD Pipeline (tidak ada di plan asli)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

```yaml
# .github/workflows/cron-fallback.yml
# Fallback jika Vercel Cron bermasalah
name: Reminder Cron Fallback

on:
  schedule:
    - cron: "0 1 * * *" # 08:00 WIB
  workflow_dispatch: # Manual trigger

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X POST "${{ secrets.APP_URL }}/api/cron/reminders" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

---

## 7. Commit Strategy & Git Workflow

> [!IMPORTANT]
> Setiap bagian pekerjaan akan terekam dengan rapi lewat **Conventional Commits** dan **branch per sprint**.

### Branch Strategy

```
main (production)
  └── dev (development)
       ├── sprint-1/core-bot
       ├── sprint-2/web-dashboard
       ├── sprint-3/subscriptions
       └── sprint-4/polish
```

### Commit Convention

Format: `<type>(<scope>): <description>`

| Type | Kapan Dipakai |
|------|---------------|
| `feat` | Fitur baru |
| `fix` | Bug fix |
| `test` | Tambah/ubah test |
| `docs` | Dokumentasi |
| `chore` | Config, dependencies |
| `refactor` | Refactor tanpa ubah behavior |
| `style` | Formatting, semicolons, dll |

### Contoh Commit History Sprint 1

```
chore(init): setup next.js project with typescript
chore(db): add prisma schema and supabase config
feat(parser): implement indonesian expense text parser
test(parser): add unit tests for expense parser edge cases
feat(telegram): implement webhook endpoint for incoming messages
feat(telegram): add expense recording flow with confirmation
feat(telegram): implement /start command with user creation
chore(deploy): configure vercel deployment and webhook URL
docs: update README with setup instructions
```

### Setiap Sprint = 1 Pull Request ke `dev`

- PR berisi deskripsi lengkap apa yang dikerjakan
- Checklist tasks yang completed
- Screenshot/recording jika ada UI changes
- Setelah semua sprint selesai, merge `dev` → `main`

---

## 8. Roadmap Implementasi (Improved)

### Sprint 1: Core Bot & Parsing Engine
**Branch:** `sprint-1/core-bot`
**Target:** Bot Telegram bisa terima dan catat pengeluaran

| # | Task | Verify | Commit |
|---|------|--------|--------|
| 1 | Init Next.js + TypeScript + Tailwind + Prisma | `npm run build` passes | `chore(init): setup project` |
| 2 | Setup Supabase project & configure env vars | DB connection OK | `chore(db): configure supabase` |
| 3 | Tulis Prisma schema, generate client, push ke DB | `npx prisma db push` OK | `feat(db): add prisma schema` |
| 4 | Implement `expense-parser.ts` | — | `feat(parser): implement parser` |
| 5 | Add multi-currency detection to parser | `$50 lunch` → USD | `feat(parser): add currency detection` |
| 6 | Tulis unit tests parser (min 20 test cases incl. currency) | `npm test` all green | `test(parser): add parser tests` |
| 7 | Implement `categorizer.ts` + tests | Tests pass | `feat(parser): add categorizer` |
| 8 | Setup Telegram bot via BotFather (`@ArthaTrackBot`) | Bot responds to /start | `chore(telegram): setup bot` |
| 9 | Implement webhook route + validation | POST returns 200 | `feat(telegram): add webhook` |
| 10 | Implement expense recording flow | Kirim "kopi 25k" → konfirmasi | `feat(telegram): expense flow` |
| 11 | Add rate limiting pada webhook | Spam blocked | `feat(security): add rate limit` |
| 12 | Deploy ke Vercel, set webhook URL | End-to-end test via Telegram | `chore(deploy): initial deploy` |

---

### Sprint 2: Web Dashboard & Auth
**Branch:** `sprint-2/web-dashboard`
**Target:** Data dari bot terlihat di web dashboard

| # | Task | Verify | Commit |
|---|------|--------|--------|
| 1 | Setup Supabase Auth (Google OAuth) | Login flow works | `feat(auth): setup google oauth` |
| 2 | Buat auth middleware & session guard | Unauthorized redirected | `feat(auth): add middleware` |
| 3 | Install shadcn/ui + setup komponen dasar | Components render | `chore(ui): setup shadcn` |
| 4 | Implement dashboard layout (sidebar + header) | Layout responsive | `feat(dashboard): add layout` |
| 5 | Implement overview page (total, chart, kategori) | Data dari DB tampil | `feat(dashboard): overview page` |
| 6 | Implement expenses table (filter, sort, edit, delete) | CRUD works | `feat(expenses): transaction table` |
| 7 | Implement pairing flow (token generate + deep link) | Web ↔ Telegram linked | `feat(settings): account pairing` |
| 8 | Add PWA manifest + responsive meta | Installable di mobile | `feat(pwa): add manifest` |

---

### Sprint 3: Subscriptions & Reminder
**Branch:** `sprint-3/subscriptions`
**Target:** User bisa kelola langganan, reminder otomatis jalan

| # | Task | Verify | Commit |
|---|------|--------|--------|
| 1 | Implement halaman CRUD subscriptions di web | Add/edit/delete works | `feat(subs): subscription page` |
| 2 | Implement `/sub` command di Telegram | `/sub Netflix 54k tgl 15` works | `feat(telegram): sub command` |
| 3 | Implement cron reminder route | H-3 dan H-0 notif terkirim | `feat(cron): reminder endpoint` |
| 4 | Configure `vercel.json` cron | Cron terpicu otomatis | `chore(cron): vercel config` |
| 5 | Setup GitHub Actions cron fallback | Manual trigger works | `chore(ci): cron fallback` |
| 6 | Add subscription cards di dashboard | Cards tampil dengan countdown | `feat(dashboard): sub cards` |

---

### Sprint 4: Polish & Zero-Friction UX
**Branch:** `sprint-4/polish`
**Target:** UX halus, command lengkap, siap dipakai orang lain

| # | Task | Verify | Commit |
|---|------|--------|--------|
| 1 | Implement `/rekap` command (mingguan/bulanan) | Summary terkirim di chat | `feat(telegram): rekap command` |
| 2 | Implement `/batal` command + inline undo | Last expense deleted | `feat(telegram): undo command` |
| 3 | Seed default categories + keywords | Auto-categorization works | `feat(parser): default categories` |
| 4 | Add health check endpoint + self-alert | `/api/health` returns OK | `feat(ops): health check` |
| 5 | Setup CI pipeline (lint + test + build) | PR checks green | `chore(ci): setup github actions` |
| 6 | Write README + setup guide | — | `docs: comprehensive readme` |
| 7 | Final QA: end-to-end testing semua flow | Semua flow OK | `chore: final qa pass` |

---

## 9. Environment Variables

```bash
# .env.example — dokumentasi semua env vars yang dibutuhkan

# Supabase
DATABASE_URL="postgresql://..."        # Pooled connection (untuk Prisma)
DIRECT_URL="postgresql://..."          # Direct connection (untuk migrations)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."     # Server-side only

# Telegram
TELEGRAM_BOT_TOKEN="123456:ABC..."
TELEGRAM_SECRET_TOKEN="random-secret"  # Untuk webhook validation

# Cron
CRON_SECRET="random-cron-secret"       # Untuk proteksi cron endpoint

# App
NEXT_PUBLIC_APP_URL="https://artha.vercel.app"
```

---

## 10. Tech Stack Final

| Layer | Technology | Alasan |
|-------|-----------|--------|
| Framework | Next.js 14 (App Router) | SSR + API routes dalam satu deploy |
| Language | TypeScript (strict) | Type safety, DX, maintainability |
| Styling | Tailwind CSS + shadcn/ui | Rapid UI, konsisten, accessible |
| Database | PostgreSQL (Supabase) | Relational, free tier generous |
| ORM | Prisma | Type-safe queries, migration tooling |
| Auth | Supabase Auth | Google OAuth gratis, session management |
| Charts | Recharts | Lightweight, React-native charting |
| Testing | Vitest | Fast, ESM-first, compatible with Next.js |
| Bot | Telegram Bot API (webhook) | No server needed, gratis unlimited |
| Deploy | Vercel (Hobby) | Zero-config Next.js deploy, free |
| CI/CD | GitHub Actions | Free 2000 min/bulan |
| Linting | ESLint + Prettier | Code consistency |

---

## Verification Plan

### Automated Tests
- `npm run test` — Vitest unit tests (parser, categorizer, rate limiter)
- `npm run lint` — ESLint checks
- `npm run build` — TypeScript compilation + Next.js build
- CI akan jalan otomatis di setiap PR via GitHub Actions

### Manual Verification
- **Sprint 1:** Kirim pesan ke bot Telegram → cek DB ada record baru
- **Sprint 2:** Login web → dashboard menampilkan data dari bot
- **Sprint 3:** Cron trigger → notifikasi Telegram terkirim
- **Sprint 4:** End-to-end semua command + web flow

### Commit Traceability
- Setiap sprint punya branch sendiri
- Setiap task punya commit message deskriptif
- PR per sprint dengan checklist
- `git log --oneline` harus bisa dibaca seperti changelog

---

## Decisions (Resolved)

| # | Question | Decision |
|---|----------|----------|
| 1 | Nama bot Telegram | `@ArthaTrackBot` |
| 2 | Multi-currency | ✅ Ya — support multi-currency (lihat dampak di bawah) |
| 3 | Data retention | Ditunda, tidak perlu diimplementasi sekarang |
| 4 | Repo visibility | **Private** — GitHub free tier unlimited untuk private repo |

### Dampak Multi-Currency pada Implementasi

> [!IMPORTANT]
> Multi-currency menambah scope di beberapa area. Pendekatan: **IDR sebagai default**, currency lain opt-in per transaksi.

**Schema:**
- Tambah `currency` field (default `"IDR"`) pada `Expense` dan `Subscription`
- Tambah `defaultCurrency` pada `User` (default `"IDR"`)

**Parser:**
- Detect prefix: `$50`, `€30`, `¥1000`
- Detect suffix/keyword: `50 usd`, `30 euro`
- Jika tidak ada indikator currency → gunakan `defaultCurrency` user

**Dashboard:**
- Tampilkan simbol currency per transaksi
- Group by currency pada summary (jangan campur IDR + USD)
- Format angka sesuai locale currency

**Fase implementasi:** Multi-currency parser + schema di **Sprint 1**, UI grouping di **Sprint 2**.
