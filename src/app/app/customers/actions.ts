"use server";

import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export type CustomerState = { message?: string };

export async function createCustomer(
  prevState: CustomerState,
  formData: FormData,
): Promise<CustomerState> {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/login");

  const parsed = customerSchema.safeParse({
    name: formData.get("name"),
    company: formData.get("company") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    gstin: formData.get("gstin") || undefined,
    currency: formData.get("currency") || "INR",
  });
  if (!parsed.success) {
    return { message: parsed.error.errors[0].message };
  }

  const customer = await prisma.customer.create({
    data: {
      organizationId: ctx.organizationId ?? ctx.workspaceId,
      workspaceId: ctx.workspaceId,
      name: parsed.data.name,
      company: parsed.data.company ?? null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      gstin: parsed.data.gstin || null,
      currency: parsed.data.currency,
    },
  });

  await audit(
    { userId: ctx.userId, organizationId: ctx.organizationId ?? undefined, workspaceId: ctx.workspaceId },
    "customer.created",
    "customer",
    customer.id,
  );

  redirect("/app/customers");
}
