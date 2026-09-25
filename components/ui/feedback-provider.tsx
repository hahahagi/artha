"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: string;
  expiresAt: number;
}

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

interface FeedbackContextValue {
  showToast: (options: ToastOptions) => void;
  confirmAction: (options: ConfirmOptions) => Promise<boolean>;
}

const STORAGE_KEY = "artha_active_toasts";

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedback harus digunakan di dalam FeedbackProvider");
  }
  return ctx;
}

function saveToastsToStorage(items: ToastItem[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Abaikan jika sessionStorage tidak tersedia
  }
}

function loadToastsFromStorage(): ToastItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ToastItem[];
    const now = Date.now();
    return parsed.filter((item) => item.expiresAt > now);
  } catch {
    return [];
  }
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const counterRef = useRef(0);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveToastsToStorage(next);
      return next;
    });
  }, []);

  const showToast = useCallback(
    ({
      title,
      description,
      variant = "info",
      duration = 3500,
    }: ToastOptions) => {
      counterRef.current += 1;
      const id = `toast-${Date.now()}-${counterRef.current}`;
      const expiresAt = Date.now() + duration;
      const newItem: ToastItem = {
        id,
        title,
        description,
        variant,
        duration,
        expiresAt,
      };

      setToasts((prev) => {
        const next = [...prev, newItem];
        saveToastsToStorage(next);
        return next;
      });

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast],
  );

  // Pulihkan toast dari sessionStorage & cek query param hasil redirect OAuth setiap ganti halaman
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    const syncTimer = setTimeout(() => {
      const stored = loadToastsFromStorage();
      if (stored.length > 0) {
        setToasts(stored);
        saveToastsToStorage(stored);
        const now = Date.now();
        stored.forEach((t) => {
          timers.push(
            setTimeout(
              () => dismissToast(t.id),
              Math.max(t.expiresAt - now, 500),
            ),
          );
        });
      }

      const params = new URLSearchParams(window.location.search);
      const loginParam = params.get("login");
      const errorParam = params.get("error");

      if (loginParam === "success") {
        showToast({
          variant: "success",
          title: "Berhasil masuk!",
          description: "Selamat datang kembali di Artha.",
        });
        params.delete("login");
        const cleanUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", cleanUrl);
      } else if (errorParam === "auth_failed") {
        showToast({
          variant: "error",
          title: "Gagal masuk",
          description: "Autentikasi gagal atau dibatalkan. Silakan coba lagi.",
        });
        params.delete("error");
        const cleanUrl =
          window.location.pathname +
          (params.toString() ? `?${params.toString()}` : "");
        window.history.replaceState({}, "", cleanUrl);
      }
    }, 0);

    return () => {
      clearTimeout(syncTimer);
      timers.forEach(clearTimeout);
    };
  }, [pathname, dismissToast, showToast]);

  const confirmAction = useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        setConfirmState({
          ...options,
          resolve,
        });
      });
    },
    [],
  );

  const handleConfirmResult = (result: boolean) => {
    if (confirmState) {
      confirmState.resolve(result);
      setConfirmState(null);
    }
  };

  return (
    <FeedbackContext.Provider value={{ showToast, confirmAction }}>
      {children}

      {/* Floating Toast Container */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5"
      >
        {toasts.map((toast) => {
          const variant = toast.variant ?? "info";

          const styles: Record<
            ToastVariant,
            {
              border: string;
              iconBg: string;
              iconColor: string;
              Icon: React.ComponentType<{ className?: string }>;
            }
          > = {
            success: {
              border: "border-emerald-200 dark:border-emerald-800/80",
              iconBg: "bg-emerald-50 dark:bg-emerald-950/60",
              iconColor: "text-emerald-600 dark:text-emerald-400",
              Icon: CheckCircle2,
            },
            error: {
              border: "border-red-200 dark:border-red-800/80",
              iconBg: "bg-red-50 dark:bg-red-950/60",
              iconColor: "text-red-600 dark:text-red-400",
              Icon: AlertCircle,
            },
            warning: {
              border: "border-amber-200 dark:border-amber-800/80",
              iconBg: "bg-amber-50 dark:bg-amber-950/60",
              iconColor: "text-amber-600 dark:text-amber-400",
              Icon: AlertTriangle,
            },
            info: {
              border: "border-zinc-200 dark:border-zinc-700",
              iconBg: "bg-zinc-100 dark:bg-zinc-800",
              iconColor: "text-zinc-700 dark:text-zinc-300",
              Icon: Info,
            },
          };

          const current = styles[variant];
          const IconComponent = current.Icon;

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white/95 p-4 shadow-lg backdrop-blur-md transition-all dark:bg-zinc-900/95 ${current.border}`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${current.iconBg} ${current.iconColor}`}
              >
                <IconComponent className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {toast.title}
                </p>
                {toast.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {toast.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="rounded-lg p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Custom Confirm Dialog Modal */}
      {confirmState && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
          onClick={() => handleConfirmResult(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  confirmState.variant === "danger"
                    ? "bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                    : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                }`}
              >
                {confirmState.variant === "danger" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                  {confirmState.title}
                </h3>
                {confirmState.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {confirmState.description}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => handleConfirmResult(false)}
                className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {confirmState.cancelText ?? "Batal"}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmResult(true)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  confirmState.variant === "danger"
                    ? "bg-red-600 text-white hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500"
                    : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                }`}
              >
                {confirmState.confirmText ?? "Ya, Lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
