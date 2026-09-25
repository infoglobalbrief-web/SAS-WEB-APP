import { redirect } from "next/navigation";
import { Users, Boxes, ReceiptText, Warehouse } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { getUsageSnapshot } from "@/lib/entitlements";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const STATE_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral" | "default"> = {
  TRIAL: "info",
  ACTIVE: "success",
  PAST_DUE: "danger",
  GRACE_PERIOD: "warning",
  SUSPENDED: "danger",
  CANCELLED: "neutral",
  EXPIRED: "neutral",
};

function ent(sub: { plan: { entitlements: { featureKey: string; value: string }[] } }, key: string) {
  const raw = sub.plan.entitlements.find((e) => e.featureKey === key)?.value;
  if (raw === "unlimited" || raw === undefined) return Infinity;
  const n = Number(raw);
  return Number.isFinite(n) ? n : Infinity;
}

function fmtLimit(v: number) {
  return v === Infinity ? "Unlimited" : String(v);
}

export default async function SubscriptionPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");
  if (!ctx.organizationId) redirect("/onboarding");

  const orgId = ctx.organizationId;
  const [sub, usage, membersCount, events] = await Promise.all([
    prisma.subscription.findFirst({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      include: { plan: { include: { entitlements: true } } },
    }),
    getUsageSnapshot(orgId),
    prisma.organizationMember.count({ where: { organizationId: orgId, status: { in: ["ACTIVE", "INVITED", "PENDING"] } } }),
    prisma.subscriptionEvent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!sub) redirect("/onboarding");

  const rows = [
    { icon: Users, label: "Users", used: usage.users, limit: ent(sub, "users.max") },
    { icon: Boxes, label: "Products", used: usage.products, limit: ent(sub, "products.max") },
    { icon: ReceiptText, label: "Invoices", used: usage.invoices, limit: ent(sub, "invoices.monthly") },
    { icon: Warehouse, label: "Warehouses", used: usage.warehouses, limit: ent(sub, "warehouses.max") },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Subscription" description="Plan, usage and billing for this workspace." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current plan */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current plan</CardTitle>
              <Badge tone={STATE_TONE[sub.state] ?? "default"}>{sub.state}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold">{sub.plan.name}</p>
              <p className="text-sm text-muted-foreground">{sub.plan.description}</p>
            </div>
            <div>
              <p className="text-3xl font-bold tracking-tight">
                {sub.plan.monthlyPrice > 0 ? formatCurrency(sub.plan.monthlyPrice) : "Custom"}
                {sub.plan.monthlyPrice > 0 && (
                  <span className="text-sm font-normal text-muted-foreground"> /month</span>
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {sub.state === "TRIAL" && sub.trialEndsAt
                  ? `Trial ends ${formatDate(sub.trialEndsAt)}`
                  : `Next billing ${formatDate(sub.currentPeriodEnd)}`}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seats</span>
                <span className="font-medium">
                  {membersCount} / {sub.seatsPurchased}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Billing cycle</span>
                <span className="font-medium">{sub.billingCycle}</span>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1">Manage plan</Button>
              <Button variant="outline" className="flex-1">Billing history</Button>
            </div>
          </CardContent>
        </Card>

        {/* Usage meters (plan §18-19) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {rows.map((row) => {
              const pct =
                row.limit === Infinity ? 0 : Math.min(100, Math.round((row.used / row.limit) * 100));
              return (
                <div key={row.label}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <row.icon className="h-4 w-4" /> {row.label}
                    </span>
                    <span className="font-medium">
                      {row.used.toLocaleString()} / {fmtLimit(row.limit)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-muted-foreground">
              Limits are entitlement data, not code — pricing changes never require a
              redeployment.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Billing events (plan §32) */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Billing events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No billing events yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {events.map((e) => (
                <li key={e.id} className="flex items-center justify-between py-2">
                  <span className="font-medium">{e.type.replace(/_/g, " ")}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(e.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
