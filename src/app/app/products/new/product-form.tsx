"use client";

import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createProduct, type ProductState } from "../actions";

const initial: ProductState = {};

export function ProductForm() {
  const [state, action, pending] = useActionState(createProduct, initial);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <Link
        href="/app/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New product</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-4">
            {state.message && (
              <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700">
                {state.message}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="name">Product name *</Label>
                <Input id="name" name="name" required placeholder="Widget A" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="barcode">Barcode</Label>
                <Input id="barcode" name="barcode" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="hsnSac">HSN / SAC</Label>
                <Input id="hsnSac" name="hsnSac" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="salePrice">Sale price</Label>
                <Input id="salePrice" name="salePrice" type="number" min="0" step="0.01" defaultValue="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="purchasePrice">Purchase price</Label>
                <Input id="purchasePrice" name="purchasePrice" type="number" min="0" step="0.01" defaultValue="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="taxRate">Tax rate (%)</Label>
                <Input id="taxRate" name="taxRate" type="number" min="0" max="100" step="0.01" defaultValue="0" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="minStock">Minimum stock</Label>
                <Input id="minStock" name="minStock" type="number" min="0" step="0.01" defaultValue="0" />
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" name="trackInventory" defaultChecked className="h-4 w-4" />
                Track inventory for this product
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button asChild variant="outline">
                <Link href="/app/products">Cancel</Link>
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
