"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const toggleTheme = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    const nextTheme = isDark ? "light" : "dark";

    root.classList.toggle("dark", nextTheme === "dark");
    localStorage.setItem("artha_theme", nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Ubah tema tampilan (Terang/Gelap)"
      title="Ubah tema (Terang / Gelap)"
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
    >
      <Sun className="hidden h-4 w-4 text-amber-400 dark:block" />
      <Moon className="block h-4 w-4 text-zinc-600 dark:hidden" />
    </button>
  );
}