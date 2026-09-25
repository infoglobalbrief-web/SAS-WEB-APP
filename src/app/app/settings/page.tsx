import { redirect } from "next/navigation";
import { Settings, Building2 } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" description="Workspace and account configuration." />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Core workspace details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Name" value={ctx.workspaceName} />
            <Row label="Slug" value={ctx.workspaceSlug} />
            <Row label="Type" value={ctx.isOrganization ? "Organization" : "Personal"} />
            <Row label="Workspace ID" value={ctx.workspaceId} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Sign-in and session security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings className="h-4 w-4" /> OTP login · resend cooldown · max 5 attempts
            </p>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" /> Email, mobile and Google identities link to one account
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
