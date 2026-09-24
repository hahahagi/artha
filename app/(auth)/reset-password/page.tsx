"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validatingSession, setValidatingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const hasExchangedRef = useRef(false);
  useEffect(() => {
    // Mencegah React Strict Mode menjalankan kode dua kali
    if (hasExchangedRef.current) return;
    hasExchangedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const exchangeCode = async () => {
      const supabase = createClient();
      // Cek jika sesi sudah aktif
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        setValidatingSession(false);
        return;
      }
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          // Periksa kembali barangkali sesi sudah terbentuk
          const { data: checkData } = await supabase.auth.getSession();
          if (!checkData.session) {
            setErrorMsg(
              "Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.",
            );
          }
        } else {
          // Bersihkan kode dari URL agar URL bersih
          window.history.replaceState({}, "", window.location.pathname);
        }
      } else {
        setErrorMsg(
          "Tidak ada sesi reset password aktif. Silakan minta link baru melalui halaman Lupa Password.",
        );
      }
      setValidatingSession(false);
    };
    exchangeCode();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (password.length < 8) {
      setErrorMsg("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi password baru tidak cocok.");
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      // Perbarui password pengguna secara langsung
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        return;
      }

      setSuccessMsg("Password berhasil diperbarui! Mengalihkan ke login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch {
      setErrorMsg("Terjadi kendala saat memperbarui password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-zinc-950">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Password Baru
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Masukkan password baru untuk akun Anda
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/50 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Password Baru (Min. 8 karakter)
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={validatingSession}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Ulangi Password Baru
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={validatingSession}
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || validatingSession}
            className="w-full rounded-xl py-2 text-sm font-semibold"
          >
            {loading
              ? "Menyimpan..."
              : validatingSession
                ? "Memverifikasi link..."
                : "Simpan Password Baru"}
          </Button>
        </form>
      </div>
    </div>
  );
}
