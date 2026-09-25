import { redirect } from "next/navigation";
import { BarChart3, Download, FileSpreadsheet } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { formatCompactCurrency } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const [salesTotal, paymentsTotal, expensesTotal, invoiced, received] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId: ctx.workspaceId, status: { not: "VOID" } },
      _sum: { total: true },
    }),
    prisma.payment.aggregate({ where: { workspaceId: ctx.workspaceId }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { workspaceId: ctx.workspaceId }, _sum: { amount: true } }),
    prisma.invoice.count({ where: { workspaceId: ctx.workspaceId } }),
    prisma.payment.count({ where: { workspaceId: ctx.workspaceId } }),
  ]);

  const reports = [
    { name: "Sales summary", desc: "Invoices and totals by period" },
    { name: "Sales by customer", desc: "Revenue per customer" },
    { name: "Sales by product", desc: "Units and value per product" },
    { name: "Stock summary", desc: "Current stock across warehouses" },
    { name: "Stock valuation", desc: "Value of inventory on hand" },
    { name: "Low / out of stock", desc: "Reorder candidates" },
    { name: "Purchase summary", desc: "Purchases and GRN received" },
    { name: "Receivables", desc: "Outstanding customer balances" },
    { name: "Payables", desc: "Supplier balances due" },
    { name: "Profit summary", desc: "Revenue minus expenses" },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports"
        description="Sales, inventory, purchase and finance — all scoped to this workspace."
      >
        <Button variant="outline">
          <Download className="h-4 w-4" /> Export
        </Button>
      </PageHeader>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Invoiced" value={formatCompactCurrency(salesTotal._sum.total ?? 0)} icon={BarChart3} />
        <StatCard label="Received" value={formatCompactCurrency(paymentsTotal._sum.amount ?? 0)} icon={BarChart3} tone="success" />
        <StatCard label="Expenses" value={formatCompactCurrency(expensesTotal._sum.amount ?? 0)} icon={FileSpreadsheet} tone="warning" />
        <StatCard
          label="Invoices / Payments"
          value={`${invoiced} / ${received}`}
          icon={BarChart3}
          tone="info"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <Card key={r.name} className="transition-transform hover:-translate-y-0.5">
            <CardHeader>
              <CardTitle className="text-base">{r.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
