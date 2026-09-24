"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { setBudgetAction, deleteBudgetAction } from "@/app/(dashboard)/budgets/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, Plus, Trash2, Pencil, AlertTriangle, CheckCircle2, AlertOctagon } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Budget {
  id: string;
  categoryId: string | null;
  amount: number;
  category: Category | null;
}

interface BudgetsViewProps {
  categories: Category[];
  budgets: Budget[];
  spentMap: Record<string, number>;
  totalBudget: number;
  totalSpent: number;
}

export function BudgetsView({
  categories,
  budgets,
  spentMap,
  totalBudget,
  totalSpent,
}: BudgetsViewProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [loading, setLoading] = useState(false);

  const budgetCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const unbudgetedCategories = categories.filter((c) => !budgetCategoryIds.has(c.id));

  const handleOpenAdd = (catId?: string) => {
    setSelectedCategoryId(catId || unbudgetedCategories[0]?.id || "");
    setAmountStr("");
    setModalOpen(true);
  };

  const handleOpenEdit = (budget: Budget) => {
    setSelectedCategoryId(budget.categoryId || "");
    setAmountStr(budget.amount.toString());
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategoryId || !amountStr) return;

    try {
      setLoading(true);
      const amount = parseInt(amountStr.replace(/\D/g, ""), 10);
      if (isNaN(amount) || amount <= 0) return;

      await setBudgetAction(selectedCategoryId, amount);
      setModalOpen(false);
    } catch {
      alert("Gagal menyimpan anggaran.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus batas anggaran untuk kategori ini?")) return;
    try {
      setLoading(true);
      await deleteBudgetAction(id);
    } catch {
      alert("Gagal menghapus anggaran.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Anggaran Bulanan
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Atur batas pengeluaran per kategori agar arus kas Anda tetap terkendali.
          </p>
        </div>
        {unbudgetedCategories.length > 0 && (
          <Button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-2 rounded-xl text-xs font-semibold"
          >
            <Plus className="h-4 w-4" />
            Pasang Anggaran
          </Button>
        )}
      </div>

      {/* 2. Kartu Ringkasan Total */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500">
              Total Batas Anggaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(totalBudget, "IDR")}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500">
              Total Terpakai Bulan Ini
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {formatCurrency(totalSpent, "IDR")}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-zinc-500">
              Sisa Kuota Keseluruhan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-xl font-bold ${
                totalBudget - totalSpent < 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {formatCurrency(totalBudget - totalSpent, "IDR")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Daftar Anggaran per Kategori */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
          Alokasi per Kategori
        </h2>

        {budgets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
            <PiggyBank className="mx-auto h-8 w-8 text-zinc-400 mb-2" />
            <h3 className="font-semibold text-sm">Belum Ada Anggaran</h3>
            <p className="text-xs text-zinc-500 mt-1 mb-4">
              Tentukan batas belanja bulanan Anda agar bot dapat memberi peringatan saat mendekati batas.
            </p>
            {categories.length > 0 && (
              <Button size="sm" onClick={() => handleOpenAdd()} className="rounded-xl text-xs">
                Pasang Anggaran Pertama
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {budgets.map((b) => {
              const spent = spentMap[b.categoryId || ""] || 0;
              const percent = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
              const isOver = percent >= 100;
              const isWarning = percent >= 80 && percent < 100;

              return (
                <div
                  key={b.id}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                        {b.category?.name || "Kategori Umum"}
                      </h4>
                      <div className="mt-1 flex items-center gap-2">
                        {isOver ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-700 dark:bg-red-950/50 dark:text-red-400">
                            <AlertOctagon className="h-3 w-3" /> Melebihi Batas ({percent}%)
                          </span>
                        ) : isWarning ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
                            <AlertTriangle className="h-3 w-3" /> Mendekati Batas ({percent}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" /> Aman ({percent}%)
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(b)}
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(b.id)}
                        className="h-8 w-8 text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isOver
                            ? "bg-red-500"
                            : isWarning
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(percent, 100)}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                      <span>Terpakai: <b>{formatCurrency(spent, "IDR")}</b></span>
                      <span>Batas: <b>{formatCurrency(b.amount, "IDR")}</b></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Modal Pasang / Ubah Anggaran */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-base mb-4 text-zinc-900 dark:text-zinc-50">
              Pasang Batas Anggaran
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Kategori
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Batas Anggaran Bulanan (Rp)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 1.000.000"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl text-xs font-semibold"
                >
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}