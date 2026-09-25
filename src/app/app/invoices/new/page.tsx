import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { InvoiceForm } from "./invoice-form";

export const metadata: Metadata = { title: "New invoice" };

export default async function NewInvoicePage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      where: { workspaceId: ctx.workspaceId },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { workspaceId: ctx.workspaceId, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <InvoiceForm
      customers={customers.map((c) => ({ id: c.id, name: c.name, company: c.company }))}
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        salePrice: p.salePrice,
        taxRate: p.taxRate,
      }))}
    />
  );
}
