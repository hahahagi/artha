import Link from "next/link";
import { Wallet, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 text-center dark:bg-zinc-950">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md">
        <Wallet className="h-8 w-8" />
      </div>

      <span className="mt-6 text-sm font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
        404 Not Found
      </span>

      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        Halaman Tidak Ditemukan
      </h1>

      <p className="mt-3 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        Maaf, halaman yang Anda tuju tidak ada, telah dipindahkan, atau alamat URL salah ketik.
      </p>

      <div className="mt-8">
        <Link href="/">
          <Button className="gap-2 rounded-xl px-5">
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Beranda</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}