import { describe, it, expect, beforeEach, vi } from "vitest";
import { isRateLimited, _resetRateLimiter } from "../rate-limit";

describe("In-Memory Rate Limiter", () => {
  beforeEach(() => {
    _resetRateLimiter();
    vi.useRealTimers();
  });

  it("mengizinkan request di bawah batas maksimal", () => {
    expect(isRateLimited("user-1", 3, 1000)).toBe(false);
    expect(isRateLimited("user-1", 3, 1000)).toBe(false);
    expect(isRateLimited("user-1", 3, 1000)).toBe(false);
  });

  it("memblokir request saat melebihi kuota maksimal", () => {
    const key = "user-spam";
    const max = 2;

    expect(isRateLimited(key, max, 1000)).toBe(false);
    expect(isRateLimited(key, max, 1000)).toBe(false);
    // Request ke-3 melebihi batas 2
    expect(isRateLimited(key, max, 1000)).toBe(true);
  });

  it("menggunakan nilai default (maxRequests = 20, windowMs = 60.000)", () => {
    const key = "user-default";
    for (let i = 0; i < 20; i++) {
      expect(isRateLimited(key)).toBe(false);
    }
    // Request ke-21 harus terblokir
    expect(isRateLimited(key)).toBe(true);
  });

  it("mengisolasi kuota antar user/key yang berbeda", () => {
    expect(isRateLimited("user-a", 1, 1000)).toBe(false);
    expect(isRateLimited("user-a", 1, 1000)).toBe(true);

    // user-b tidak terpengaruh user-a
    expect(isRateLimited("user-b", 1, 1000)).toBe(false);
  });

  it("mereset kuota setelah rentang waktu windowMs berakhir", () => {
    vi.useFakeTimers();
    const key = "user-reset";

    expect(isRateLimited(key, 1, 1000)).toBe(false);
    expect(isRateLimited(key, 1, 1000)).toBe(true);

    // Majukan waktu melewati 1000ms
    vi.advanceTimersByTime(1001);

    // Kuota sudah direset
    expect(isRateLimited(key, 1, 1000)).toBe(false);
  });

  it("membersihkan entri kadaluarsa saat ukuran map melebihi 10.000 (memory management)", () => {
    vi.useFakeTimers();

    // Isi 10.001 entri simulasi
    for (let i = 0; i <= 10001; i++) {
      isRateLimited(`old-key-${i}`, 1, 100);
    }

    // Majukan waktu agar entri kadaluarsa
    vi.advanceTimersByTime(150);

    // Panggil satu request baru untuk memicu pembersihan sampah memori
    expect(isRateLimited("new-key", 1, 1000)).toBe(false);
  });
});