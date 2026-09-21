import { describe, it, expect } from "vitest";
import { validateTelegramWebhook } from "../validate";

describe("Telegram Webhook Validation", () => {
  const SECRET = "super-secret-token-123";

  it("mengembalikan true jika secret token cocok", () => {
    expect(validateTelegramWebhook(SECRET, SECRET)).toBe(true);
  });

  it("mengembalikan false jika secret token salah", () => {
    expect(validateTelegramWebhook("wrong-token", SECRET)).toBe(false);
  });

  it("mengembalikan false jika header token bernilai null", () => {
    expect(validateTelegramWebhook(null, SECRET)).toBe(false);
  });

  it("mengembalikan false jika expected secret kosong", () => {
    expect(validateTelegramWebhook(SECRET, "")).toBe(false);
  });
});