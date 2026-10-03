export interface ScannedReceiptResult {
  merchantName?: string;
  totalAmount: number;
  rawText?: string;
}

const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

/**
 * Helper untuk memanggil Gemini API dengan fallback model otomatis jika salah satu model sibuk
 */
async function callGeminiApi(
  apiKey: string,
  body: Record<string, unknown>,
): Promise<Response> {
  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return response;
      }

      // Jika error 404 atau 503, coba model berikutnya
      const errText = await response.text();
      lastError = new Error(`Gemini ${model} error (${response.status}): ${errText}`);
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw lastError || new Error("Failed to call Gemini API across all models");
}

/**
 * Membaca foto struk belanja menggunakan Google Gemini 2.5 Flash (Vision)
 */
export async function scanReceiptWithGemini(
  imageBuffer: Buffer,
  mimeType: string = "image/jpeg",
  apiKey?: string,
): Promise<ScannedReceiptResult | null> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const base64Data = imageBuffer.toString("base64");
  const prompt = `
Anda adalah asisten cerdas pembaca struk kasir di Indonesia (Indomaret, Alfamart, SPBU, restoran, cafe, dll).
Tugas Anda:
1. Deteksi nama toko/merchant (contoh: "Indomaret Point", "Kopi Kenangan", "SPBU Pertamina").
2. Deteksi TOTAL AKHIR yang harus dibayar / Grand Total belanja (setelah diskon jika ada). Nominal harus angka murni integer tanpa titik atau koma.

Kembalikan HANYA format JSON valid berikut:
{
  "merchantName": "Nama Toko atau null",
  "totalAmount": 50000
}
`.trim();

  const response = await callGeminiApi(key, {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  const json = await response.json();
  const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textOutput) return null;

  try {
    const parsed = JSON.parse(textOutput.trim());
    const totalAmount =
      typeof parsed.totalAmount === "number"
        ? Math.round(parsed.totalAmount)
        : parseInt(String(parsed.totalAmount || "0").replace(/[^\d]/g, ""), 10) || 0;

    return {
      merchantName: parsed.merchantName || undefined,
      totalAmount,
      rawText: textOutput,
    };
  } catch (err) {
    console.error("[Gemini Receipt Parse Error]:", err, textOutput);
    return null;
  }
}

/**
 * Mentranskripsi pesan suara audio (OGG/Opus Telegram) menggunakan Gemini 2.5 Flash
 */
export async function transcribeAudioWithGemini(
  audioBuffer: Buffer,
  mimeType: string = "audio/ogg",
  apiKey?: string,
): Promise<string> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const base64Data = audioBuffer.toString("base64");
  const prompt = `
Dengarkan audio rekaman suara bahasa Indonesia berikut.
Transkripsikan persis apa yang diucapkan pembicara mengenai transaksi keuangan/pengeluaran.
Aturan:
- Kembalikan HANYA teks transkripsi tanpa kata pengantar, tanpa penjelasan, dan tanpa tanda kutip.
- Contoh keluaran yang diharapkan: "kopi susu dua puluh lima ribu pakai gopay" atau "makan siang tiga puluh lima ribu bca".
`.trim();

  const response = await callGeminiApi(key, {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
    },
  });

  const json = await response.json();
  const textOutput = json.candidates?.[0]?.content?.parts?.[0]?.text;
  return textOutput ? textOutput.trim().replace(/^["']|["']$/g, "") : "";
}