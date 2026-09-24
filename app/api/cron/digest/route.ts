import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { formatCurrency } from "@/lib/utils/format";

export async function GET(req: NextRequest) {
  return handleWeeklyDigest(req);
}

export async function POST(req: NextRequest) {
  return handleWeeklyDigest(req);
}

async function handleWeeklyDigest(req: NextRequest) {
  try {
    // 1. Validasi Token Keamanan Cron
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.warn("[Digest Cron] Unauthorized trigger attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 2. Ambil seluruh pengguna yang akun Telegram-nya terhubung
    const users = await prisma.user.findMany({
      where: {
        telegramChatId: { not: null },
      },
      include: {
        budgets: true,
      },
    });

    const sentList: string[] = [];

    for (const user of users) {
      if (!user.telegramChatId) continue;

      // A. Ambil transaksi 7 hari terakhir
      const recentExpenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: sevenDaysAgo },
        },
        include: { category: true },
      });

      // Abaikan jika user sama sekali tidak ada transaksi dalam 7 hari terakhir
      if (recentExpenses.length === 0) continue;

      // B. Ambil transaksi 7 hari sebelumnya (untuk pembanding)
      const prevExpenses = await prisma.expense.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo },
        },
      });

      const recentTotal = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
      const prevTotal = prevExpenses.reduce((sum, e) => sum + e.amount, 0);

      // C. Hitung persentase tren naik/turun
      let trendText = "";
      if (prevTotal > 0) {
        const diffPercent = Math.round(((recentTotal - prevTotal) / prevTotal) * 100);
        if (diffPercent > 0) {
          trendText = `📈 <i>Naik ${diffPercent}% dibanding minggu sebelumnya</i>`;
        } else if (diffPercent < 0) {
          trendText = `📉 <i>Turun ${Math.abs(diffPercent)}% (Lebih hemat dari minggu lalu! 🎉)</i>`;
        } else {
          trendText = `⚖️ <i>Sama persis dengan minggu sebelumnya</i>`;
        }
      } else {
        trendText = `ℹ️ <i>Minggu sebelumnya belum ada data tercatat</i>`;
      }

      // D. Hitung 3 Kategori Pengeluaran Terbesar
      const categoryMap: Record<string, number> = {};
      for (const e of recentExpenses) {
        const catName = e.category?.name || "Lainnya";
        categoryMap[catName] = (categoryMap[catName] || 0) + e.amount;
      }

      const topCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, amount], idx) => {
          const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉";
          return `${medal} <b>${name}:</b> ${formatCurrency(amount, "IDR")}`;
        })
        .join("\n");

      // E. Cek Alokasi Anggaran Bulanan (jika dipasang)
      let budgetText = "";
      const totalBudget = user.budgets.reduce((sum, b) => sum + b.amount, 0);
      if (totalBudget > 0) {
        const monthAgg = await prisma.expense.aggregate({
          where: {
            userId: user.id,
            createdAt: { gte: startOfMonth },
          },
          _sum: { amount: true },
        });

        const monthTotal = monthAgg._sum.amount ?? 0;
        const remaining = totalBudget - monthTotal;
        const percentUsed = Math.round((monthTotal / totalBudget) * 100);

        budgetText = `\n\n🎯 <b>Status Anggaran Bulan Ini:</b>\n` +
          `• Terpakai: <b>${formatCurrency(monthTotal, "IDR")}</b> (${percentUsed}%)\n` +
          `• Sisa Kuota: <b>${formatCurrency(remaining, "IDR")}</b>`;
      }

      // F. Susun Pesan Ringkasan Cerdas
      const message = `
📊 <b>Smart Weekly Digest Artha</b>
📅 <i>Ringkasan Pengeluaran 7 Hari Terakhir</i>

💰 <b>Total Belanja:</b> ${formatCurrency(recentTotal, "IDR")}
${trendText}

<b>Rincian Kategori Terbanyak:</b>
${topCategories}
${budgetText}

💡 <i>Semoga awal minggumu menyenangkan dan arus kas tetap terjaga!</i>
`.trim();

      await sendTelegramMessage(user.telegramChatId, message);
      sentList.push(user.telegramChatId.toString());
    }

    return NextResponse.json({
      ok: true,
      timestamp: now.toISOString(),
      digestsSent: sentList.length,
      recipients: sentList,
    });
  } catch (error) {
    console.error("[Weekly Digest Error]:", error);
    return NextResponse.json(
      { error: "Gagal memproses digest mingguan." },
      { status: 500 }
    );
  }
}