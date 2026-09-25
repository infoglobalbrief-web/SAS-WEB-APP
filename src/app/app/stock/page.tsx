import { redirect } from "next/navigation";
import { PackageSearch } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/format";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
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

export default async function StockPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const stocks = await prisma.warehouseStock.findMany({
    where: { warehouse: { workspaceId: ctx.workspaceId } },
    include: { product: true, warehouse: true },
    orderBy: { quantity: "asc" },
  });

  const totalUnits = stocks.reduce((s, x) => s + x.quantity, 0);
  const lowCount = stocks.filter((s) => s.product.trackInventory && s.quantity <= s.product.minStock).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Stock"
        description={`${formatNumber(totalUnits)} units across ${stocks.length} stock entries.`}
      />

      {stocks.length === 0 ? (
        <EmptyState
          icon={<PackageSearch className="h-6 w-6" />}
          title="No stock movements yet"
          description="Stock is created from goods receipts (GRN) and adjusted from sales."
        />
      ) : (
        <div className="rounded-2xl border bg-card shadow-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Min stock</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stocks.map((s) => {
                const low = s.product.trackInventory && s.quantity <= s.product.minStock;
                return (
                  <TableRow key={`${s.warehouseId}-${s.productId}`}>
                    <TableCell className="font-medium">{s.product.name}</TableCell>
                    <TableCell>{s.warehouse.name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatNumber(s.quantity)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatNumber(s.product.minStock)}
                    </TableCell>
                    <TableCell>
                      {low ? (
                        <Badge tone="danger">
                          {s.quantity <= 0 ? "Out of stock" : "Low stock"}
                        </Badge>
                      ) : (
                        <Badge tone="success">Healthy</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {lowCount > 0 && (
        <p className="mt-4 text-sm text-amber-600">
          {lowCount} product{lowCount === 1 ? "" : "s"} at or below minimum stock.
        </p>
      )}
    </div>
  );
}
