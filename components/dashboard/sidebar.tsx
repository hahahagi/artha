"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  CalendarClock,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getEmailUsername } from "@/lib/utils/format";
import { useFeedback } from "@/components/ui/feedback-provider";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pengeluaran", href: "/expenses", icon: Receipt },
  { name: "Anggaran", href: "/budgets", icon: PiggyBank },
  { name: "Langganan", href: "/subscriptions", icon: CalendarClock },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function DashboardSidebar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { showToast, confirmAction } = useFeedback();

  const handleSignOut = async () => {
    const confirmed = await confirmAction({
      title: "Keluar dari Akun?",
      description: "Apakah Anda yakin ingin keluar dari sesi Artha saat ini?",
      confirmText: "Ya, Keluar",
      cancelText: "Batal",
      variant: "danger",
    });
    if (!confirmed) return;

    sessionStorage.removeItem("pwa_prompt_shown_in_session");
    const supabase = createClient();
    await supabase.auth.signOut();
    showToast({
      variant: "info",
      title: "Berhasil keluar",
      description: "Sampai jumpa kembali!",
    });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 md:flex">
      {/* Brand Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-200 px-6 dark:border-zinc-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Artha
          </span>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Sign Out */}
      <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-3 px-2">
          <p className="text-xs text-zinc-400">Masuk sebagai</p>
          <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            {getEmailUsername(userEmail)}
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}