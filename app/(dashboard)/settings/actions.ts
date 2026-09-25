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
 * Helper mengekstrak Spreadsheet ID apabila user menempelkan URL lengkap Google Sheets
 */
function extractSpreadsheetId(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

/**
 * Menyimpan konfigurasi Spreadsheet ID dan Auto-Sync
 */
export async function updateGoogleSheetsConfigAction(data: {
  googleSheetId: string | null;
  googleSheetAutoSync: boolean;
}) {
  try {
    const user = await getAuthenticatedUser();
    const cleanSheetId = extractSpreadsheetId(data.googleSheetId);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        googleSheetId: cleanSheetId,
        googleSheetAutoSync: data.googleSheetAutoSync,
      },
    });
    revalidatePath("/settings");
    return { success: true, sheetId: cleanSheetId, error: null };
  } catch (err) {
    return {
      success: false,
      sheetId: null,
      error:
        err instanceof Error ? err.message : "Gagal menyimpan pengaturan.",
    };
  }
}

/**
 * Sinkronisasi manual seluruh data pengeluaran ke Google Spreadsheet
 */
export async function syncGoogleSheetsAction(input?: {
  googleSheetId?: string;
  googleSheetAutoSync?: boolean;
}) {
  try {
    const user = await getAuthenticatedUser();

    // Gunakan ID terbaru dari input form jika ada, sekaligus simpan ke DB
    const targetSheetId = extractSpreadsheetId(
      input?.googleSheetId !== undefined
        ? input.googleSheetId
        : user.googleSheetId,
    );

    if (!targetSheetId) {
      return {
        success: false,
        count: 0,
        sheetId: null,
        error: "Spreadsheet ID atau Link Google Sheets belum diisi.",
      };
    }

    if (
      targetSheetId !== user.googleSheetId ||
      (input?.googleSheetAutoSync !== undefined &&
        input.googleSheetAutoSync !== user.googleSheetAutoSync)
    ) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleSheetId: targetSheetId,
          ...(input?.googleSheetAutoSync !== undefined
            ? { googleSheetAutoSync: input.googleSheetAutoSync }
            : {}),
        },
      });
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

    await syncAllExpensesToSheet(targetSheetId, rows);
    revalidatePath("/settings");
    return {
      success: true,
      count: rows.length,
      sheetId: targetSheetId,
      error: null,
    };
  } catch (err) {
    return {
      success: false,
      count: 0,
      sheetId: null,
      error:
        err instanceof Error
          ? err.message
          : "Gagal menyinkronkan ke Google Sheets.",
    };
  }
}