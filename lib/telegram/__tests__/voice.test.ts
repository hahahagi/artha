import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadTelegramFile, transcribeVoiceNote } from "../voice";

describe("Voice Note Transcription", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.TELEGRAM_BOT_TOKEN = "mock-bot-token";
    process.env.WIT_AI_TOKEN = "mock-wit-token";
  });

  describe("downloadTelegramFile", () => {
    it("mengunduh file audio telegram dengan sukses", async () => {
      const mockMeta = { ok: true, result: { file_path: "voice/file_1.oga" } };
      const mockAudio = new Uint8Array([1, 2, 3, 4]).buffer;

      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockMeta,
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          arrayBuffer: async () => mockAudio,
        } as unknown as Response);

      const buffer = await downloadTelegramFile("file-123");
      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBe(4);
    });

    it("melempar error jika TELEGRAM_BOT_TOKEN tidak ada", async () => {
      delete process.env.TELEGRAM_BOT_TOKEN;
      await expect(downloadTelegramFile("file-123")).rejects.toThrow(
        "TELEGRAM_BOT_TOKEN is not configured",
      );
    });
  });

  describe("transcribeVoiceNote", () => {
    it("mentranskripsi audio menjadi teks dari single json", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ text: "kopi 25 ribu" }),
      } as unknown as Response);

      const res = await transcribeVoiceNote(Buffer.from("dummy"));
      expect(res).toBe("kopi 25 ribu");
    });

    it("mendukung format _text warisan Wit.ai", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ _text: "bensin 30000" }),
      } as unknown as Response);

      const res = await transcribeVoiceNote(Buffer.from("dummy"));
      expect(res).toBe("bensin 30000");
    });

    it("menangani response chunked newline-delimited dari Wit.ai", async () => {
      const chunked = `{"text":"kopi"}\n{"text":"kopi susu 25k","is_final":true}`;
      vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
        ok: true,
        text: async () => chunked,
      } as unknown as Response);

      const res = await transcribeVoiceNote(Buffer.from("dummy"));
      expect(res).toBe("kopi susu 25k");
    });

    it("melempar error jika WIT_AI_TOKEN tidak ada", async () => {
      delete process.env.WIT_AI_TOKEN;
      await expect(transcribeVoiceNote(Buffer.from("dummy"))).rejects.toThrow(
        "WIT_AI_TOKEN is not configured",
      );
    });
  });
});