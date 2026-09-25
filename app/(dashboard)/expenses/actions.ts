"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { appendExpenseToSheet } from "@/lib/sheets/google-sheets";

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
 * Tambah transaksi manual / hasil Scan Struk OCR via Web
 */
export async function createExpenseAction(formData: {
  itemName: string;
  amount: number;
  categoryId?: string;
  currency?: string;
}) {
  const user = await getAuthenticatedUser();

  const created = await prisma.expense.create({
    data: {
      userId: user.id,
      itemName: formData.itemName.trim(),
      amount: Math.round(formData.amount),
      categoryId: formData.categoryId || null,
      currency: formData.currency || "IDR",
      rawText: `${formData.itemName} ${formData.amount}`,
      source: "WEB",
    },
    include: {
      category: true,
    },
  });

  // Sinkronisasi real-time ke Google Sheets jika fitur Auto-Sync diaktifkan oleh user
  if (user.googleSheetId && user.googleSheetAutoSync) {
    try {
      await appendExpenseToSheet(user.googleSheetId, {
        date: created.createdAt.toLocaleDateString("id-ID"),
        itemName: created.itemName,
        category: created.category?.name || "Lainnya",
        amount: created.amount,
        currency: created.currency,
        wallet: created.wallet || undefined,
        source: created.source,
      });
    } catch (sheetErr) {
      console.error("[Web Expense -> Google Sheets AutoSync Error]:", sheetErr);
    }
  }

  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}

/**
 * Edit transaksi
 */
export async function updateExpenseAction(
  id: string,
  formData: {
    itemName: string;
    amount: number;
    categoryId?: string;
  }
) {
  const user = await getAuthenticatedUser();

  // Pastikan transaksi milik user yang bersangkutan
  const existing = await prisma.expense.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Transaksi tidak ditemukan");
  }

  await prisma.expense.update({
    where: { id },
    data: {
      itemName: formData.itemName.trim(),
      amount: Math.round(formData.amount),
      categoryId: formData.categoryId || null,
    },
  });

  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}

/**
 * Hapus transaksi
 */
export async function deleteExpenseAction(id: string) {
  const user = await getAuthenticatedUser();

  const existing = await prisma.expense.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Transaksi tidak ditemukan");
  }

  await prisma.expense.delete({
    where: { id },
  });

  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}