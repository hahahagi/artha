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
 * Tambah langganan baru
 */
export async function createSubscriptionAction(data: {
  serviceName: string;
  amount: number;
  billingDay: number;
  currency?: string;
}) {
  const user = await getAuthenticatedUser();

  if (data.billingDay < 1 || data.billingDay > 31) {
    throw new Error("Tanggal tagihan harus antara 1 sampai 31");
  }

  // Cek duplikasi nama langganan
  const existing = await prisma.subscription.findUnique({
    where: {
      userId_serviceName: {
        userId: user.id,
        serviceName: data.serviceName.trim(),
      },
    },
  });

  if (existing) {
    throw new Error(`Langganan "${data.serviceName}" sudah terdaftar.`);
  }

  await prisma.subscription.create({
    data: {
      userId: user.id,
      serviceName: data.serviceName.trim(),
      amount: Math.round(data.amount),
      billingDay: data.billingDay,
      currency: data.currency || "IDR",
      isActive: true,
    },
  });

  revalidatePath("/subscriptions");
  revalidatePath("/");
  return { success: true };
}

/**
 * Edit langganan
 */
export async function updateSubscriptionAction(
  id: string,
  data: {
    serviceName: string;
    amount: number;
    billingDay: number;
    isActive: boolean;
  }
) {
  const user = await getAuthenticatedUser();

  const existing = await prisma.subscription.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Langganan tidak ditemukan");
  }

  await prisma.subscription.update({
    where: { id },
    data: {
      serviceName: data.serviceName.trim(),
      amount: Math.round(data.amount),
      billingDay: data.billingDay,
      isActive: data.isActive,
    },
  });

  revalidatePath("/subscriptions");
  revalidatePath("/");
  return { success: true };
}

/**
 * Toggle Status Aktif / Dijeda
 */
export async function toggleSubscriptionStatusAction(id: string, isActive: boolean) {
  const user = await getAuthenticatedUser();

  await prisma.subscription.updateMany({
    where: { id, userId: user.id },
    data: { isActive },
  });

  revalidatePath("/subscriptions");
  revalidatePath("/");
  return { success: true };
}

/**
 * Hapus langganan
 */
export async function deleteSubscriptionAction(id: string) {
  const user = await getAuthenticatedUser();

  await prisma.subscription.deleteMany({
    where: { id, userId: user.id },
  });

  revalidatePath("/subscriptions");
  revalidatePath("/");
  return { success: true };
}