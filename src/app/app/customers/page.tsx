import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const customers = await prisma.customer.findMany({
    where: { workspaceId: ctx.workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers"
        description="Manage the people and businesses you sell to."
      >
        <Button asChild>
          <Link href="/app/customers/new">
            <Plus className="h-4 w-4" /> New customer
          </Link>
        </Button>
      </PageHeader>

      {customers.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No customers yet"
          description="Add your first customer to start quoting, selling and invoicing."
          actionLabel="New customer"
          actionHref="/app/customers/new"
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.company ?? "—"}</TableCell>
                  <TableCell>
                    <span className="block text-xs">{c.email ?? "—"}</span>
                    <span className="block text-xs text-muted-foreground">
                      {c.phone ?? ""}
                    </span>
                  </TableCell>
                  <TableCell>{c.gstin ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Badge tone={c.outstanding > 0 ? "warning" : "neutral"}>
                      {formatCurrency(c.outstanding, c.currency)}
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
