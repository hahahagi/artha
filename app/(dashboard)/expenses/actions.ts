"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
 * Tambah transaksi manual via Web
 */
export async function createExpenseAction(formData: {
  itemName: string;
  amount: number;
  categoryId?: string;
  currency?: string;
}) {
  const user = await getAuthenticatedUser();

  await prisma.expense.create({
    data: {
      userId: user.id,
      itemName: formData.itemName.trim(),
      amount: Math.round(formData.amount),
      categoryId: formData.categoryId || null,
      currency: formData.currency || "IDR",
      rawText: `${formData.itemName} ${formData.amount}`,
      source: "WEB",
    },
  });

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