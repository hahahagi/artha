import { NextRequest, NextResponse } from "next/server";
import { validateTelegramWebhook } from "@/lib/telegram/validate";
import { TELEGRAM_MESSAGES } from "@/lib/telegram/messages";
import { parseExpenseText } from "@/lib/parser/expense-parser";
import { categorizeExpense } from "@/lib/parser/categorizer";
import { formatCurrency } from "@/lib/utils/format";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/utils/rate-limit";
import { parseSubscriptionText } from "@/lib/parser/subscription-parser";
import {
  sendTelegramMessage,
  answerCallbackQuery,
  editTelegramMessageText,
  editTelegramMessageReplyMarkup,
} from "@/lib/telegram/bot";

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

    // 3. Tangani Callback Query (Tombol Inline [↩️ Batalkan])
    if (body.callback_query) {
      const cq = body.callback_query;
      const cqId = cq.id;
      const data = cq.data as string;
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;

      if (data && data.startsWith("undo_")) {
        const expenseId = data.replace("undo_", "");

        try {
          const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
          });

          if (expense) {
            await prisma.expense.delete({
              where: { id: expenseId },
            });

            await answerCallbackQuery(cqId, "Transaksi berhasil dibatalkan!");

            if (chatId && messageId) {
              await editTelegramMessageText(
                chatId,
                messageId,
                `🗑️ <i>Transaksi <b>${expense.itemName}</b> (${formatCurrency(expense.amount, expense.currency)}) telah dibatalkan.</i>`,
              );
            }
          } else {
            await answerCallbackQuery(cqId, "Transaksi sudah tidak ditemukan.");
          }
        } catch (err) {
          console.error("[Callback Undo Error]:", err);
          await answerCallbackQuery(cqId, "Gagal membatalkan transaksi.");
        }
      }

      // 3.1. Handler Klik Tombol [🏷️ Ubah Kategori]
      if (data && data.startsWith("pickcat_")) {
        const expenseId = data.replace("pickcat_", "");

        try {
          const expense = await prisma.expense.findUnique({
            where: { id: expenseId },
            include: { user: true },
          });

          if (!expense) {
            await answerCallbackQuery(cqId, "Transaksi tidak ditemukan.");
            return NextResponse.json({ ok: true });
          }

          // Ambil seluruh kategori milik pengguna
          const categories = await prisma.category.findMany({
            where: { userId: expense.userId },
            orderBy: { name: "asc" },
          });

          if (categories.length === 0) {
            await answerCallbackQuery(cqId, "Belum ada kategori tersedia.");
            return NextResponse.json({ ok: true });
          }

          // Susun tombol inline 2 kolom
          const inline_keyboard: Array<
            Array<{ text: string; callback_data: string }>
          > = [];
          for (let i = 0; i < categories.length; i += 2) {
            const row = [
              {
                text: categories[i].name,
                callback_data: `c_${expenseId}_${categories[i].id}`,
              },
            ];
            if (categories[i + 1]) {
              row.push({
                text: categories[i + 1].name,
                callback_data: `c_${expenseId}_${categories[i + 1].id}`,
              });
            }
            inline_keyboard.push(row);
          }

          // Tambahkan tombol batal / selesai di baris terakhir
          inline_keyboard.push([
            {
              text: "⬅️ Batal Ubah",
              callback_data: `closecat_${expenseId}`,
            },
          ]);

          await answerCallbackQuery(cqId);

          if (chatId && messageId) {
            await editTelegramMessageReplyMarkup(chatId, messageId, {
              inline_keyboard,
            });
          }
        } catch (err) {
          console.error("[Callback Pick Category Error]:", err);
          await answerCallbackQuery(cqId, "Gagal memuat kategori.");
        }

        return NextResponse.json({ ok: true });
      }

      // 3.2. Handler Pemilihan Kategori Baru
      if (data && data.startsWith("c_")) {
        const [, expenseId, categoryId] = data.split("_");

        try {
          const updatedExpense = await prisma.expense.update({
            where: { id: expenseId },
            data: { categoryId },
            include: { category: true },
          });

          await answerCallbackQuery(
            cqId,
            `Kategori diubah ke ${updatedExpense.category?.name || "Lainnya"}!`,
          );

          if (chatId && messageId) {
            const formattedAmount = formatCurrency(
              updatedExpense.amount,
              updatedExpense.currency,
            );
            const newConfirmationMsg = TELEGRAM_MESSAGES.expenseRecorded({
              itemName: updatedExpense.itemName,
              amountFormatted: formattedAmount,
              categoryName: updatedExpense.category?.name ?? "Lainnya",
            });

            // Kembalikan tombol awal
            await editTelegramMessageText(
              chatId,
              messageId,
              newConfirmationMsg,
              {
                reply_markup: {
                  inline_keyboard: [
                    [
                      {
                        text: "🏷️ Ubah Kategori",
                        callback_data: `pickcat_${expenseId}`,
                      },
                      {
                        text: "↩️ Batalkan",
                        callback_data: `undo_${expenseId}`,
                      },
                    ],
                  ],
                },
              },
            );
          }
        } catch (err) {
          console.error("[Callback Set Category Error]:", err);
          await answerCallbackQuery(cqId, "Gagal mengubah kategori.");
        }

        return NextResponse.json({ ok: true });
      }

      // 3.3. Handler Tombol [⬅️ Batal Ubah]
      if (data && data.startsWith("closecat_")) {
        const expenseId = data.replace("closecat_", "");
        await answerCallbackQuery(cqId);

        if (chatId && messageId) {
          // Kembalikan ke tombol awal
          await editTelegramMessageReplyMarkup(chatId, messageId, {
            inline_keyboard: [
              [
                {
                  text: "🏷️ Ubah Kategori",
                  callback_data: `pickcat_${expenseId}`,
                },
                {
                  text: "↩️ Batalkan",
                  callback_data: `undo_${expenseId}`,
                },
              ],
            ],
          });
        }

        return NextResponse.json({ ok: true });
      }

      return NextResponse.json({ ok: true });
    }

    const message = body.message;

    // Abaikan jika bukan pesan teks
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text = message.text.trim();
    const username =
      message.from?.username || message.from?.first_name || "User";

    // Rate Limiting: Batasi maksimal 20 pesan per menit per user
    if (isRateLimited(`telegram:${chatId}`, 20, 60_000)) {
      console.warn(`[Webhook] Rate limit exceeded for chat: ${chatId}`);
      await sendTelegramMessage(
        chatId,
        "⏳ <b>Terlalu banyak pesan.</b> Mohon tunggu sebentar sebelum mengirim pesan lagi.",
      );
      return NextResponse.json({ ok: true });
    }

    // 4. Tangani Pairing Akun Web <-> Telegram (/start link_TOKEN atau /link TOKEN)
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
        const existingTelegramUser = await prisma.user.findUnique({
          where: { telegramChatId: BigInt(chatId) },
        });

        if (existingTelegramUser && existingTelegramUser.id !== webUser.id) {
          await prisma.expense.updateMany({
            where: { userId: existingTelegramUser.id },
            data: { userId: webUser.id },
          });

          await prisma.user.delete({
            where: { id: existingTelegramUser.id },
          });
        }

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

    // 5. Tangani Command /start Biasa
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

    // 6. Tangani Command /help
    if (text === "/help") {
      await sendTelegramMessage(chatId, TELEGRAM_MESSAGES.help());
      return NextResponse.json({ ok: true });
    }

    // 7. Tangani Command /sub (Manajemen Langganan Rutin)
    if (text === "/sub" || text.startsWith("/sub ") || text === "/subs") {
      const subArgs = text.replace(/^\/subs?\s*/i, "").trim();

      // Kasus A: Panduan penggunaan /sub
      if (!subArgs || subArgs === "help") {
        const helpText = `
📋 <b>Panduan Langganan Rutin (/sub)</b>

Gunakan format:
<code>/sub &lt;Nama Layanan&gt; &lt;Nominal&gt; tgl &lt;1-31&gt;</code>

<b>Contoh:</b>
• <code>/sub Netflix 54k tgl 15</code>
• <code>/sub Spotify 55.000 tgl 25</code>
• <code>/sub iCloud 15rb tgl 5</code>
• <code>/sub ChatGPT 20 usd tgl 1</code>

Ketik <b>/sub list</b> untuk melihat daftar langganan aktif Anda.
`.trim();
        await sendTelegramMessage(chatId, helpText);
        return NextResponse.json({ ok: true });
      }

      // Pastikan user ada di database
      const user = await prisma.user.upsert({
        where: { telegramChatId: BigInt(chatId) },
        update: { telegramUsername: username },
        create: {
          telegramChatId: BigInt(chatId),
          telegramUsername: username,
        },
      });

      // Kasus B: Menampilkan daftar langganan aktif (/sub list)
      if (subArgs === "list") {
        const subs = await prisma.subscription.findMany({
          where: { userId: user.id },
          orderBy: { billingDay: "asc" },
        });

        if (subs.length === 0) {
          await sendTelegramMessage(
            chatId,
            "📭 <b>Belum ada langganan terdaftar.</b>\nKetik contoh: <code>/sub Netflix 54k tgl 15</code>",
          );
          return NextResponse.json({ ok: true });
        }

        const listText = subs
          .map((s) => {
            const statusIcon = s.isActive ? "🟢" : "⚪ (Dijeda)";
            return `• <b>${s.serviceName}</b>: ${formatCurrency(s.amount, s.currency)} (Setiap tgl ${s.billingDay}) ${statusIcon}`;
          })
          .join("\n");

        await sendTelegramMessage(
          chatId,
          `📋 <b>Daftar Langganan Rutin Anda:</b>\n\n${listText}`,
        );
        return NextResponse.json({ ok: true });
      }

      // Kasus C: Mendaftarkan Langganan Baru
      const parsedSub = parseSubscriptionText(subArgs);

      if (!parsedSub) {
        await sendTelegramMessage(
          chatId,
          "⚠️ <b>Format tidak dikenali.</b>\nPastikan menyertakan nama layanan, nominal, dan tanggal tagihan.\nContoh: <code>/sub Netflix 54k tgl 15</code>",
        );
        return NextResponse.json({ ok: true });
      }

      try {
        await prisma.subscription.upsert({
          where: {
            userId_serviceName: {
              userId: user.id,
              serviceName: parsedSub.serviceName,
            },
          },
          update: {
            amount: parsedSub.amount,
            currency: parsedSub.currency,
            billingDay: parsedSub.billingDay,
            isActive: true,
          },
          create: {
            userId: user.id,
            serviceName: parsedSub.serviceName,
            amount: parsedSub.amount,
            currency: parsedSub.currency,
            billingDay: parsedSub.billingDay,
            isActive: true,
          },
        });

        const confirmMsg = `
✅ <b>Langganan Berhasil Dicatat!</b>

📺 <b>Layanan:</b> ${parsedSub.serviceName}
💰 <b>Biaya:</b> ${formatCurrency(parsedSub.amount, parsedSub.currency)} /bulan
📅 <b>Jatuh Tempo:</b> Tanggal ${parsedSub.billingDay} setiap bulan

💡 <i>Artha akan mengirimkan pengingat otomatis pada H-3 dan hari-H sebelum tanggal perpanjangan.</i>
`.trim();

        await sendTelegramMessage(chatId, confirmMsg);
      } catch (err) {
        console.error("[Webhook /sub Error]:", err);
        await sendTelegramMessage(
          chatId,
          "⚠️ Gagal mencatat langganan ke database. Silakan coba lagi.",
        );
      }

      return NextResponse.json({ ok: true });
    }

    // 8. Tangani Command /rekap (Ringkasan Pengeluaran)
    if (text === "/rekap" || text.startsWith("/rekap ")) {
      const rekapArg = text
        .replace(/^\/rekap\s*/i, "")
        .trim()
        .toLowerCase();

      const user = await prisma.user.upsert({
        where: { telegramChatId: BigInt(chatId) },
        update: { telegramUsername: username },
        create: {
          telegramChatId: BigInt(chatId),
          telegramUsername: username,
        },
      });

      const now = new Date();
      let startDate: Date;
      let periodName: string;

      if (rekapArg === "minggu" || rekapArg === "mingguan") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        periodName = "7 Hari Terakhir";
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        periodName = now.toLocaleDateString("id-ID", {
          month: "long",
          year: "numeric",
        });
      }

      const expenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: startDate },
        },
        include: { category: true },
        orderBy: { createdAt: "desc" },
      });

      if (expenses.length === 0) {
        await sendTelegramMessage(
          chatId,
          TELEGRAM_MESSAGES.rekapEmpty(periodName),
        );
        return NextResponse.json({ ok: true });
      }

      const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

      const categoryMap: Record<string, number> = {};
      for (const e of expenses) {
        const catName = e.category?.name || "Lainnya";
        categoryMap[catName] = (categoryMap[catName] || 0) + e.amount;
      }

      const breakdown = Object.entries(categoryMap)
        .map(([catName, amount]) => ({
          name: catName,
          amountFormatted: formatCurrency(amount, "IDR"),
          percent:
            totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0,
        }))
        .sort((a, b) => b.percent - a.percent);

      const msg = TELEGRAM_MESSAGES.rekapSummary({
        periodName,
        totalFormatted: formatCurrency(totalAmount, "IDR"),
        count: expenses.length,
        breakdown,
      });

      await sendTelegramMessage(chatId, msg);
      return NextResponse.json({ ok: true });
    }

    // 9. Tangani Command /batal (Membatalkan Transaksi Terakhir)
    if (text === "/batal" || text.startsWith("/batal")) {
      const user = await prisma.user.findUnique({
        where: { telegramChatId: BigInt(chatId) },
      });

      if (!user) {
        await sendTelegramMessage(chatId, TELEGRAM_MESSAGES.batalNotFound());
        return NextResponse.json({ ok: true });
      }

      const lastExpense = await prisma.expense.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (!lastExpense) {
        await sendTelegramMessage(chatId, TELEGRAM_MESSAGES.batalNotFound());
        return NextResponse.json({ ok: true });
      }

      await prisma.expense.delete({
        where: { id: lastExpense.id },
      });

      const formatted = formatCurrency(
        lastExpense.amount,
        lastExpense.currency,
      );
      await sendTelegramMessage(
        chatId,
        TELEGRAM_MESSAGES.batalSuccess(lastExpense.itemName, formatted),
      );

      return NextResponse.json({ ok: true });
    }

    // 10. Tangani Perintah yang tidak dikenali (jika diawali '/')
    if (text.startsWith("/")) {
      await sendTelegramMessage(
        chatId,
        "⚠️ Perintah tidak dikenali. Ketik <b>/help</b> untuk melihat panduan yang tersedia.",
      );
      return NextResponse.json({ ok: true });
    }

    // 11. Alur Pencatatan Pengeluaran (Expense Recording Flow)
    const parsed = parseExpenseText(text);

    if (!parsed) {
      await sendTelegramMessage(chatId, TELEGRAM_MESSAGES.parseFailed());
      return NextResponse.json({ ok: true });
    }

    try {
      const user = await prisma.user.upsert({
        where: { telegramChatId: BigInt(chatId) },
        update: { telegramUsername: username },
        create: {
          telegramChatId: BigInt(chatId),
          telegramUsername: username,
        },
      });

      const detectedCategory = categorizeExpense(parsed.itemName);
      const categoryDisplayName = detectedCategory ?? "Lainnya";

      let categoryId: string | null = null;
      if (detectedCategory) {
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

      const createdExpense = await prisma.expense.create({
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

      const amountFormatted = formatCurrency(parsed.amount, parsed.currency);
      const confirmationMsg = TELEGRAM_MESSAGES.expenseRecorded({
        itemName: parsed.itemName,
        amountFormatted,
        categoryName: categoryDisplayName,
      });

      // Kirim konfirmasi dengan tombol inline [↩️ Batalkan]
      // Kirim konfirmasi dengan tombol inline [🏷️ Ubah Kategori] & [↩️ Batalkan]
      await sendTelegramMessage(chatId, confirmationMsg, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🏷️ Ubah Kategori",
                callback_data: `pickcat_${createdExpense.id}`,
              },
              {
                text: "↩️ Batalkan",
                callback_data: `undo_${createdExpense.id}`,
              },
            ],
          ],
        },
      });
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
