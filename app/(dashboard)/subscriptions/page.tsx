import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SubscriptionsView } from "@/components/dashboard/subscriptions-view";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  // Ambil user dan daftar langganannya
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: {
      subscriptions: {
        orderBy: { billingDay: "asc" },
      },
    },
  });

  const subscriptions = dbUser?.subscriptions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Langganan Rutin
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Kelola layanan langganan aktif dan pantau jadwal jatuh tempo tagihan Anda.
        </p>
      </div>

      <SubscriptionsView initialSubscriptions={subscriptions} />
    </div>
  );
}