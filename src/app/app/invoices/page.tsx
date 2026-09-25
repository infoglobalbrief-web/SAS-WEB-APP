import Link from "next/link";
import { redirect } from "next/navigation";
import { ReceiptText, Plus } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral" | "default"> = {
  DRAFT: "neutral",
  SENT: "info",
  PAID: "success",
  PARTIALLY_PAID: "warning",
  OVERDUE: "danger",
  VOID: "danger",
};

export default async function InvoicesPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const invoices = await prisma.invoice.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Invoices" description="Create, send and track invoices and payments.">
        <Button asChild>
          <Link href="/app/invoices/new">
            <Plus className="h-4 w-4" /> New invoice
          </Link>
        </Button>
      </PageHeader>

      {invoices.length === 0 ? (
        <EmptyState
          icon={<ReceiptText className="h-6 w-6" />}
          title="No invoices yet"
          description="Create your first invoice — GST breakdown, payments and receipts come built in."
          actionLabel="New invoice"
          actionHref="/app/invoices/new"
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-medium">
                    {inv.number}
                  </TableCell>
                  <TableCell>{inv.customer.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(inv.createdAt)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(inv.total)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(inv.paid)}
                  </TableCell>
                  <TableCell>
                    <Badge tone={STATUS_TONE[inv.status] ?? "default"}>
                      {inv.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
