import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/**
 * Helper untuk mengamankan karakter koma, tanda kutip, dan baris baru di CSV (RFC 4180)
 */
function escapeCsv(field: string | number | null | undefined): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User tidak ditemukan." }, { status: 404 });
    }

    // Ambil seluruh data pengeluaran user
    const expenses = await prisma.expense.findMany({
      where: { userId: dbUser.id },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    // Susun baris CSV
    const rows = expenses.map((exp) => {
      const dateStr = new Date(exp.createdAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const categoryName = exp.category?.name || "Lainnya";
      const walletName = exp.wallet || "Cash";

      return [
        escapeCsv(dateStr),
        escapeCsv(exp.itemName),
        escapeCsv(exp.amount),
        escapeCsv(exp.currency),
        escapeCsv(categoryName),
        escapeCsv(walletName),
        escapeCsv(exp.source),
      ].join(",");
    });

    // Header kolom
    const header = "Tanggal,Nama Item,Nominal,Mata Uang,Kategori,Sumber Dana,Platform Input";
    
    // Gunakan UTF-8 BOM (\uFEFF) agar Excel di Windows membaca huruf dan simbol dengan benar
    const csvContent = "\uFEFF" + [header, ...rows].join("\r\n");

    const todayStr = new Date().toISOString().split("T")[0];
    const filename = `artha-expenses-${todayStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("[CSV Export Error]:", error);
    return NextResponse.json(
      { error: "Gagal mengekspor data pengeluaran." },
      { status: 500 }
    );
  }
}