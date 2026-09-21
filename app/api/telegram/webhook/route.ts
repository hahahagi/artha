import { NextRequest, NextResponse } from "next/server";
import { validateTelegramWebhook } from "@/lib/telegram/validate";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { TELEGRAM_MESSAGES } from "@/lib/telegram/messages";
import { parseExpenseText } from "@/lib/parser/expense-parser";
import { categorizeExpense } from "@/lib/parser/categorizer";
import { formatCurrency } from "@/lib/utils/format";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/utils/rate-limit";

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi keamanan webhook via header
    const secretHeader = req.headers.get("x-telegram-bot-api-secret-token");
    if (!validateTelegramWebhook(secretHeader)) {
      console.warn("[Webhook] Unauthorized: secret token mismatch");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Baca payload update dari Telegram
    const body = await req.json();
    const message = body.message;

    // Abaikan jika bukan pesan teks
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const username = message.from?.username || message.from?.first_name || "User";

    // Rate Limiting: Batasi maksimal 20 pesan per menit per user
    if (isRateLimited(`telegram:${chatId}`, 20, 60_000)) {
      console.warn(`[Webhook] Rate limit exceeded for chat: ${chatId}`);
      await sendTelegramMessage(
        chatId,
        "⏳ <b>Terlalu banyak pesan.</b> Mohon tunggu sebentar sebelum mengirim pesan lagi.",
      );
      return NextResponse.json({ ok: true });
    }

    // Tangani Pairing Akun Web <-> Telegram (/start link_TOKEN atau /link TOKEN)
    const isStartLink = text.startsWith("/start link_");
    const isDirectLink = text.startsWith("/link ");

    if (isStartLink || isDirectLink) {
      const token = isStartLink
        ? text.replace("/start link_", "").trim()
        : text.replace("/link ", "").trim();

      if (!token) {
        await sendTelegramMessage(
          chatId,
          "⚠️ Token pairing tidak boleh kosong. Gunakan link dari web atau ketik <code>/link TOKEN</code>.",
        );
        return NextResponse.json({ ok: true });
      }

      // Cari user di web yang memiliki linkToken aktif
      const webUser = await prisma.user.findFirst({
        where: {
          linkToken: token,
          linkTokenExpiry: { gte: new Date() },
        },
      });

      if (!webUser) {
        await sendTelegramMessage(
          chatId,
          "❌ <b>Token tidak valid atau sudah kedaluwarsa.</b>\nSilakan buat tautan baru di halaman Pengaturan dashboard web.",
        );
        return NextResponse.json({ ok: true });
      }

      try {
        // Cek apakah ada temporary user lain yang pernah terbuat dengan chatId ini
        const existingTelegramUser = await prisma.user.findUnique({
          where: { telegramChatId: BigInt(chatId) },
        });

        if (existingTelegramUser && existingTelegramUser.id !== webUser.id) {
          // Pindahkan seluruh riwayat transaksi dari bot ke akun web
          await prisma.expense.updateMany({
            where: { userId: existingTelegramUser.id },
            data: { userId: webUser.id },
          });

          // Hapus akun sementara bot
          await prisma.user.delete({
            where: { id: existingTelegramUser.id },
          });
        }

        // Tautkan telegramChatId ke akun webUser
        await prisma.user.update({
          where: { id: webUser.id },
          data: {
            telegramChatId: BigInt(chatId),
            telegramUsername: username,
            linkToken: null,
            linkTokenExpiry: null,
          },
        });

        await sendTelegramMessage(
          chatId,
          `🎉 <b>Akun Berhasil Dihubungkan!</b>\n\nAkun Telegram Anda resmi terhubung dengan akun web <b>${webUser.email}</b>.\nSetiap pengeluaran yang dicatat di sini otomatis muncul di dashboard web!`,
        );
      } catch (linkError) {
        console.error("[Webhook Pairing Error]:", linkError);
        await sendTelegramMessage(
          chatId,
          "⚠️ Terjadi kendala saat menghubungkan akun. Silakan coba lagi.",
        );
      }

      return NextResponse.json({ ok: true });
    }

    // 3. Tangani Command /start
    if (text === "/start") {
      try {
        await prisma.user.upsert({
          where: { telegramChatId: BigInt(chatId) },
          update: { telegramUsername: username },
          create: {
            telegramChatId: BigInt(chatId),
            telegramUsername: username,
          },
        });
      } catch (dbError) {
        console.error("[Webhook] Gagal mencatat user ke DB:", dbError);
      }

      await sendTelegramMessage(chatId, TELEGRAM_MESSAGES.welcome(username));
      return NextResponse.json({ ok: true });
    }

    // 4. Tangani Command /help
    if (text === "/help") {
      await sendTelegramMessage(chatId, TELEGRAM_MESSAGES.help());
      return NextResponse.json({ ok: true });
    }

    // 5. Tangani Perintah yang tidak dikenali (jika diawali '/')
    if (text.startsWith("/")) {
      await sendTelegramMessage(
        chatId,
        "⚠️ Perintah tidak dikenali. Ketik <b>/help</b> untuk melihat panduan yang tersedia.",
      );
      return NextResponse.json({ ok: true });
    }

    // 6. Alur Pencatatan Pengeluaran (Expense Recording Flow)
    const parsed = parseExpenseText(text);

    if (!parsed) {
      // Teks bukan command dan tidak terbaca sebagai pengeluaran yang valid
      await sendTelegramMessage(chatId, TELEGRAM_MESSAGES.parseFailed());
      return NextResponse.json({ ok: true });
    }

    try {
      // Pastikan user ada di DB
      const user = await prisma.user.upsert({
        where: { telegramChatId: BigInt(chatId) },
        update: { telegramUsername: username },
        create: {
          telegramChatId: BigInt(chatId),
          telegramUsername: username,
        },
      });

      // Deteksi kategori pengeluaran
      const detectedCategory = categorizeExpense(parsed.itemName);
      const categoryDisplayName = detectedCategory ?? "Lainnya";

      let categoryId: string | null = null;
      if (detectedCategory) {
        // Cari atau buat kategori untuk user ini
        const category = await prisma.category.upsert({
          where: {
            userId_name: {
              userId: user.id,
              name: detectedCategory,
            },
          },
          update: {},
          create: {
            userId: user.id,
            name: detectedCategory,
            keywords: [],
          },
        });
        categoryId = category.id;
      }

      // Simpan catatan transaksi pengeluaran
      await prisma.expense.create({
        data: {
          userId: user.id,
          itemName: parsed.itemName,
          amount: parsed.amount,
          currency: parsed.currency,
          categoryId,
          rawText: text,
          source: "TELEGRAM",
        },
      });

      // Kirim notifikasi konfirmasi sukses ke chat Telegram
      const amountFormatted = formatCurrency(parsed.amount, parsed.currency);
      await sendTelegramMessage(
        chatId,
        TELEGRAM_MESSAGES.expenseRecorded({
          itemName: parsed.itemName,
          amountFormatted,
          categoryName: categoryDisplayName,
        }),
      );
    } catch (dbError) {
      console.error("[Webhook] Gagal menyimpan transaksi ke DB:", dbError);
      await sendTelegramMessage(
        chatId,
        "⚠️ Terjadi gangguan saat menyimpan data. Silakan coba lagi sebentar lagi.",
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook Error]:", error);
    return NextResponse.json({ ok: true });
  }
}
