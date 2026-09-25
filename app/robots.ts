import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://arthabot.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login", "/register"],
      disallow: ["/api/", "/settings", "/expenses", "/subscriptions", "/budgets"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}