import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BudgetsView } from "@/components/dashboard/budgets-view";

export default async function BudgetsPage() {
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
      categories: { orderBy: { name: "asc" } },
      budgets: {
        include: { category: true },
        orderBy: { amount: "desc" },
      },
    },
  });

  if (!dbUser) {
    redirect("/login");
  }

  // Hitung pengeluaran bulan berjalan per kategori
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthExpenses = await prisma.expense.findMany({
    where: {
      userId: dbUser.id,
      createdAt: { gte: startOfMonth },
    },
    select: {
      categoryId: true,
      amount: true,
    },
  });

  const spentMap: Record<string, number> = {};
  let totalSpent = 0;
  for (const exp of monthExpenses) {
    totalSpent += exp.amount;
    if (exp.categoryId) {
      spentMap[exp.categoryId] = (spentMap[exp.categoryId] || 0) + exp.amount;
    }
  }

  const totalBudget = dbUser.budgets.reduce((sum, b) => sum + b.amount, 0);

  return (
    <BudgetsView
      categories={dbUser.categories}
      budgets={dbUser.budgets}
      spentMap={spentMap}
      totalBudget={totalBudget}
      totalSpent={totalSpent}
    />
  );
}