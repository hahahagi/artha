"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-zinc-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
        <AlertTriangle className="h-8 w-8" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Terjadi Kesalahan Sistem
      </h1>

      <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        Aplikasi mengalami kendala saat memproses permintaan ini. Silakan coba muat ulang halaman.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => reset()} className="gap-2 rounded-xl">
          <RotateCcw className="h-4 w-4" />
          <span>Coba Lagi</span>
        </Button>
        <Link href="/">
          <Button variant="outline" className="gap-2 rounded-xl">
            <Home className="h-4 w-4" />
            <span>Ke Beranda</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}