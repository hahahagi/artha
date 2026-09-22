"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
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
  AlertCircle,
  Clock,
  CheckCircle2,
  PauseCircle,
} from "lucide-react";

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
      sub.serviceName.toLowerCase().includes(search.toLowerCase())
    );
  }, [initialSubscriptions, search]);

  // Statistik Ringkas
  const activeSubs = initialSubscriptions.filter((s) => s.isActive);
  const totalMonthly = activeSubs.reduce(
    (sum, s) => (s.currency === "IDR" ? sum + s.amount : sum),
    0
  );

  // Cari tagihan terdekat
  const upcomingSub = useMemo(() => {
    if (activeSubs.length === 0) return null;
    return [...activeSubs].sort((a, b) => {
      return getDaysUntilBilling(a.billingDay) - getDaysUntilBilling(b.billingDay);
    })[0];
  }, [activeSubs]);

  const handleSaveNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || newAmount <= 0) {
      alert("Nama layanan dan nominal wajib diisi!");
      return;
    }
    try {
      setLoading(true);
      await createSubscriptionAction({
        serviceName: newName,
        amount: newAmount,
        billingDay: Number(newDay),
      });
      setIsAddOpen(false);
      setNewName("");
      setNewAmount(0);
      setNewDay(1);
    } catch (err) {
      alert("Gagal menambahkan langganan: " + (err as Error).message);
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
    } catch (err) {
      alert("Gagal memperbarui langganan: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (sub: Subscription) => {
    try {
      setLoading(true);
      await toggleSubscriptionStatusAction(sub.id, !sub.isActive);
    } catch (err) {
      alert("Gagal mengubah status: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus langganan "${name}"?`)) return;
    try {
      setLoading(true);
      await deleteSubscriptionAction(id);
    } catch (err) {
      alert("Gagal menghapus: " + (err as Error).message);
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
              {initialSubscriptions.length - activeSubs.length} langganan sedang dijeda
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
              <div className="text-sm text-zinc-400 py-1">Tidak ada tagihan aktif</div>
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
            Catat langganan rutin seperti Netflix, Spotify, atau WiFi untuk mendapatkan pengingat sebelum perpanjangan.
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
                  !sub.isActive ? "opacity-60 bg-zinc-50/50 dark:bg-zinc-900/30" : ""
                }`}
              >
                {isDueSoon && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {sub.serviceName}
                      </CardTitle>
                      <CardDescription className="text-xs mt-0.5">
                        Tagihan tgl {sub.billingDay} setiap bulan
                      </CardDescription>
                    </div>
                    <Badge
                      variant={sub.isActive ? (isDueSoon ? "default" : "secondary") : "outline"}
                      className={`text-[10px] ${
                        !sub.isActive
                          ? "text-zinc-400"
                          : isDueSoon
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : ""
                      }`}
                    >
                      {!sub.isActive
                        ? "Dijeda"
                        : daysLeft === 0
                        ? "Hari Ini"
                        : `${daysLeft} hari lagi`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                    {formatCurrency(sub.amount, sub.currency)}
                    <span className="text-xs font-normal text-zinc-400"> /bulan</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <button
                      onClick={() => handleToggleActive(sub)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition ${
                        sub.isActive
                          ? "text-zinc-500 hover:text-amber-600"
                          : "text-emerald-600 hover:text-emerald-700"
                      }`}
                    >
                      {sub.isActive ? (
                        <>
                          <PauseCircle className="h-4 w-4" />
                          <span>Jeda</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Aktifkan</span>
                        </>
                      )}
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
                  type="number"
                  placeholder="54000"
                  value={newAmount || ""}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
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
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
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
                <label htmlFor="isActive" className="text-xs text-zinc-700 dark:text-zinc-300">
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