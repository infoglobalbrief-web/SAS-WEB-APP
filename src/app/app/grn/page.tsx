import Link from "next/link";
import { redirect } from "next/navigation";
import { Truck, Plus } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/format";
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

export default async function GrnPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const grns = await prisma.grn.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { supplier: true, warehouse: true },
    orderBy: { receivedAt: "desc" },
    take: 100,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="GRN — Goods Receipt" description="Verify received goods and update stock.">
        <Button asChild>
          <Link href="/app/grn/new">
            <Plus className="h-4 w-4" /> New GRN
          </Link>
        </Button>
      </PageHeader>

      {grns.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-6 w-6" />}
          title="No goods receipts yet"
          description="Receive purchase orders, record accepted/rejected quantities, and post stock."
          actionLabel="New GRN"
          actionHref="/app/grn/new"
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grns.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-mono text-xs font-medium">{g.number}</TableCell>
                  <TableCell>{g.supplier.name}</TableCell>
                  <TableCell>{g.warehouse?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(g.receivedAt)}</TableCell>
                  <TableCell>
                    <Badge tone={g.status === "RECEIVED" ? "success" : g.status === "REJECTED" ? "danger" : "warning"}>
                      {g.status}
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
