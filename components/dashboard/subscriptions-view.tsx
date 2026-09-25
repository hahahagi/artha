"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  formatCurrency,
  formatThousandInput,
  parseThousandInput,
} from "@/lib/utils/format";
import {
  createSubscriptionAction,
  updateSubscriptionAction,
  toggleSubscriptionStatusAction,
  deleteSubscriptionAction,
} from "@/app/(dashboard)/subscriptions/actions";
import {
  CalendarClock,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CreditCard,
  Clock,
  CheckCircle2,
  PauseCircle,
} from "lucide-react";
import { useFeedback } from "@/components/ui/feedback-provider";

interface Subscription {
  id: string;
  serviceName: string;
  amount: number;
  currency: string;
  billingDay: number;
  isActive: boolean;
  lastNotifiedAt: Date | null;
  createdAt: Date;
}

/**
 * Helper menghitung sisa hari menuju tanggal tagihan berikutnya
 */
function getDaysUntilBilling(billingDay: number): number {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  let targetDate = new Date(currentYear, currentMonth, billingDay);

  // Jika tanggal tagihan bulan ini sudah terlewat
  if (currentDay > billingDay) {
    targetDate = new Date(currentYear, currentMonth + 1, billingDay);
  }

  const todayStart = new Date(currentYear, currentMonth, currentDay).getTime();
  const diffTime = targetDate.getTime() - todayStart;
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function SubscriptionsView({
  initialSubscriptions,
}: {
  initialSubscriptions: Subscription[];
}) {
  const { showToast, confirmAction } = useFeedback();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal Tambah
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newDay, setNewDay] = useState<number>(1);

  // Modal Edit
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editDay, setEditDay] = useState<number>(1);
  const [editActive, setEditActive] = useState(true);

  // Filter Langganan
  const filteredSubs = useMemo(() => {
    return initialSubscriptions.filter((sub) =>
      sub.serviceName.toLowerCase().includes(search.toLowerCase()),
    );
  }, [initialSubscriptions, search]);

  // Statistik Ringkas
  const activeSubs = useMemo(() => {
    return initialSubscriptions.filter((s) => s.isActive);
  }, [initialSubscriptions]);
  const totalMonthly = activeSubs.reduce(
    (sum, s) => (s.currency === "IDR" ? sum + s.amount : sum),
    0,
  );

  // Cari tagihan terdekat
  const upcomingSub = useMemo(() => {
    if (activeSubs.length === 0) return null;
    return [...activeSubs].sort((a, b) => {
      return (
        getDaysUntilBilling(a.billingDay) - getDaysUntilBilling(b.billingDay)
      );
    })[0];
  }, [activeSubs]);

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newAmount <= 0) {
      showToast({
        variant: "warning",
        title: "Data belum lengkap",
        description: "Nama layanan dan biaya bulanan wajib diisi!",
      });
      return;
    }
    try {
      setLoading(true);
      await createSubscriptionAction({
        serviceName: newName,
        amount: newAmount,
        billingDay: Number(newDay),
      });
      const savedName = newName;
      setIsAddOpen(false);
      setNewName("");
      setNewAmount(0);
      setNewDay(1);
      showToast({
        variant: "success",
        title: "Langganan ditambahkan!",
        description: `${savedName} berhasil didaftarkan.`,
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gagal menambahkan langganan",
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setEditName(sub.serviceName);
    setEditAmount(sub.amount);
    setEditDay(sub.billingDay);
    setEditActive(sub.isActive);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub || !editName.trim() || editAmount <= 0) return;
    try {
      setLoading(true);
      await updateSubscriptionAction(editingSub.id, {
        serviceName: editName,
        amount: editAmount,
        billingDay: Number(editDay),
        isActive: editActive,
      });
      setEditingSub(null);
      showToast({
        variant: "success",
        title: "Langganan diperbarui",
        description: `Perubahan pada ${editName} telah disimpan.`,
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gagal memperbarui langganan",
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (sub: Subscription) => {
    const nextState = !sub.isActive;
    try {
      setLoading(true);
      await toggleSubscriptionStatusAction(sub.id, nextState);
      showToast({
        variant: nextState ? "success" : "info",
        title: nextState ? "Langganan diaktifkan" : "Langganan dijeda",
        description: nextState
          ? `Pengingat tagihan ${sub.serviceName} diaktifkan kembali.`
          : `Pengingat tagihan ${sub.serviceName} dijeda sementara.`,
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gagal mengubah status",
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await confirmAction({
      title: "Hapus Langganan?",
      description: `Langganan "${name}" akan dihapus dari daftar pengingat Anda.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      setLoading(true);
      await deleteSubscriptionAction(id);
      showToast({
        variant: "success",
        title: "Langganan dihapus",
        description: `${name} telah dihapus dari daftar langganan.`,
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gagal menghapus langganan",
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Total Tagihan Rutin (Bulan Ini)
            </CardTitle>
            <CreditCard className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalMonthly, "IDR")}
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              Dari {activeSubs.length} langganan aktif
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Status Langganan
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSubs.length}{" "}
              <span className="text-sm font-normal text-zinc-400">
                / {initialSubscriptions.length} Layanan
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {initialSubscriptions.length - activeSubs.length} langganan sedang
              dijeda
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">
              Tagihan Terdekat
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {upcomingSub ? (
              <div>
                <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {upcomingSub.serviceName}
                </div>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  {getDaysUntilBilling(upcomingSub.billingDay) === 0
                    ? "Jatuh tempo hari ini!"
                    : `${getDaysUntilBilling(upcomingSub.billingDay)} hari lagi (Tgl ${upcomingSub.billingDay})`}
                </p>
              </div>
            ) : (
              <div className="text-sm text-zinc-400 py-1">
                Tidak ada tagihan aktif
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 2. Action Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Cari langganan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Langganan</span>
        </Button>
      </div>

      {/* 3. Grid Kartu Langganan */}
      {filteredSubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 py-12 text-center dark:border-zinc-800">
          <CalendarClock className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mb-2" />
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Belum ada langganan terdaftar
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mt-1 mb-4">
            Catat langganan rutin seperti Netflix, Spotify, atau WiFi untuk
            mendapatkan pengingat sebelum perpanjangan.
          </p>
          <Button onClick={() => setIsAddOpen(true)} size="sm">
            Tambah Langganan Pertama
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubs.map((sub) => {
            const daysLeft = getDaysUntilBilling(sub.billingDay);
            const isDueSoon = sub.isActive && daysLeft <= 3;

            return (
              <Card
                key={sub.id}
                className={`relative overflow-hidden transition hover:shadow-md ${
                  !sub.isActive
                    ? "border-dashed bg-zinc-50/70 dark:bg-zinc-900/40"
                    : ""
                }`}
              >
                {/* Top Status Accent Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    !sub.isActive
                      ? "bg-zinc-300 dark:bg-zinc-700"
                      : isDueSoon
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                />

                <CardHeader className="pb-3 pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle
                        className={`truncate text-base font-bold ${
                          sub.isActive
                            ? "text-zinc-900 dark:text-zinc-100"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {sub.serviceName}
                      </CardTitle>
                      <CardDescription className="mt-0.5 text-xs">
                        {sub.isActive
                          ? `Tagihan tgl ${sub.billingDay} setiap bulan`
                          : `Tagihan tgl ${sub.billingDay} (Pengingat nonaktif)`}
                      </CardDescription>
                    </div>

                    {/* Indikator Status Eksplisit */}
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {sub.isActive ? (
                        <>
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Aktif
                          </span>
                          <Badge
                            variant={isDueSoon ? "default" : "secondary"}
                            className={`text-[10px] ${
                              isDueSoon
                                ? "bg-amber-500 text-white hover:bg-amber-600"
                                : ""
                            }`}
                          >
                            {daysLeft === 0
                              ? "Hari Ini"
                              : `${daysLeft} hari lagi`}
                          </Badge>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                          <PauseCircle className="h-3 w-3" />
                          Dijeda
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div
                    className={`text-xl font-bold ${
                      sub.isActive
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-400 dark:text-zinc-500"
                    }`}
                  >
                    {formatCurrency(sub.amount, sub.currency)}
                    <span className="text-xs font-normal text-zinc-400">
                      {" "}
                      /bulan
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    {/* Interactive Toggle Switch Status */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={sub.isActive}
                      disabled={loading}
                      onClick={() => handleToggleActive(sub)}
                      className="group flex items-center gap-2.5 text-left focus:outline-none disabled:opacity-50"
                    >
                      <div
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
                          sub.isActive
                            ? "bg-emerald-600 group-hover:bg-emerald-500 dark:bg-emerald-500"
                            : "bg-zinc-300 group-hover:bg-zinc-400 dark:bg-zinc-700 dark:group-hover:bg-zinc-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition-transform duration-200 ${
                            sub.isActive ? "translate-x-4" : "translate-x-1"
                          }`}
                        />
                      </div>
                      <div className="flex flex-col">
                        <span
                          className={`text-xs font-semibold leading-tight ${
                            sub.isActive
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          {sub.isActive ? "Status: Aktif" : "Status: Dijeda"}
                        </span>
                        <span className="text-[10px] text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
                          {sub.isActive
                            ? "Klik untuk menjeda"
                            : "Klik untuk aktifkan"}
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(sub)}
                        className="h-8 w-8 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(sub.id, sub.serviceName)}
                        className="h-8 w-8 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Tambah Langganan */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Tambah Langganan Baru
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveNew} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Nama Layanan
                </label>
                <Input
                  placeholder="Contoh: Netflix, Spotify, Indihome"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Biaya Bulanan (Rupiah)
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 54.000"
                  value={formatThousandInput(newAmount)}
                  onChange={(e) =>
                    setNewAmount(parseThousandInput(e.target.value))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Tanggal Tagihan Setiap Bulan (1 - 31)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={newDay}
                  onChange={(e) => setNewDay(Number(e.target.value))}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Langganan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Langganan */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Edit Langganan
              </h3>
              <button
                onClick={() => setEditingSub(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Nama Layanan
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Biaya Bulanan (Rupiah)
                </label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 54.000"
                  value={formatThousandInput(editAmount)}
                  onChange={(e) =>
                    setEditAmount(parseThousandInput(e.target.value))
                  }
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Tanggal Tagihan Setiap Bulan (1 - 31)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={31}
                  value={editDay}
                  onChange={(e) => setEditDay(Number(e.target.value))}
                  required
                />
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                <label
                  htmlFor="isActive"
                  className="text-xs text-zinc-700 dark:text-zinc-300"
                >
                  Langganan Aktif (kirimkan reminder sebelum jatuh tempo)
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingSub(null)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
