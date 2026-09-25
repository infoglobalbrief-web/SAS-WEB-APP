import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth/get-user";
import { listWorkspacesForUser } from "@/lib/tenant";

export default async function Home() {
  const session = await getAuthUser();

  if (session) {
    // A signed-in user with no workspace must finish onboarding first.
    const workspaces = await listWorkspacesForUser(session.user.id);
    if (workspaces.length > 0) redirect("/app");
    redirect("/onboarding");
  }

  redirect("/");
}
