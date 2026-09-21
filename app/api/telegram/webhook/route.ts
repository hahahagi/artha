import { NextRequest, NextResponse } from "next/server";
import { validateTelegramWebhook } from "@/lib/telegram/validate";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { TELEGRAM_MESSAGES } from "@/lib/telegram/messages";
import { prisma } from "@/lib/prisma";

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

    // Abaikan jika bukan pesan teks (misal: bot joined channel, photo, dll)
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const username = message.from?.username || message.from?.first_name || "User";

    // 3. Tangani Command /start
    if (text === "/start") {
      try {
        // Simpan / update user di database PostgreSQL via Prisma
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

    // Catatan: Pemrosesan pesan pengeluaran biasa ("kopi 25k")
    // akan kita hubungkan di Task 10.
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Webhook Error]:", error);
    // Penting: Selalu return 200 OK ke Telegram agar Telegram tidak
    // melakukan retry loop terus-menerus saat ada error internal aplikasi.
    return NextResponse.json({ ok: true });
  }
}