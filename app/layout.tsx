import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa-register";
import { FeedbackProvider } from "@/components/ui/feedback-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://arthabot.vercel.app",
  ),
  title: "Artha — Zero-Friction Expense & Subscription Tracker",
  description:
    "Catat pengeluaran harian, split bill, scan struk OCR, dan kelola pengingat langganan tanpa ribet via Telegram Bot dan Web Dashboard.",
  applicationName: "Artha",
  keywords: [
    "Artha",
    "Artha Bot",
    "catat pengeluaran telegram",
    "expense tracker indonesia",
    "bot keuangan telegram",
    "split bill",
    "pengingat langganan",
  ],
  verification: {
    // 👇 Tempelkan kode content dari Google Search Console di sini:
    google: "J8eW06RPzOHZiNDLsywbsoQaYL-L31rUJ7xhfIO-PH4",
  },
  openGraph: {
    title: "Artha — Zero-Friction Expense & Subscription Tracker",
    description:
      "Catat pengeluaran semudah chatting & voice note di Telegram, lengkap dengan Web Dashboard dan sinkronisasi Google Sheets.",
    url: "https://arthabot.vercel.app",
    siteName: "Artha",
    locale: "id_ID",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Artha",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('artha_theme');
                  var supportDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <FeedbackProvider>
          {children}
          <PwaRegister />
        </FeedbackProvider>
      </body>
    </html>
  );
}
