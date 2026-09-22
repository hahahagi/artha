import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { PwaInstallPrompt } from "@/components/dashboard/pwa-install-prompt";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar untuk Desktop */}
      <DashboardSidebar userEmail={user.email} />
      {/* Konten Utama */}
      <div className="flex flex-1 flex-col min-w-0">
        <DashboardHeader userEmail={user.email} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
      {/* Pop-up Rekomendasi Install PWA */}
      <PwaInstallPrompt />
    </div>
  );
}