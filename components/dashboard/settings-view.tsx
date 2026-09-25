"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  generatePairingTokenAction,
  unlinkTelegramAction,
  createCategoryAction,
  deleteCategoryAction,
  updateGoogleSheetsConfigAction,
  syncGoogleSheetsAction,
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
  Table as TableIcon,
  Mic,
} from "lucide-react";
import { useFeedback } from "@/components/ui/feedback-provider";

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
  googleSheetId = null,
  googleSheetAutoSync = false,
  serviceAccountEmail = null,
  witAiConfigured = false,
}: {
  isLinked: boolean;
  telegramUsername?: string | null;
  telegramChatId?: string | null;
  categories: Category[];
  googleSheetId?: string | null;
  googleSheetAutoSync?: boolean;
  serviceAccountEmail?: string | null;
  witAiConfigured?: boolean;
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

  const [sheetId, setSheetId] = useState(googleSheetId || "");
  const [autoSync, setAutoSync] = useState(googleSheetAutoSync);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const { showToast, confirmAction } = useFeedback();

  const handleGeneratePairing = async () => {
    try {
      setLoading(true);
      const res = await generatePairingTokenAction();
      setPairingData(res);
      showToast({
        variant: "info",
        title: "Token pairing dibuat",
        description: "Silakan klik tombol Buka Telegram untuk menautkan akun.",
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gagal membuat token pairing",
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    const confirmed = await confirmAction({
      title: "Putuskan Hubungan Telegram?",
      description:
        "Anda tidak dapat mencatat pengeluaran via Telegram sampai menautkan ulang akun ini.",
      confirmText: "Ya, Putuskan",
      cancelText: "Batal",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      setLoading(true);
      await unlinkTelegramAction();
      setPairingData(null);
      showToast({
        variant: "info",
        title: "Tautan Telegram diputuskan",
        description: "Akun Telegram Anda telah dilepas dari dashboard ini.",
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gagal memutuskan tautan",
        description: (err as Error).message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!pairingData) return;
    navigator.clipboard.writeText(pairingData.deepLink);
    setCopied(true);
    showToast({
      variant: "success",
      title: "Tautan disalin!",
      description: "Link pairing Telegram berhasil disalin ke clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      setCatLoading(true);
      await createCategoryAction(newCatName, newCatKeywords);
      const addedName = newCatName;
      setNewCatName("");
      setNewCatKeywords("");
      showToast({
        variant: "success",
        title: "Kategori ditambahkan",
        description: `Kategori "${addedName}" berhasil dibuat.`,
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gagal menambahkan kategori",
        description: (err as Error).message,
      });
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const confirmed = await confirmAction({
      title: "Hapus Kategori Kustom?",
      description: `Kategori "${name}" akan dihapus. Transaksi terkait tidak akan ikut terhapus.`,
      confirmText: "Ya, Hapus",
      cancelText: "Batal",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      setCatLoading(true);
      await deleteCategoryAction(id);
      showToast({
        variant: "success",
        title: "Kategori dihapus",
        description: `Kategori "${name}" berhasil dihapus.`,
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gagal menghapus kategori",
        description: (err as Error).message,
      });
    } finally {
      setCatLoading(false);
    }
  };

  const handleSaveSheetConfig = async () => {
    try {
      setSheetLoading(true);
      const res = await updateGoogleSheetsConfigAction({
        googleSheetId: sheetId,
        googleSheetAutoSync: autoSync,
      });
      if (res.sheetId !== undefined) {
        setSheetId(res.sheetId || "");
      }
      showToast({
        variant: "success",
        title: "Pengaturan disimpan!",
        description: "Konfigurasi Google Sheets berhasil diperbarui.",
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gagal menyimpan pengaturan",
        description: (err as Error).message,
      });
    } finally {
      setSheetLoading(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setSyncLoading(true);
      const res = await syncGoogleSheetsAction();
      showToast({
        variant: "success",
        title: "Sinkronisasi selesai!",
        description: `Berhasil menyinkronkan ${res.count} pengeluaran ke Google Sheets.`,
      });
    } catch (err) {
      showToast({
        variant: "error",
        title: "Gagal sinkronisasi",
        description: (err as Error).message,
      });
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* 1. Integrasi Telegram & Voice Note AI (Wit.ai) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Send className="h-5 w-5 text-sky-500" />
            <CardTitle>Integrasi Bot Telegram & Voice Note AI</CardTitle>
          </div>
          <CardDescription>
            Hubungkan akun web ini dengan bot Telegram Artha agar pengeluaran
            via chat teks maupun pesan suara (Voice Note Wit.ai) langsung
            tersinkronisasi ke Dashboard dan Google Sheets.
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
                    {telegramUsername
                      ? `@${telegramUsername}`
                      : `Chat ID: ${telegramChatId}`}
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
                <Button
                  onClick={handleGeneratePairing}
                  disabled={loading}
                  className="gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  <span>Hubungkan dengan Telegram</span>
                </Button>
              ) : (
                <div className="space-y-4 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
                  <div>
                    <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
                      Langkah Menghubungkan:
                    </h4>
                    <p className="mt-1 text-xs text-zinc-500">
                      Tautan ini hanya berlaku selama 15 menit. Klik tombol di
                      bawah untuk membuka Telegram:
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

                    <Button
                      variant="outline"
                      onClick={handleCopyLink}
                      className="gap-2"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      <span>{copied ? "Link Disalin!" : "Salin Link"}</span>
                    </Button>
                  </div>

                  <div className="text-xs text-zinc-400">
                    Atau kirim command berikut secara manual di chat bot
                    Telegram:
                    <code className="ml-1 rounded bg-zinc-200 px-2 py-0.5 font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                      /link {pairingData.token}
                    </code>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Status Voice Note AI (Wit.ai) */}
          <div className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50/70 p-3.5 text-xs dark:border-zinc-800 dark:bg-zinc-900/60">
            <Mic className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
            <div className="flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Pencatatan Suara (Wit.ai Speech-to-Text):
                </span>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                    witAiConfigured
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                  }`}
                >
                  {witAiConfigured ? "● Aktif" : "○ WIT_AI_TOKEN Belum Diisi"}
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Kirim pesan suara ke bot Telegram (contoh:{" "}
                <i>&quot;kopi susu dua puluh lima ribu pakai gopay&quot;</i>).
                Wit.ai otomatis mengubah suara menjadi transaksi, menyimpan ke
                database, dan meneruskannya ke Google Sheets jika Auto-Sync
                aktif.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Kategori Kustom */}
      <Card>
        <CardHeader>
          <CardTitle>Kategori Pengeluaran Kustom</CardTitle>
          <CardDescription>
            Tambahkan kategori dan kata kunci tambahan agar parser bot mengenali
            kebiasaan belanja Anda.
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
                Belum ada kategori kustom. Sistem menggunakan 6 kategori default
                bawaan Artha.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {c.name}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Keywords:{" "}
                        {c.keywords.length > 0
                          ? c.keywords.join(", ")
                          : "Tidak ada"}
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

      {/* 3. Kartu Integrasi Google Sheets */}
      <Card className="rounded-2xl border-zinc-200 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <CardHeader>
          <div className="flex items-center gap-2">
            <TableIcon className="h-5 w-5 text-emerald-500" />
            <CardTitle className="text-lg">Google Sheets Sync</CardTitle>
          </div>
          <CardDescription>
            Sinkronkan seluruh pengeluaran dari Telegram (Teks & Voice Note
            Wit.ai) maupun Web Dashboard (Input Manual & Scan Struk OCR) ke
            Google Spreadsheet Anda secara real-time.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-xl bg-zinc-50 p-4 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
            <p className="font-semibold text-zinc-800 dark:text-zinc-200">
              Cara Menghubungkan Google Sheets:
            </p>
            <ol className="mt-2 list-decimal list-inside space-y-1.5">
              <li>Buat spreadsheet baru (kosong) di Google Sheets Anda.</li>
              <li>
                Klik tombol <b>Bagikan (Share)</b> di pojok kanan atas Google
                Sheets, lalu tambahkan alamat email Service Account berikut
                sebagai <b>Editor</b>:
                {serviceAccountEmail ? (
                  <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 font-mono text-[11px] dark:border-zinc-800 dark:bg-zinc-950">
                    <span className="truncate text-zinc-800 dark:text-zinc-200">
                      {serviceAccountEmail}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(serviceAccountEmail);
                        showToast({
                          variant: "success",
                          title: "Email Service Account disalin!",
                          description:
                            "Tempelkan email ini di menu Share Google Sheets Anda sebagai Editor.",
                        });
                      }}
                      className="shrink-0 font-sans font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      Salin Email
                    </button>
                  </div>
                ) : (
                  <div className="mt-1.5 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-[11px] text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
                    Variabel <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code> &{" "}
                    <code>GOOGLE_PRIVATE_KEY</code> belum diatur di environment
                    server (<code>.env</code>).
                  </div>
                )}
              </li>
              <li>
                Salin <b>Link URL Google Sheets</b> (atau{" "}
                <b>Spreadsheet ID</b>-nya) dari browser Anda dan tempel di kolom
                bawah ini.
              </li>
            </ol>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Link URL Google Sheets atau Spreadsheet ID
            </label>
            <Input
              value={sheetId}
              onChange={(e) => setSheetId(e.target.value)}
              placeholder="Tempel link https://docs.google.com/spreadsheets/d/... atau ID-nya"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoSync"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="autoSync"
              className="text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer"
            >
              Auto-Sync otomatis setiap ada transaksi baru (Telegram, Voice
              Note, & Web)
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              onClick={handleSaveSheetConfig}
              disabled={sheetLoading}
              size="sm"
              className="rounded-xl text-xs font-medium"
            >
              {sheetLoading ? "Menyimpan..." : "Simpan Pengaturan"}
            </Button>

            {sheetId && (
              <Button
                variant="outline"
                onClick={handleManualSync}
                disabled={syncLoading}
                size="sm"
                className="rounded-xl text-xs font-medium"
              >
                {syncLoading ? "Menyinkronkan..." : "Sinkronkan Sekarang"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}