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
});