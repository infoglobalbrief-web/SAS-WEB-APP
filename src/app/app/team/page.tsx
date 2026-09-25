import { redirect } from "next/navigation";
import { Users, UserPlus } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { formatDate, initials } from "@/lib/format";
import { ROLE_LABELS } from "@/lib/rbac";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");
  if (!ctx.organizationId) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Team"
          description="Invite people only after upgrading to a Team or Business plan."
        />
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Your personal workspace holds a single user. Create or join an organization
            to build a team.
          </CardContent>
        </Card>
      </div>
    );
  }

  const members = await prisma.organizationMember.findMany({
    where: { organizationId: ctx.organizationId },
    include: { user: true, teamMembers: { include: { team: true } } },
    orderBy: { joinedAt: "asc" },
  });

  const sub = await prisma.subscription.findFirst({
    where: { organizationId: ctx.organizationId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Team members"
        description={
          sub
            ? `${members.length} / ${sub.seatsPurchased} seats used`
            : `${members.length} members`
        }
      >
        <Button>
          <UserPlus className="h-4 w-4" /> Invite member
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 py-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {initials(m.user.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.user.name ?? m.user.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.user.email ?? m.user.phone ?? ""}
                    {m.teamMembers.length > 0 &&
                      ` · ${m.teamMembers.map((t) => t.team.name).join(", ")}`}
                  </p>
                </div>
                <Badge tone={m.status === "ACTIVE" ? "success" : m.status === "SUSPENDED" ? "danger" : "neutral"}>
                  {m.status}
                </Badge>
                <span className="w-36 text-right text-xs font-medium text-muted-foreground">
                  {ROLE_LABELS[m.role]}
                </span>
                <span className="hidden w-28 text-right text-xs text-muted-foreground md:block">
                  Joined {formatDate(m.joinedAt)}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        Seats only count active and invited members — deactivated users release seats
        (plan §20).
      </p>
    </div>
  );
}
