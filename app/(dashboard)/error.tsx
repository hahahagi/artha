"use client";

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]:", error);
  }, [error]);

  return (
    <div className="flex h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/20">
      <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
      <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
        Gagal Memuat Data Dashboard
      </h3>
      <p className="mt-1 text-xs text-zinc-500 max-w-sm dark:text-zinc-400">
        Terjadi kendala saat mengambil data terbaru dari database.
      </p>
      <Button onClick={() => reset()} size="sm" className="mt-4 gap-2 rounded-xl">
        <RotateCcw className="h-3.5 w-3.5" />
        <span>Muat Ulang Komponen</span>
      </Button>
    </div>
  );
}