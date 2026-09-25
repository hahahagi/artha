"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { seedUserDefaultCategories } from "@/lib/db/seed-categories";

/**
 * Mendapatkan Base URL aplikasi secara dinamis (Production Vercel vs Localhost)
 */
function getAppBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  // Gunakan NEXT_PUBLIC_APP_URL jika ada dan bukan localhost saat berjalan di Vercel
  if (
    configuredUrl &&
    (!process.env.VERCEL || !configuredUrl.includes("localhost"))
  ) {
    return configuredUrl.replace(/\/$/, "");
  }
  // Otomatis gunakan domain production utama dari Vercel jika tersedia
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

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
    const appUrl = getAppBaseUrl();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${appUrl}/callback`,
      },
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
    const appUrl = getAppBaseUrl();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : "Gagal mengirim link reset password.";
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
    const message =
      err instanceof Error ? err.message : "Gagal memperbarui password.";
    return { success: false, error: message };
  }
}
