import { prisma } from "@/lib/prisma";

export type DocKind = "quotation" | "sales_order" | "invoice" | "purchase_order" | "grn" | "payment";

// Simple sequential document numbering per workspace: PREFIX-YYYY-XXXX.
export async function nextNumber(
  workspaceId: string,
  prefix: string,
): Promise<string> {
  const year = new Date().getFullYear();

  const counts = await Promise.all([
    prisma.quotation.count({ where: { workspaceId, number: { startsWith: `${prefix}-${year}` } } }),
    prisma.salesOrder.count({ where: { workspaceId, number: { startsWith: `${prefix}-${year}` } } }),
    prisma.invoice.count({ where: { workspaceId, number: { startsWith: `${prefix}-${year}` } } }),
    prisma.purchaseOrder.count({ where: { workspaceId, number: { startsWith: `${prefix}-${year}` } } }),
    prisma.grn.count({ where: { workspaceId, number: { startsWith: `${prefix}-${year}` } } }),
  ]);
  const total = counts.reduce((a, b) => a + b, 0) + 1;
  return `${prefix}-${year}-${String(total).padStart(4, "0")}`;
}
