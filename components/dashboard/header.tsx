"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Wallet,
  LayoutDashboard,
  Receipt,
  PiggyBank,
  CalendarClock,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pengeluaran", href: "/expenses", icon: Receipt },
  { name: "Anggaran", href: "/budgets", icon: PiggyBank },
  { name: "Langganan", href: "/subscriptions", icon: CalendarClock },
  { name: "Pengaturan", href: "/settings", icon: Settings },
];

export function DashboardHeader({ userEmail }: { userEmail?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 md:px-8">
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span className="font-bold text-zinc-900 dark:text-zinc-50">Artha</span>
          </div>
        </div>

        <div className="hidden text-sm font-medium text-zinc-500 md:block">
          Expense & Subscription Tracker
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-zinc-500 sm:inline-block">
            {userEmail}
          </span>
          <button
            onClick={handleSignOut}
            className="hidden items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 md:flex"
          >
            <LogOut className="h-3.5 w-3.5" />
            Keluar
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex w-64 max-w-[80%] flex-1 flex-col bg-white p-4 shadow-xl dark:bg-zinc-950">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-zinc-900 dark:text-zinc-50">
                <Wallet className="h-5 w-5" />
                <span>Artha</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
                      isActive
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <p className="mb-2 truncate text-xs text-zinc-400">{userEmail}</p>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg py-2 text-xs font-medium text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}