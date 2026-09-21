import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware pada semua rute KECUALI:
     * - _next/static (file statis Next.js)
     * - _next/image (optimasi gambar)
     * - favicon.ico (ikon tab browser)
     * - file ekstensi gambar / font (.svg, .png, dll)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};