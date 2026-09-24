"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function setBudgetAction(categoryId: string, amount: number) {
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
    throw new Error("User tidak ditemukan.");
  }

  await prisma.budget.upsert({
    where: {
      userId_categoryId: {
        userId: dbUser.id,
        categoryId,
      },
    },
    update: {
      amount,
    },
    create: {
      userId: dbUser.id,
      categoryId,
      amount,
    },
  });

  revalidatePath("/budgets");
  revalidatePath("/");
  return { success: true };
}

export async function deleteBudgetAction(budgetId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    throw new Error("Unauthorized");
  }

  await prisma.budget.delete({
    where: { id: budgetId },
  });

  revalidatePath("/budgets");
  revalidatePath("/");
  return { success: true };
}