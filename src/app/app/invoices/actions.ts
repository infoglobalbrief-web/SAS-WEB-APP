"use server";

import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { documentSchema } from "@/lib/validations";
import { nextNumber } from "@/lib/numbers";
import { audit } from "@/lib/audit";

export type InvoiceState = { message?: string };

type LineItem = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  taxRate: number;
};

function computeTotals(items: LineItem[], discount: number) {
  const itemTax = items.reduce(
    (sum, i) => sum + i.quantity * i.price * (i.taxRate / 100),
    0,
  );
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  const discounted = Math.max(subtotal - discount, 0);
  return {
    subtotal: round2(subtotal),
    discount: round2(discount),
    tax: round2(items.reduce((s, i) => s + i.quantity * i.price, 0) === subtotal ? itemTax : itemTax),
    total: round2(discounted + itemTax),
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function createInvoice(
  prevState: InvoiceState,
  formData: FormData,
): Promise<InvoiceState> {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/login");

  const itemsRaw = String(formData.get("items") ?? "[]");
  let items: LineItem[] = [];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    return { message: "Invalid line items" };
  }

  const parsed = documentSchema.safeParse({
    customerId: formData.get("customerId"),
    items,
    discount: formData.get("discount") || 0,
    notes: formData.get("notes") || undefined,
    terms: formData.get("terms") || undefined,
  });
  if (!parsed.success) {
    return { message: parsed.error.errors[0].message };
  }

  const totals = computeTotals(parsed.data.items, parsed.data.discount);
  const number = await nextNumber(ctx.workspaceId, "INV");

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: ctx.organizationId ?? ctx.workspaceId,
      workspaceId: ctx.workspaceId,
      customerId: parsed.data.customerId,
      number,
      status: "SENT",
      lineItems: JSON.stringify(parsed.data.items),
      subtotal: totals.subtotal,
      discount: totals.discount,
      tax: totals.tax,
      total: totals.total,
      paid: 0,
    },
  });

  await audit(
    { userId: ctx.userId, organizationId: ctx.organizationId ?? undefined, workspaceId: ctx.workspaceId },
    "invoice.created",
    "invoice",
    invoice.id,
  );

  redirect("/app/invoices");
}
