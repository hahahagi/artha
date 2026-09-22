import { prisma } from "@/lib/prisma";
import { DEFAULT_CATEGORY_RULES } from "@/lib/parser/categorizer";

/**
 * Membuat atau memperbarui 6 kategori default beserta kata kuncinya untuk user tertentu.
 */
export async function seedUserDefaultCategories(userId: string) {
  for (const rule of DEFAULT_CATEGORY_RULES) {
    await prisma.category.upsert({
      where: {
        userId_name: {
          userId,
          name: rule.name,
        },
      },
      update: {
        keywords: rule.keywords,
      },
      create: {
        userId,
        name: rule.name,
        keywords: rule.keywords,
      },
    });
  }
}