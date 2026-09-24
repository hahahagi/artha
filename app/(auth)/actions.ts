"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { seedUserDefaultCategories } from "@/lib/db/seed-categories";

/**
 * Login dengan Email & Password
 */
export async function loginWithEmailAction(email: string, password: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user?.email) {
      // Pastikan data user ada di Prisma dan kategorinya ter-seed
      const dbUser = await prisma.user.upsert({
        where: { email: data.user.email },
        update: {},
        create: { email: data.user.email },
      });
      await seedUserDefaultCategories(dbUser.id);
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal login.";
    return { success: false, error: message };
  }
}

/**
 * Pendaftaran Akun Baru dengan Email & Password
 */
export async function registerWithEmailAction(email: string, password: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user?.email) {
      const dbUser = await prisma.user.upsert({
        where: { email: data.user.email },
        update: {},
        create: { email: data.user.email },
      });
      await seedUserDefaultCategories(dbUser.id);
    }

    // Jika Supabase memerlukan konfirmasi email (data.session null)
    return {
      success: true,
      needsConfirmation: !data.session,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mendaftar.";
    return { success: false, error: message };
  }
}

/**
 * Permintaan Reset Password (Lupa Password)
 */
export async function forgotPasswordAction(email: string) {
  try {
    const supabase = await createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengirim link reset password.";
    return { success: false, error: message };
  }
}

/**
 * Simpan Password Baru
 */
export async function resetPasswordAction(newPassword: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memperbarui password.";
    return { success: false, error: message };
  }
}