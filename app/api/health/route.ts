import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getBotMe } from "@/lib/telegram/bot";

export async function GET() {
  const startTime = Date.now();
  const checks: {
    database: { status: "connected" | "error"; latencyMs?: number; error?: string };
    telegramBot: { status: "connected" | "error"; username?: string; error?: string };
  } = {
    database: { status: "error" },
    telegramBot: { status: "error" },
  };

  let isHealthy = true;

  // 1. Uji Koneksi Database Prisma (Ping Query)
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: "connected",
      latencyMs: Date.now() - dbStart,
    };
  } catch (dbErr) {
    isHealthy = false;
    checks.database = {
      status: "error",
      error: (dbErr as Error).message,
    };
  }

  // 2. Uji Koneksi Telegram Bot API
  try {
    const botInfo = await getBotMe();
    if (botInfo?.ok && botInfo.result) {
      checks.telegramBot = {
        status: "connected",
        username: `@${botInfo.result.username}`,
      };
    } else {
      checks.telegramBot = {
        status: "error",
        error: botInfo?.description || "Invalid bot token",
      };
    }
  } catch (botErr) {
    checks.telegramBot = {
      status: "error",
      error: (botErr as Error).message,
    };
  }

  const responsePayload = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    totalLatencyMs: Date.now() - startTime,
    uptimeSeconds: Math.round(process.uptime()),
    services: checks,
  };

  return NextResponse.json(responsePayload, {
    status: isHealthy ? 200 : 503,
  });
}