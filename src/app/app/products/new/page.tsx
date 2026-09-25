import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getWorkspaceContext } from "@/lib/workspace";
import { ProductForm } from "./product-form";

export const metadata: Metadata = { title: "New product" };

export default async function NewProductPage() {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");
  return <ProductForm />;
}
