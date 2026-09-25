import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/get-user";
import { listWorkspacesForUser } from "@/lib/tenant";
import { Sidebar } from "@/components/app/sidebar";
import { Topbar } from "@/components/app/topbar";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireUser();
  const workspaces = await listWorkspacesForUser(session.user.id);
  if (workspaces.length === 0) redirect("/onboarding");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={session.user} workspaces={workspaces} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
