import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_CATEGORY_RULES = [
  {
    name: "Makanan & Minuman",
    keywords: [
      "makan", "minum", "kopi", "cafe", "coffee", "lunch", "dinner", "sarapan",
      "nasi", "ayam", "mie", "bakso", "sate", "burger", "pizza", "resto",
      "boba", "snack", "cemilan", "martabak", "gorengan", "roti"
    ],
  },
  {
    name: "Transportasi",
    keywords: [
      "bensin", "pertalite", "pertamax", "solar", "gojek", "goride", "gocar",
      "grab", "grabcar", "maxim", "ojol", "parkir", "tol",
      "krl", "mrt", "lrt", "busway", "kereta", "tiket kereta", "tiket pesawat", "tiket bus",
      "flight", "pesawat", "taxi", "taksi"
    ],
  },
  {
    name: "Belanja",
    keywords: [
      "belanja", "supermarket", "indomaret", "alfamart", "alfamidi", "groceries",
      "pasar", "baju", "kaos", "celana", "sepatu", "skincare", "sabun", "shampoo",
      "tokopedia", "shopee", "lazada", "tiktok shop"
    ],
  },
  {
    name: "Tagihan & Utilitas",
    keywords: [
      "listrik", "pln", "token", "air", "pdam", "wifi", "indihome", "firstmedia",
      "biznet", "pulsa", "kuota", "paket data", "bpjs", "iuran", "pajak"
    ],
  },
  {
    name: "Langganan & Hiburan",
    keywords: [
      "netflix", "spotify", "youtube", "disney", "prime", "steam", "game",
      "bioskop", "cinema", "xxi", "nonton", "buku", "topup"
    ],
  },
  {
    name: "Kesehatan",
    keywords: [
      "obat", "apotek", "dokter", "klinik", "rumah sakit", "rs", "vitamin", "masker"
    ],
  },
];

async function main() {
  console.log("🌱 Memulai seeding kategori default...");

  const users = await prisma.user.findMany();
  console.log(`Ditemukan ${users.length} user di database.`);

  for (const user of users) {
    console.log(`Menambahkan 6 kategori default untuk user: ${user.email || user.telegramChatId}...`);
    for (const rule of DEFAULT_CATEGORY_RULES) {
      await prisma.category.upsert({
        where: {
          userId_name: {
            userId: user.id,
            name: rule.name,
          },
        },
        update: {
          keywords: rule.keywords,
        },
        create: {
          userId: user.id,
          name: rule.name,
          keywords: rule.keywords,
        },
      });
    }
  }

  console.log("✅ Seeding kategori default selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });