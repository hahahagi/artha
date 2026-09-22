import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { seedUserDefaultCategories } from "@/lib/db/seed-categories";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sinkronkan data user Google dengan tabel User di Prisma
      const email = data.user.email;
      if (email) {
        try {
          const dbUser = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
              email,
            },
          });
          // Otomatis buatkan 6 kategori default untuk user baru
          await seedUserDefaultCategories(dbUser.id);
        } catch (dbErr) {
          console.error("[Auth Callback] DB Upsert error:", dbErr);
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect ke halaman login jika terjadi error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
