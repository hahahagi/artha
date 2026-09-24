import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsView } from "@/components/dashboard/settings-view";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: {
      categories: {
        orderBy: { name: "asc" },
      },
    },
  });

  const isLinked = Boolean(dbUser?.telegramChatId);
  const telegramUsername = dbUser?.telegramUsername || null;
  // Konversi BigInt ke string untuk keamanan serialisasi Next.js
  const telegramChatId = dbUser?.telegramChatId
    ? dbUser.telegramChatId.toString()
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Pengaturan
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Kelola integrasi bot Telegram dan preferensi kategori pengeluaran
          Anda.
        </p>
      </div>

      <SettingsView
        isLinked={isLinked}
        telegramUsername={telegramUsername}
        telegramChatId={telegramChatId}
        categories={dbUser?.categories ?? []}
        googleSheetId={dbUser?.googleSheetId ?? null}
        googleSheetAutoSync={dbUser?.googleSheetAutoSync ?? false}
        serviceAccountEmail={process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || null}
      />
    </div>
  );
}
