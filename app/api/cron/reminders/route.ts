import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { formatCurrency } from "@/lib/utils/format";

export async function GET(req: NextRequest) {
  return handleCronReminders(req);
}

export async function POST(req: NextRequest) {
  return handleCronReminders(req);
}

async function handleCronReminders(req: NextRequest) {
  try {
    // 1. Validasi Keamanan Token Cron
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[Cron] Unauthorized trigger attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Hitung Tanggal Hari Ini dan H-3 dalam Zona Waktu Indonesia (WIB / UTC+7)
    const now = new Date();
    const wibNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    const todayDay = wibNow.getUTCDate();

    const wibH3 = new Date(wibNow.getTime() + 3 * 24 * 60 * 60 * 1000);
    const h3Day = wibH3.getUTCDate();

    // Batas waktu anti-duplikasi (minimal jeda 18 jam sejak notifikasi terakhir)
    const eighteenHoursAgo = new Date(now.getTime() - 18 * 60 * 60 * 1000);

    // 3. Ambil seluruh langganan aktif yang terhubung dengan akun Telegram
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        isActive: true,
        user: {
          telegramChatId: { not: null },
        },
      },
      include: {
        user: true,
      },
    });

    const notificationsSent: Array<{
      type: "H-3" | "H-0";
      service: string;
      chatId: string;
    }> = [];

    for (const sub of activeSubscriptions) {
      if (!sub.user.telegramChatId) continue;

      // Cek apakah sudah pernah dinotifikasi dalam 18 jam terakhir
      if (sub.lastNotifiedAt && sub.lastNotifiedAt > eighteenHoursAgo) {
        continue;
      }

      const chatId = sub.user.telegramChatId;
      const formattedAmount = formatCurrency(sub.amount, sub.currency);

      // KASUS 1: Jatuh tempo HARI INI (H-0)
      if (sub.billingDay === todayDay) {
        const message = `
🚨 <b>Tagihan Jatuh Tempo Hari Ini! (H-0)</b>

Langganan <b>${sub.serviceName}</b> dijadwalkan perpanjangan hari ini (Tanggal ${sub.billingDay}).

💰 <b>Biaya:</b> ${formattedAmount}
💡 <i>Setelah saldo terpotong, Anda bisa langsung mencatat pengeluaran dengan mengetik:</i>
<code>${sub.serviceName} ${sub.amount}</code>
`.trim();

        await sendTelegramMessage(chatId, message);
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { lastNotifiedAt: now },
        });

        notificationsSent.push({
          type: "H-0",
          service: sub.serviceName,
          chatId: chatId.toString(),
        });
      }
      // KASUS 2: Jatuh tempo 3 HARI LAGI (H-3)
      else if (sub.billingDay === h3Day) {
        const message = `
⏰ <b>Pengingat Langganan (H-3)</b>

Halo! Langganan <b>${sub.serviceName}</b> Anda akan jatuh tempo dalam <b>3 hari</b> (Tanggal ${sub.billingDay}).

💰 <b>Perkiraan Biaya:</b> ${formattedAmount}
💡 <i>Pastikan saldo atau limit kartu Anda mencukupi untuk perpanjangan otomatis.</i>
`.trim();

        await sendTelegramMessage(chatId, message);
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { lastNotifiedAt: now },
        });

        notificationsSent.push({
          type: "H-3",
          service: sub.serviceName,
          chatId: chatId.toString(),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      todayWibDay: todayDay,
      h3WibDay: h3Day,
      totalActiveSubs: activeSubscriptions.length,
      notifiedCount: notificationsSent.length,
      notificationsSent,
    });
  } catch (error) {
    console.error("[Cron Reminder Error]:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: (error as Error).message },
      { status: 500 }
    );
  }
}