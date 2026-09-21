/**
 * Memvalidasi apakah request webhook benar-benar berasal dari Telegram
 * dengan membandingkan secret token pada header HTTP.
 */
export function validateTelegramWebhook(
  headerToken: string | null,
  secretToken?: string
): boolean {
  const expectedSecret = secretToken ?? process.env.TELEGRAM_SECRET_TOKEN;

  // Tolak jika secret token belum diset di environment
  if (!expectedSecret) {
    return false;
  }

  return headerToken === expectedSecret;
}