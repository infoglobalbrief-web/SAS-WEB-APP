import { redirect } from "next/navigation";
import {
  ReceiptText,
  Wallet,
  TrendingUp,
  Clock,
  Boxes,
  PackageSearch,
  Users,
} from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { formatCompactCurrency, formatCurrency, formatNumber } from "@/lib/format";
import { StatCard } from "@/components/ui/stat";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SalesChart } from "./sales-chart";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const userId = ctx.userId;

  // KPIs scoped to the active workspace/org only (plan §74 tenant isolation).
  const [invoicesAgg, customersCount, productsCount, stockTotal, openQuotes, paidAgg] =
    await Promise.all([
      prisma.invoice.aggregate({
        where: { workspaceId: ctx.workspaceId, status: { not: "VOID" } },
        _sum: { total: true, paid: true },
      }),
      prisma.customer.count({ where: { workspaceId: ctx.workspaceId } }),
      prisma.product.count({ where: { workspaceId: ctx.workspaceId } }),
      prisma.warehouseStock.aggregate({
        where: { warehouse: { workspaceId: ctx.workspaceId } },
        _sum: { quantity: true },
      }),
      prisma.quotation.count({
        where: { workspaceId: ctx.workspaceId, status: { in: ["SENT", "VIEWED"] } },
      }),
      prisma.payment.aggregate({
        where: { workspaceId: ctx.workspaceId },
        _sum: { amount: true },
      }),
    ]);

  const totalSales = invoicesAgg._sum.total ?? 0;
  const totalPaid = invoicesAgg._sum.paid ?? 0;
  const due = invoicesAgg._sum.total ?? 0 - (paidAgg._sum.amount ?? 0);

  const userName =
    (await prisma.user.findUnique({ where: { id: userId } }))?.firstName ?? "there";

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Good morning, {userName}</h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening in {ctx.workspaceName}.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Sales"
          value={formatCompactCurrency(totalSales)}
          hint={`${formatNumber(await prisma.invoice.count({ where: { workspaceId: ctx.workspaceId } }))} invoices`}
          icon={ReceiptText}
          tone="default"
        />
        <StatCard
          label="Collected"
          value={formatCompactCurrency(paidAgg._sum.amount ?? 0)}
          hint="Payments received"
          icon={Wallet}
          tone="success"
        />
        <StatCard
          label="Outstanding"
          value={formatCompactCurrency(Math.max(due, 0))}
          hint="Awaiting payment"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Profit (est.)"
          value={formatCompactCurrency((paidAgg._sum.amount ?? 0) * 0.22)}
          hint="Estimated margin"
          icon={TrendingUp}
          tone="info"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales overview</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <SalesChart
              totalSales={totalSales}
              totalPaid={paidAgg._sum.amount ?? 0}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Business health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <HealthRow
                icon={<Users className="h-4 w-4" />}
                label="Customers"
                value={formatNumber(customersCount)}
              />
              <HealthRow
                icon={<Boxes className="h-4 w-4" />}
                label="Products"
                value={formatNumber(productsCount)}
              />
              <HealthRow
                icon={<PackageSearch className="h-4 w-4" />}
                label="Units in stock"
                value={formatNumber(stockTotal._sum.quantity ?? 0)}
              />
              <HealthRow
                icon={<ReceiptText className="h-4 w-4" />}
                label="Open quotations"
                value={formatNumber(openQuotes)}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function HealthRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
