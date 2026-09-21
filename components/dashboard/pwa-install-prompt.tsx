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
    // Jangan munculkan pop-up jika aplikasi sudah dibuka dari app mode (standalone)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // Jangan munculkan jika user baru saja menutup pop-up dalam 24 jam terakhir
    const dismissedTime = localStorage.getItem("pwa_install_dismissed");
    if (dismissedTime && Date.now() - Number(dismissedTime) < 24 * 60 * 60 * 1000) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // Simpan event instalasi dari browser
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setShowPrompt(false);
    // Munculkan dialog instalasi resmi bawaan browser
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Simpan ke localStorage agar tidak mengganggu terus-menerus
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 sm:bottom-6 sm:right-6 sm:left-auto">
      <div className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
          <Download className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
            Install Aplikasi Artha
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
            Pasang di layar utama untuk akses lebih cepat tanpa membuka browser.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleInstall} className="rounded-xl px-3 text-xs">
            Install
          </Button>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}