"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useFeedback } from "@/components/ui/feedback-provider";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { showToast } = useFeedback();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingSession, setValidatingSession] = useState(true);

  const hasExchangedRef = useRef(false);
  useEffect(() => {
    if (hasExchangedRef.current) return;
    hasExchangedRef.current = true;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const exchangeCode = async () => {
      const supabase = createClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        setValidatingSession(false);
        return;
      }
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          const { data: checkData } = await supabase.auth.getSession();
          if (!checkData.session) {
            showToast({
              variant: "error",
              title: "Link kadaluarsa",
              description:
                "Link reset password tidak valid atau sudah kadaluarsa. Silakan minta link baru.",
            });
          }
        } else {
          window.history.replaceState({}, "", window.location.pathname);
        }
      } else {
        showToast({
          variant: "warning",
          title: "Sesi tidak ditemukan",
          description:
            "Tidak ada sesi reset password aktif. Silakan minta link baru melalui halaman Lupa Password.",
        });
      }
      setValidatingSession(false);
    };
    exchangeCode();
  }, [showToast]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      showToast({
        variant: "warning",
        title: "Password terlalu pendek",
        description: "Password minimal 8 karakter.",
      });
      return;
    }

    if (password !== confirmPassword) {
      showToast({
        variant: "warning",
        title: "Password tidak cocok",
        description: "Konfirmasi password baru tidak cocok.",
      });
      return;
    }

    try {
      setLoading(true);
      const supabase = createClient();

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        showToast({
          variant: "error",
          title: "Gagal memperbarui password",
          description: error.message,
        });
        return;
      }

      showToast({
        variant: "success",
        title: "Password berhasil diperbarui!",
        description: "Silakan masuk dengan password baru Anda.",
      });
      router.push("/login");
    } catch {
      showToast({
        variant: "error",
        title: "Gagal memperbarui password",
        description: "Terjadi kendala saat memperbarui password.",
      });
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

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Password Baru (Min. 8 karakter)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={validatingSession}
                className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-3 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50"
              />
              <button
                type="button"
                disabled={validatingSession}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 disabled:opacity-50 dark:hover:text-zinc-200"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Ulangi Password Baru
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={validatingSession}
                className="w-full rounded-xl border border-zinc-300 bg-white py-2 pl-3 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 disabled:opacity-50"
              />
              <button
                type="button"
                disabled={validatingSession}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Sembunyikan konfirmasi password"
                    : "Tampilkan konfirmasi password"
                }
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 disabled:opacity-50 dark:hover:text-zinc-200"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
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