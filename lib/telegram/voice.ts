import { transcribeAudioWithGemini } from "@/lib/ai/gemini";

/**
 * Mengunduh file audio dari Telegram Bot API
 */
export async function downloadTelegramFile(fileId: string): Promise<Buffer> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  // 1. Dapatkan metadata file_path dari Telegram
  const getFileUrl = `https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`;
  const metaRes = await fetch(getFileUrl);
  if (!metaRes.ok) {
    throw new Error(
      `Failed to get file metadata from Telegram: ${metaRes.statusText}`,
    );
  }

  const metaData = await metaRes.json();
  const filePath = metaData.result?.file_path;
  if (!filePath) {
    throw new Error("File path not found in Telegram response");
  }

  // 2. Unduh binary audio dari Telegram
  const downloadUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
  const audioRes = await fetch(downloadUrl);
  if (!audioRes.ok) {
    throw new Error(
      `Failed to download audio file from Telegram: ${audioRes.statusText}`,
    );
  }

  const arrayBuffer = await audioRes.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Mentranskripsi audio OGG/Opus Telegram:
 * Prioritas 1: Google Gemini 1.5 Flash (GEMINI_API_KEY)
 * Prioritas 2: Groq Whisper (GROQ_API_KEY)
 * Prioritas 3: Wit.ai (WIT_AI_TOKEN - Fallback)
 */
export async function transcribeVoiceNote(
  audioBuffer: Buffer,
  token?: string,
): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;

  // 1. Prioritas Utama: Gemini 1.5 Flash
  if (geminiKey) {
    try {
      const text = await transcribeAudioWithGemini(
        audioBuffer,
        "audio/ogg",
        geminiKey,
      );
      if (text) return text;
    } catch (err) {
      console.warn(
        "[Voice Transcription] Gemini error, checking fallback:",
        err,
      );
    }
  }

  // 2. Prioritas Kedua: Groq Whisper
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const formData = new FormData();
      formData.append(
        "file",
        new Blob([audioBuffer as unknown as BlobPart], { type: "audio/ogg" }),
        "voice.ogg",
      );
      formData.append("model", "whisper-large-v3-turbo");
      formData.append("language", "id");

      const groqRes = await fetch(
        "https://api.groq.com/openai/v1/audio/transcriptions",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${groqKey}` },
          body: formData,
        },
      );

      if (groqRes.ok) {
        const groqData = await groqRes.json();
        if (groqData.text) return groqData.text.trim();
      }
    } catch (groqErr) {
      console.warn("[Voice Transcription] Groq error:", groqErr);
    }
  }

  // 3. Fallback: Wit.ai (Warisan)
  const witToken = token || process.env.WIT_AI_TOKEN;
  if (witToken) {
    const res = await fetch("https://api.wit.ai/speech?v=20240304", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${witToken}`,
        "Content-Type": "audio/ogg",
      },
      body: new Uint8Array(audioBuffer),
    });

    if (res.ok) {
      const responseText = await res.text();
      const lines = responseText.trim().split("\n");
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const json = JSON.parse(lines[i]);
          const resultText = json.text || json._text;
          if (resultText && typeof resultText === "string") {
            return resultText.trim();
          }
        } catch {}
      }
    }
  }

  if (!geminiKey && !groqKey && !witToken) {
    throw new Error("WIT_AI_TOKEN is not configured");
  }

  return "";
}
