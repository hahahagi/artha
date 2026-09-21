import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, DollarSign, Receipt, CreditCard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Ringkasan Finansial
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Pantau pengeluaran harian dan langganan aktif Anda secara real-time.
        </p>
      </div>

      {/* Statistik Ringkas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total Pengeluaran Bulan Ini
            </CardTitle>
            <Receipt className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 0</div>
            <p className="mt-1 text-xs text-zinc-400">
              Data akan dimuat otomatis dari Bot Telegram
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
            <div className="text-2xl font-bold">0 Layanan</div>
            <p className="mt-1 text-xs text-zinc-400">
              Pengingat H-3 sebelum jatuh tempo
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Integrasi Bot
            </CardTitle>
            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              Terhubung
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Kirim chat ke bot Telegram untuk mencatat langsung
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}