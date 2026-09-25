import Link from "next/link";
import { redirect } from "next/navigation";
import { Boxes, Plus } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatNumber } from "@/lib/format";
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

export default async function ProductsPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const products = await prisma.product.findMany({
    where: { workspaceId: ctx.workspaceId },
    include: { stocks: true, unit: true, category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Products" description="Your catalog — items you sell and stock.">
        <Button asChild>
          <Link href="/app/products/new">
            <Plus className="h-4 w-4" /> New product
          </Link>
        </Button>
      </PageHeader>

      {products.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-6 w-6" />}
          title="No products yet"
          description="Add products to track stock, generate quotations and invoice line items."
          actionLabel="New product"
          actionHref="/app/products/new"
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Sale price</TableHead>
                <TableHead className="text-right">In stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => {
                const stock = p.stocks.reduce((a, s) => a + s.quantity, 0);
                const low = p.trackInventory && stock <= p.minStock;
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className="font-medium">{p.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {p.hsnSac ? `HSN/SAC ${p.hsnSac}` : ""}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.sku ?? "—"}</TableCell>
                    <TableCell>{p.category?.name ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(p.salePrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.trackInventory ? formatNumber(stock) : "—"}
                    </TableCell>
                    <TableCell>
                      {!p.isActive ? (
                        <Badge tone="neutral">Inactive</Badge>
                      ) : low ? (
                        <Badge tone="danger">Low stock</Badge>
                      ) : (
                        <Badge tone="success">Active</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
