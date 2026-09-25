"use server";

import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export type ProductState = { message?: string };

export async function createProduct(
  prevState: ProductState,
  formData: FormData,
): Promise<ProductState> {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/login");

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    sku: formData.get("sku") || undefined,
    barcode: formData.get("barcode") || undefined,
    hsnSac: formData.get("hsnSac") || undefined,
    salePrice: formData.get("salePrice") || 0,
    purchasePrice: formData.get("purchasePrice") || 0,
    taxRate: formData.get("taxRate") || 0,
    minStock: formData.get("minStock") || 0,
    trackInventory: formData.get("trackInventory") !== "off",
  });
  if (!parsed.success) {
    return { message: parsed.error.errors[0].message };
  }

  const product = await prisma.product.create({
    data: {
      organizationId: ctx.organizationId ?? ctx.workspaceId,
      workspaceId: ctx.workspaceId,
      name: parsed.data.name,
      sku: parsed.data.sku || null,
      barcode: parsed.data.barcode || null,
      hsnSac: parsed.data.hsnSac || null,
      salePrice: parsed.data.salePrice,
      purchasePrice: parsed.data.purchasePrice,
      taxRate: parsed.data.taxRate,
      minStock: parsed.data.minStock,
      trackInventory: parsed.data.trackInventory,
    },
  });

  await audit(
    { userId: ctx.userId, organizationId: ctx.organizationId ?? undefined, workspaceId: ctx.workspaceId },
    "product.created",
    "product",
    product.id,
  );

  redirect("/app/products");
}
