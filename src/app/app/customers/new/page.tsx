import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { CustomerForm } from "./customer-form";

export const metadata: Metadata = { title: "New customer" };

export default async function NewCustomerPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");
  return <CustomerForm currency={ctx.workspaceId ? "INR" : "INR"} />;
}
