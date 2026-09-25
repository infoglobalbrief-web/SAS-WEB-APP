import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, Plus } from "lucide-react";
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

export default async function PaymentsPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const payments = await prisma.payment.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { customer: true, invoice: true },
    orderBy: { receivedAt: "desc" },
    take: 100,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Payments" description="Record and track payments received.">
        <Button asChild>
          <Link href="/app/payments/new">
            <Plus className="h-4 w-4" /> Record payment
          </Link>
        </Button>
      </PageHeader>

      {payments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="h-6 w-6" />}
          title="No payments yet"
          description="Record a payment to settle invoices and keep outstanding amounts accurate."
          actionLabel="Record payment"
          actionHref="/app/payments/new"
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-muted-foreground">
                    {formatDate(p.receivedAt)}
                  </TableCell>
                  <TableCell>{p.customer?.name ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{p.invoice?.number ?? "—"}</TableCell>
                  <TableCell>
                    <Badge tone="info">{p.method.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(p.amount)}
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
