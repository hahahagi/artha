"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { useFeedback } from "@/components/ui/feedback-provider";

export default function ForgotPasswordPage() {
  const { showToast } = useFeedback();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      const res = await forgotPasswordAction(email);
      if (!res.success) {
        showToast({
          variant: "error",
          title: "Gagal mengirim link reset",
          description: res.error || "Gagal mengirim link reset password.",
        });
        return;
      }

      showToast({
        variant: "success",
        title: "Link reset terkirim!",
        description:
          "Silakan periksa kotak masuk atau folder spam email Anda.",
      });
    } catch {
      showToast({
        variant: "error",
        title: "Terjadi kendala",
        description: "Silakan coba beberapa saat lagi.",
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
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Masukkan email Anda untuk menerima link reset
          </p>
        </div>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Email Terdaftar
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-2 text-sm font-semibold"
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
          Ingat password Anda?{" "}
          <Link
            href="/login"
            className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
          >
            Kembali ke login
          </Link>
        </p>
      </div>
    </div>
  );
}