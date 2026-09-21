"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  generatePairingTokenAction,
  unlinkTelegramAction,
  createCategoryAction,
  deleteCategoryAction,
} from "@/app/(dashboard)/settings/actions";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Plus,
  RefreshCw,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  keywords: string[];
}

export function SettingsView({
  isLinked,
  telegramUsername,
  telegramChatId,
  categories,
}: {
  isLinked: boolean;
  telegramUsername?: string | null;
  telegramChatId?: string | null;
  categories: Category[];
}) {
  const [pairingData, setPairingData] = useState<{
    token: string;
    deepLink: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // State Kategori Baru
  const [newCatName, setNewCatName] = useState("");
  const [newCatKeywords, setNewCatKeywords] = useState("");
  const [catLoading, setCatLoading] = useState(false);

  const handleGeneratePairing = async () => {
    try {
      setLoading(true);
      const res = await generatePairingTokenAction();
      setPairingData(res);
    } catch (err) {
      alert("Gagal membuat token pairing: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm("Putuskan tautan dengan bot Telegram ini?")) return;
    try {
      setLoading(true);
      await unlinkTelegramAction();
      setPairingData(null);
    } catch (err) {
      alert("Gagal memutuskan tautan: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!pairingData) return;
    navigator.clipboard.writeText(pairingData.deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setCatLoading(true);
      await createCategoryAction(newCatName, newCatKeywords);
      setNewCatName("");
      setNewCatKeywords("");
    } catch (err) {
      alert("Gagal menambahkan kategori: " + (err as Error).message);
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"?`)) return;
    try {
      setCatLoading(true);
      await deleteCategoryAction(id);
    } catch (err) {
      alert("Gagal menghapus kategori: " + (err as Error).message);
    } finally {
      setCatLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* 1. Integrasi Telegram */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-sky-500" />
            <CardTitle>Integrasi Bot Telegram</CardTitle>
          </div>
          <CardDescription>
            Hubungkan akun web ini dengan bot Telegram Artha agar pengeluaran yang dicatat via chat langsung tersinkronisasi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLinked ? (
            <div className="flex flex-col gap-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                    Akun Telegram Terhubung
                  </p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    {telegramUsername ? `@${telegramUsername}` : `Chat ID: ${telegramChatId}`}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleUnlink}
                disabled={loading}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400"
              >
                Putuskan Hubungan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  Akun Telegram Anda belum ditautkan ke dashboard web ini.
                </p>
              </div>

              {!pairingData ? (
                <Button onClick={handleGeneratePairing} disabled={loading} className="gap-2">
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span>Hubungkan dengan Telegram</span>
                </Button>
              ) : (
                <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Langkah Menghubungkan:
                    </h4>
                    <p className="mt-1 text-xs text-zinc-500">
                      Tautan ini hanya berlaku selama 15 menit. Klik tombol di bawah untuk membuka Telegram:
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <a
                      href={pairingData.deepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-600"
                    >
                      <Send className="h-4 w-4" />
                      <span>Buka Telegram & Hubungkan</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>

                    <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      <span>{copied ? "Link Disalin!" : "Salin Link"}</span>
                    </Button>
                  </div>

                  <div className="text-xs text-zinc-400">
                    Atau kirim command berikut secara manual di chat bot Telegram:
                    <code className="ml-1 rounded bg-zinc-200 px-2 py-0.5 font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                      /link {pairingData.token}
                    </code>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Kategori Kustom */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Pengeluaran Kustom</CardTitle>
          <CardDescription>
            Tambahkan kategori dan kata kunci tambahan agar parser bot mengenali kebiasaan belanja Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Form Tambah Kategori */}
          <form onSubmit={handleAddCategory} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                placeholder="Nama Kategori (contoh: Peliharaan)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <Input
                placeholder="Kata kunci dipisah koma (contoh: whiskas, cat food, vet)"
                value={newCatKeywords}
                onChange={(e) => setNewCatKeywords(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={catLoading} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Tambah Kategori</span>
            </Button>
          </form>

          {/* Daftar Kategori User */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Kategori Buatan Anda:
            </h4>
            {categories.length === 0 ? (
              <p className="text-xs text-zinc-400 py-2">
                Belum ada kategori kustom. Sistem menggunakan 6 kategori default bawaan Artha.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {categories.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{c.name}</p>
                      <p className="text-xs text-zinc-400">
                        Keywords: {c.keywords.length > 0 ? c.keywords.join(", ") : "Tidak ada"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}