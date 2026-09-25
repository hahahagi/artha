"use server";

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { seedUserDefaultCategories } from "@/lib/db/seed-categories";

/**
 * Mendapatkan Base URL aplikasi secara dinamis (Production Vercel vs Localhost)
 */
function getAppBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (
    configuredUrl &&
    (!process.env.VERCEL || !configuredUrl.includes("localhost"))
  ) {
    return configuredUrl.replace(/\/$/, "");
  }
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
 * Pendaftaran Akun Baru dengan Email & Password (Langsung Aktif & Auto-Login Tanpa Konfirmasi Email)
 */
export async function registerWithEmailAction(email: string, password: string) {
  try {
    const supabase = await createClient();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    const hasValidServiceRole =
      Boolean(supabaseUrl) &&
      Boolean(serviceRoleKey) &&
      serviceRoleKey !== "your-service-role-key";

    if (hasValidServiceRole && supabaseUrl && serviceRoleKey) {
      // 1. Buat user via Admin API dengan email_confirm: true (tidak mengirim email verifikasi)
      const supabaseAdmin = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (adminError) {
        return { success: false, error: adminError.message };
      }
    } else {
      // 2. Fallback jika SUPABASE_SERVICE_ROLE_KEY belum diisi: signUp standar lalu auto-confirm via DB
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email,
          password,
        });

      if (signUpError) {
        return { success: false, error: signUpError.message };
      }

      if (signUpData.user?.id && !signUpData.session) {
        await prisma.$executeRaw`
          UPDATE auth.users
          SET email_confirmed_at = NOW(),
              updated_at = NOW()
          WHERE id = ${signUpData.user.id}::uuid
            AND email_confirmed_at IS NULL
        `;
      }
    }

    // 3. Langsung login agar session cookie terbentuk dan user otomatis masuk ke Dashboard
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError) {
      return { success: false, error: signInError.message };
    }

    const userEmail = signInData.user?.email || email;
    const dbUser = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { email: userEmail },
    });
    await seedUserDefaultCategories(dbUser.id);

    return {
      success: true,
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