import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ExpenseTrendChart,
  CategoryDistributionChart,
} from "@/components/dashboard/overview-charts";
import {
  Receipt,
  CreditCard,
  ArrowUpRight,
  AlertCircle,
  CalendarClock,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { LandingView } from "@/components/landing/landing-view";

/**
 * Helper menghitung sisa hari menuju tanggal tagihan berikutnya
 */
function getDaysUntilBilling(billingDay: number): number {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let targetDate = new Date(currentYear, currentMonth, billingDay);

  // Jika tanggal tagihan bulan ini sudah lewat
  if (currentDay > billingDay) {
    targetDate = new Date(currentYear, currentMonth + 1, billingDay);
  }

  const todayStart = new Date(currentYear, currentMonth, currentDay).getTime();
  const diffTime = targetDate.getTime() - todayStart;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return <LandingView />;
  }

  // 1. Ambil data pengguna, pengeluaran, dan langganannya dari Prisma
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: {
      expenses: {
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
      subscriptions: {
        orderBy: { billingDay: "asc" },
      },
    },
  });

  const expenses = dbUser?.expenses ?? [];
  const subscriptions = dbUser?.subscriptions ?? [];
  const isTelegramLinked = Boolean(dbUser?.telegramChatId);

  // 2. Hitung total pengeluaran bulan berjalan (IDR)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const currentMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.createdAt);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  });

  const totalCurrentMonth = currentMonthExpenses.reduce(
    (sum, e) => (e.currency === "IDR" ? sum + e.amount : sum),
    0,
  );

  // 3. Agregasi Data Grafik Tren
  const dailyMap: Record<string, number> = {};
  [...expenses].reverse().forEach((e) => {
    const d = new Date(e.createdAt);
    const dateStr = d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    dailyMap[dateStr] = (dailyMap[dateStr] || 0) + e.amount;
  });

  const trendData = Object.entries(dailyMap).map(([date, amount]) => ({
    date,
    amount,
  }));

  // 4. Agregasi Data Grafik Kategori
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    const catName = e.category?.name || "Lainnya";
    categoryMap[catName] = (categoryMap[catName] || 0) + e.amount;
  });

  const categoryData = Object.entries(categoryMap).map(([name, amount]) => ({
    name,
    amount,
  }));

  // 5. Ambil 5 transaksi terbaru
  const recentExpenses = expenses.slice(0, 5);

  // 6. Urutkan langganan aktif berdasarkan jadwal jatuh tempo terdekat
  const activeSubs = subscriptions
    .filter((s) => s.isActive)
    .map((s) => ({
      ...s,
      daysLeft: getDaysUntilBilling(s.billingDay),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="space-y-6">
      {/* Header & Status Pairing */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Ringkasan Finansial
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Pantau arus kas transaksi harian dan langganan aktif Anda.
          </p>
        </div>
        {!isTelegramLinked && (
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-medium text-amber-800 transition hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Tautkan Telegram Bot</span>
          </Link>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total Pengeluaran (Bulan Ini)
            </CardTitle>
            <Receipt className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCurrentMonth, "IDR")}
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {currentMonthExpenses.length} transaksi di bulan ini
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Langganan Aktif
            </CardTitle>
            <CreditCard className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter((s) => s.isActive).length} Layanan
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Pengingat H-3 sebelum tagihan jatuh tempo
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Status Integrasi Telegram
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                isTelegramLinked
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-zinc-500"
              }`}
            >
              {isTelegramLinked ? "Terhubung" : "Belum Terhubung"}
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {isTelegramLinked
                ? "Chat bot aktif sinkron ke akun ini"
                : "Tautkan via menu Pengaturan"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Tren Pengeluaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ExpenseTrendChart data={trendData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Proporsi Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart data={categoryData} />
          </CardContent>
        </Card>
      </div>

      {/* Bottom Grid: Transaksi Terakhir & Jadwal Langganan Rutin */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kolom Kiri: Transaksi Terakhir */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Transaksi Terakhir
            </CardTitle>
            <Link
              href="/expenses"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Lihat Semua →
            </Link>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <div className="py-8 text-center text-sm text-zinc-400">
                Belum ada transaksi tercatat untuk akun ini.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {recentExpenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {exp.itemName}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {new Date(exp.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {exp.category?.name || "Lainnya"}
                      </Badge>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatCurrency(exp.amount, exp.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kolom Kanan: Jadwal Langganan Rutin */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-zinc-500" />
              <CardTitle className="text-base font-semibold">
                Jadwal Tagihan Terdekat
              </CardTitle>
            </div>
            <Link
              href="/subscriptions"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Kelola Langganan →
            </Link>
          </CardHeader>
          <CardContent>
            {activeSubs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-2" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Belum ada langganan aktif.
                </p>
                <Link
                  href="/subscriptions"
                  className="mt-2 text-xs font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
                >
                  + Tambah Langganan Baru
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {activeSubs.map((sub) => {
                  const isDueSoon = sub.daysLeft <= 3;
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {sub.serviceName}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Setiap tanggal {sub.billingDay}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant={isDueSoon ? "default" : "secondary"}
                          className={`text-xs ${
                            isDueSoon
                              ? "bg-amber-500 text-white hover:bg-amber-600"
                              : ""
                          }`}
                        >
                          {sub.daysLeft === 0
                            ? "Hari Ini"
                            : `${sub.daysLeft} hari lagi`}
                        </Badge>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(sub.amount, sub.currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}