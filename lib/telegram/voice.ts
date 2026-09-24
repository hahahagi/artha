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
 * Mentranskripsi audio OGG/Opus Telegram menggunakan Wit.ai Speech API (Gratis)
 */
export async function transcribeVoiceNote(
  audioBuffer: Buffer,
  token?: string,
): Promise<string> {
  const witToken = token || process.env.WIT_AI_TOKEN;
  if (!witToken) {
    throw new Error("WIT_AI_TOKEN is not configured");
  }

  const res = await fetch("https://api.wit.ai/speech?v=20240304", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${witToken}`,
      "Content-Type": "audio/ogg",
    },
    body: new Uint8Array(audioBuffer),
  });

  if (!res.ok) {
    throw new Error(`Wit.ai speech API error: ${res.status} ${res.statusText}`);
  }

  const responseText = await res.text();

  // Wit.ai dapat mengembalikan stream chunked JSON dipisah newline
  const lines = responseText.trim().split("\n");
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const json = JSON.parse(lines[i]);
      const resultText = json.text || json._text;
      if (resultText && typeof resultText === "string") {
        return resultText.trim();
      }
    } catch {
      // Lewati baris yang bukan JSON valid
    }
  }

  return "";
}
