import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ExpensesTable } from "@/components/dashboard/expenses-table";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    redirect("/login");
  }

  // Ambil user dan seluruh transaksinya
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email },
    include: {
      expenses: {
        include: { category: true },
        orderBy: { createdAt: "desc" },
      },
      categories: {
        orderBy: { name: "asc" },
      },
    },
  });

  const expenses = dbUser?.expenses ?? [];
  const categories = dbUser?.categories ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Daftar Pengeluaran
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Kelola, cari, dan tinjau seluruh riwayat transaksi pengeluaran Anda.
        </p>
      </div>

      <ExpensesTable
        initialExpenses={expenses}
        categories={categories}
      />
    </div>
  );
}