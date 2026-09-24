"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { getBotMe } from "@/lib/telegram/bot";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import {
  syncAllExpensesToSheet,
  type SheetExpenseRow,
} from "@/lib/sheets/google-sheets";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error("Unauthorized");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
  });

  if (!dbUser) {
    throw new Error("User record not found");
  }

  return dbUser;
}

/**
 * Generate Token Pairing 8-karakter dan Deep Link Telegram
 */
export async function generatePairingTokenAction() {
  const user = await getAuthenticatedUser();

  // Buat token 8 karakter unik
  const token = crypto.randomBytes(4).toString("hex");
  const expiry = new Date(Date.now() + 15 * 60 * 1000); // Berlaku 15 menit

  await prisma.user.update({
    where: { id: user.id },
    data: {
      linkToken: token,
      linkTokenExpiry: expiry,
    },
  });

  // Ambil username bot secara dinamis dari API Telegram
  let botUsername = "ArthaTrackBot";
  try {
    const botInfo = await getBotMe();
    if (botInfo?.result?.username) {
      botUsername = botInfo.result.username;
    }
  } catch (err) {
    console.warn(
      "Gagal mengambil info bot Telegram, menggunakan fallback:",
      err,
    );
  }

  const deepLink = `https://t.me/${botUsername}?start=link_${token}`;

  return {
    token,
    deepLink,
    expiresAt: expiry.toISOString(),
  };
}

/**
 * Putuskan tautan akun Telegram
 */
export async function unlinkTelegramAction() {
  const user = await getAuthenticatedUser();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      telegramChatId: null,
      telegramUsername: null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true };
}

/**
 * Tambah Kategori Kustom
 */
export async function createCategoryAction(name: string, keywordsStr: string) {
  const user = await getAuthenticatedUser();

  const keywords = keywordsStr
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  await prisma.category.create({
    data: {
      userId: user.id,
      name: name.trim(),
      keywords,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/expenses");
  return { success: true };
}

/**
 * Hapus Kategori Kustom
 */
export async function deleteCategoryAction(id: string) {
  const user = await getAuthenticatedUser();

  await prisma.category.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/settings");
  revalidatePath("/expenses");
  return { success: true };
}

/**
 * Menyimpan konfigurasi Spreadsheet ID dan Auto-Sync
 */
export async function updateGoogleSheetsConfigAction(data: {
  googleSheetId: string | null;
  googleSheetAutoSync: boolean;
}) {
  const user = await getAuthenticatedUser();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      googleSheetId: data.googleSheetId?.trim() || null,
      googleSheetAutoSync: data.googleSheetAutoSync,
    },
  });
  revalidatePath("/settings");
  return { success: true };
}
/**
 * Sinkronisasi manual seluruh data pengeluaran ke Google Spreadsheet
 */
export async function syncGoogleSheetsAction() {
  const user = await getAuthenticatedUser();
  if (!user.googleSheetId) {
    throw new Error("Spreadsheet ID belum diisi.");
  }
  const expenses = await prisma.expense.findMany({
    where: { userId: user.id },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
  const rows: SheetExpenseRow[] = expenses.map((e) => ({
    date: e.createdAt.toLocaleDateString("id-ID"),
    itemName: e.itemName,
    category: e.category?.name || "Lainnya",
    amount: e.amount,
    currency: e.currency,
    wallet: e.wallet || undefined,
    source: e.source,
  }));
  await syncAllExpensesToSheet(user.googleSheetId, rows);
  return { success: true, count: rows.length };
}
