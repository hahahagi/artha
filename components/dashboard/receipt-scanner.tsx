"use client";

import { useState, useRef } from "react";
import { parseReceiptText } from "@/lib/parser/receipt-parser";
import {
  formatCurrency,
  formatThousandInput,
  parseThousandInput,
} from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, X, Check, Loader2, RefreshCw } from "lucide-react";

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (data: { itemName: string; amount: number }) => void;
}

export function ReceiptScanner({
  isOpen,
  onClose,
  onApply,
}: ReceiptScannerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [detectedItem, setDetectedItem] = useState("");
  const [detectedAmount, setDetectedAmount] = useState<number>(0);
  const [scanDone, setScanDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
    setScanDone(false);
    setIsProcessing(true);
    setProgress(0);
    setStatusMessage("Menyiapkan OCR engine...");

    try {
      // Dynamic import Tesseract agar tidak membebani initial bundle
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("ind+eng", undefined, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round((m.progress || 0) * 100));
            setStatusMessage(
              `Membaca struk... ${Math.round((m.progress || 0) * 100)}%`,
            );
          } else {
            setStatusMessage("Memuat model bahasa...");
          }
        },
      });

      const {
        data: { text },
      } = await worker.recognize(file);
      await worker.terminate();

      const parsed = parseReceiptText(text);
      if (parsed) {
        const title = parsed.merchantName
          ? `Belanja ${parsed.merchantName}`
          : "Belanja Struk";
        setDetectedItem(title);
        setDetectedAmount(parsed.totalAmount);
      } else {
        setDetectedItem("Belanja Struk");
        setDetectedAmount(0);
      }
      setScanDone(true);
    } catch (err) {
      console.error("[OCR Error]:", err);
      alert("Gagal memproses struk. Silakan coba foto yang lebih jelas.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setImagePreview(null);
    setScanDone(false);
    setDetectedItem("");
    setDetectedAmount(0);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirm = () => {
    if (detectedAmount <= 0) {
      alert("Nominal tidak valid atau belum terdeteksi.");
      return;
    }
    onApply({
      itemName: detectedItem || "Belanja Struk",
      amount: detectedAmount,
    });
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-indigo-500" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Scan Struk Belanja
            </h3>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 p-8 text-center cursor-pointer transition hover:border-indigo-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
            >
              <div className="rounded-full bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                <Upload className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                Ambil foto atau pilih struk dari galeri
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Mendukung format JPG, PNG, atau WebP
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative max-h-48 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview Struk"
                  className="w-full object-cover"
                />
              </div>

              {isProcessing && (
                <div className="space-y-2 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                      {statusMessage}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {scanDone && (
                <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Hasil Deteksi Struk
                  </p>
                  <div>
                    <label className="text-xs text-zinc-500">
                      Nama Catatan / Toko
                    </label>
                    <Input
                      value={detectedItem}
                      onChange={(e) => setDetectedItem(e.target.value)}
                      placeholder="Contoh: Belanja Indomaret"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500">
                      Nominal Total (Rp)
                    </label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      value={formatThousandInput(detectedAmount)}
                      onChange={(e) =>
                        setDetectedAmount(parseThousandInput(e.target.value))
                      }
                      placeholder="Contoh: 50.000"
                      className="mt-1"
                    />
                    {detectedAmount > 0 && (
                      <p className="mt-1 text-xs text-emerald-600 font-medium dark:text-emerald-400">
                        {formatCurrency(detectedAmount, "IDR")}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          {imagePreview ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-xs"
              disabled={isProcessing}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Ganti Foto
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="text-xs"
            >
              Batal
            </Button>
            {scanDone && (
              <Button
                size="sm"
                onClick={handleConfirm}
                className="gap-1.5 text-xs font-semibold"
              >
                <Check className="h-3.5 w-3.5" />
                Gunakan Data
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
