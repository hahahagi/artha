const TELEGRAM_API_BASE = "https://api.telegram.org";

export interface SendMessageOptions {
  parse_mode?: "HTML" | "Markdown" | "MarkdownV2";
  reply_markup?: unknown;
}

/**
 * Mengirim pesan teks ke chat Telegram tertentu.
 */
export async function sendTelegramMessage(
  chatId: number | string | bigint,
  text: string,
  options?: SendMessageOptions
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN belum diset di environment variable.");
  }

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: typeof chatId === "bigint" ? chatId.toString() : chatId,
      text,
      parse_mode: options?.parse_mode ?? "HTML",
      reply_markup: options?.reply_markup,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.ok) {
    console.error("Telegram API Error:", data);
    throw new Error(
      `Gagal mengirim pesan Telegram: ${data.description || "Unknown error"}`
    );
  }

  return data;
}

/**
 * Memverifikasi bot token dan mengambil info bot.
 */
export async function getBotMe() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN belum diset di environment variable.");
  }

  const response = await fetch(`${TELEGRAM_API_BASE}/bot${token}/getMe`);
  return await response.json();
}

/**
 * Merespons tombol interaktif Telegram (menghilangkan loading icon pada tombol)
 */
export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`${TELEGRAM_API_BASE}/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id: callbackQueryId,
      text,
    }),
  });
}

/**
 * Mengubah isi pesan teks Telegram yang sudah terkirim sebelumnya
 */
export async function editTelegramMessageText(
  chatId: number | string | bigint,
  messageId: number,
  text: string
) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`${TELEGRAM_API_BASE}/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: typeof chatId === "bigint" ? chatId.toString() : chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
    }),
  });
}