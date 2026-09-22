"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. Jangan tampilkan jika aplikasi sudah dibuka dalam mode standalone (sudah terinstal)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // 2. Jangan tampilkan jika sudah pernah berhasil diinstall sebelumnya
    if (localStorage.getItem("pwa_already_installed") === "true") return;

    // 3. Jangan munculkan jika user menutup pop-up dalam 7 hari terakhir (1 minggu)
    const dismissedTime = localStorage.getItem("pwa_install_dismissed");
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (dismissedTime && Date.now() - Number(dismissedTime) < SEVEN_DAYS_MS) {
      return;
    }

    let timer: NodeJS.Timeout;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Beri jeda 4 detik setelah halaman dimuat agar tidak mengagetkan pengguna
      timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setShowPrompt(false);

    // Buka dialog instalasi resmi bawaan browser (Chrome/Edge/Android)
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      // Simpan permanen agar tidak muncul lagi selamanya
      localStorage.setItem("pwa_already_installed", "true");
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Simpan waktu dismiss: sembunyikan selama 7 hari ke depan
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 duration-500 sm:bottom-6 sm:right-6 sm:left-auto">
      <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <Download className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            Install Aplikasi Artha
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            Pasang di layar utama untuk akses instan tanpa membuka browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleInstall} className="rounded-xl px-3 text-xs">
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-zinc-400 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Tutup dan ingatkan minggu depan"
            title="Tutup (ingatkan minggu depan)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}