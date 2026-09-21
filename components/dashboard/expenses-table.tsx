"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils/format";
import {
  createExpenseAction,
  updateExpenseAction,
  deleteExpenseAction,
} from "@/app/(dashboard)/expenses/actions";
import {
  Search,
  ArrowUpDown,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  Receipt,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  itemName: string;
  amount: number;
  currency: string;
  categoryId: string | null;
  category: Category | null;
  source: "TELEGRAM" | "WEB";
  createdAt: Date;
}

export function ExpensesTable({
  initialExpenses,
  categories,
}: {
  initialExpenses: Expense[];
  categories: Category[];
}) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortOption, setSortOption] = useState<
    "date-desc" | "date-asc" | "amount-desc" | "amount-asc"
  >("date-desc");

  // State Modal Edit
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editCategoryId, setEditCategoryId] = useState<string>("");

  // State Modal Tambah
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newAmount, setNewAmount] = useState<number>(0);
  const [newCategoryId, setNewCategoryId] = useState<string>("");

  const [loading, setLoading] = useState(false);

  // Filter dan Sorting
  const filteredExpenses = useMemo(() => {
    return initialExpenses
      .filter((exp) => {
        const matchesSearch = exp.itemName
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesCategory =
          selectedCategory === "ALL" ||
          (selectedCategory === "UNCLASSIFIED"
            ? !exp.categoryId
            : exp.categoryId === selectedCategory);
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortOption === "date-desc") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortOption === "date-asc") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortOption === "amount-desc") {
          return b.amount - a.amount;
        }
        if (sortOption === "amount-asc") {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [initialExpenses, search, selectedCategory, sortOption]);

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setEditItemName(exp.itemName);
    setEditAmount(exp.amount);
    setEditCategoryId(exp.categoryId || "");
  };

  const handleSaveEdit = async () => {
    if (!editingExpense || !editItemName.trim() || editAmount <= 0) return;
    try {
      setLoading(true);
      await updateExpenseAction(editingExpense.id, {
        itemName: editItemName,
        amount: editAmount,
        categoryId: editCategoryId || undefined,
      });
      setEditingExpense(null);
    } catch (err) {
      alert("Gagal memperbarui transaksi: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus catatan pengeluaran "${name}"?`)) return;
    try {
      setLoading(true);
      await deleteExpenseAction(id);
    } catch (err) {
      alert("Gagal menghapus transaksi: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNew = async () => {
    if (!newItemName.trim() || newAmount <= 0) {
      alert("Nama barang dan nominal wajib diisi!");
      return;
    }
    try {
      setLoading(true);
      await createExpenseAction({
        itemName: newItemName,
        amount: newAmount,
        categoryId: newCategoryId || undefined,
      });
      setIsAddOpen(false);
      setNewItemName("");
      setNewAmount(0);
      setNewCategoryId("");
    } catch (err) {
      alert("Gagal mencatat transaksi: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cari pengeluaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Kategori */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
            <option value="UNCLASSIFIED">Tanpa Kategori</option>
          </select>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-4 w-4 text-zinc-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200"
            >
              <option value="date-desc">Tanggal: Terbaru</option>
              <option value="date-asc">Tanggal: Terlama</option>
              <option value="amount-desc">Nominal: Terbesar</option>
              <option value="amount-asc">Nominal: Terkecil</option>
            </select>
          </div>
        </div>

        {/* Tombol Catat Transaksi Baru */}
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Pengeluaran</span>
        </Button>
      </div>

      {/* Tabel Transaksi */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Nama Pengeluaran</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Sumber</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Receipt className="h-6 w-6 text-zinc-300" />
                    <span>Tidak ada catatan pengeluaran yang cocok.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                    {new Date(exp.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="font-medium text-zinc-900 dark:text-zinc-100">
                    {exp.itemName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {exp.category?.name || "Lainnya"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        exp.source === "TELEGRAM"
                          ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
                          : "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400"
                      }`}
                    >
                      {exp.source}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                    {formatCurrency(exp.amount, exp.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenEdit(exp)}
                        className="h-8 w-8 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(exp.id, exp.itemName)}
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Tambah Transaksi */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Catat Pengeluaran Baru
              </h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Nama Item / Pengeluaran
                </label>
                <Input
                  placeholder="Contoh: Kopi Espresso, Bensin Pertamax"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Nominal (Rupiah)
                </label>
                <Input
                  type="number"
                  placeholder="25000"
                  value={newAmount || ""}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Kategori
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <option value="">-- Pilih Kategori (Opsional) --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button onClick={handleSaveNew} disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Transaksi"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Transaksi */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                Edit Pengeluaran
              </h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Nama Item
                </label>
                <Input
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Nominal (Rupiah)
                </label>
                <Input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
                  Kategori
                </label>
                <select
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
                >
                  <option value="">-- Tanpa Kategori --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingExpense(null)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button onClick={handleSaveEdit} disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}