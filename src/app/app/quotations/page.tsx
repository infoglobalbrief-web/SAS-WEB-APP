import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Plus } from "lucide-react";
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

const TONE: Record<string, "success" | "warning" | "danger" | "info" | "neutral" | "default"> = {
  DRAFT: "neutral",
  SENT: "info",
  VIEWED: "info",
  ACCEPTED: "success",
  REJECTED: "danger",
  EXPIRED: "danger",
  CONVERTED: "success",
};

export default async function QuotationsPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const quotes = await prisma.quotation.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { customer: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Quotations"
        description="Send quotes, track views, and convert acceptances into orders."
      >
        <Button asChild>
          <Link href="/app/quotations/new">
            <Plus className="h-4 w-4" /> New quotation
          </Link>
        </Button>
      </PageHeader>

      {quotes.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No quotations yet"
          description="Quotations kick off the sales workflow — customer → quote → order → invoice."
          actionLabel="New quotation"
          actionHref="/app/quotations/new"
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Valid until</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="font-mono text-xs font-medium">{q.number}</TableCell>
                  <TableCell>{q.customer.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(q.validUntil)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(q.total)}
                  </TableCell>
                  <TableCell>
                    <Badge tone={TONE[q.status] ?? "default"}>{q.status}</Badge>
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
