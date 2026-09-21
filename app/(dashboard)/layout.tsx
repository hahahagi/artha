import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";

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
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Sidebar untuk Desktop */}
      <DashboardSidebar userEmail={user.email} />

      {/* Konten Utama */}
      <div className="flex flex-1 flex-col">
        <DashboardHeader userEmail={user.email} />
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}