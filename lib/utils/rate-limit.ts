interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory store untuk mencatat jumlah request per key
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Simple in-memory rate limiter per key (contoh: chatId pengguna).
 *
 * @param key - Identifier unik (contoh: `telegram:123456`)
 * @param maxRequests - Batas maksimal pesan dalam satu rentang waktu (default: 20)
 * @param windowMs - Rentang waktu dalam milidetik (default: 60.000 ms / 1 menit)
 * @returns boolean - true jika terkena rate limit (harus diblokir), false jika masih aman
 */
export function isRateLimited(
  key: string,
  maxRequests = 20,
  windowMs = 60_000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  // Bersihkan memori jika ukuran Map mulai membesar (> 10.000 entri)
  if (rateLimitMap.size > 10_000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now > v.resetAt) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  record.count++;
  return record.count > maxRequests;
}

/**
 * Helper khusus pengujian untuk membersihkan state map
 */
export function _resetRateLimiter() {
  rateLimitMap.clear();
}