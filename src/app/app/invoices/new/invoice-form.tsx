"use client";

import { useActionState, useMemo, useState } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format";
import { createInvoice, type InvoiceState } from "../actions";

type Customer = { id: string; name: string; company: string | null };
type Product = { id: string; name: string; salePrice: number; taxRate: number };

type Line = {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  taxRate: number;
};

const initial: InvoiceState = {};

export function InvoiceForm({
  customers,
  products,
}: {
  customers: Customer[];
  products: Product[];
}) {
  const [state, action, pending] = useActionState(createInvoice, initial);
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [discount, setDiscount] = useState(0);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((s, l) => s + l.quantity * l.price, 0);
    const tax = lines.reduce(
      (s, l) => s + l.quantity * l.price * (l.taxRate / 100),
      0,
    );
    return {
      subtotal,
      tax,
      total: Math.max(subtotal - discount, 0) + tax,
    };
  }, [lines, discount]);

  const addProduct = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
    setLines((prev) => [
      ...prev,
      { productId: p.id, name: p.name, quantity: 1, price: p.salePrice, taxRate: p.taxRate },
    ]);
  };

  const updateLine = (idx: number, patch: Partial<Line>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const removeLine = (idx: number) =>
    setLines((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <Link
        href="/app/invoices"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to invoices
      </Link>

      <form action={action} className="space-y-4">
        {state.message && (
          <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700">
            {state.message}
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle>New invoice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="customerId">Customer *</Label>
              <select
                id="customerId"
                name="customerId"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="h-10 rounded-xl border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Select a customer…</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.company ? ` (${c.company})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value=""
                onChange={(e) => e.target.value && addProduct(e.target.value)}
                className="h-10 flex-1 rounded-xl border border-input bg-card px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Add a product…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {formatCurrency(p.salePrice)}
                  </option>
                ))}
              </select>
            </div>

            {/* Line items */}
            <div className="space-y-2">
              {lines.map((line, idx) => (
                <div key={idx} className="grid grid-cols-12 items-end gap-2">
                  <div className="col-span-5">
                    <p className="truncate text-sm font-medium">{line.name}</p>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(idx, { quantity: Number(e.target.value) })}
                      aria-label="Quantity"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.price}
                      onChange={(e) => updateLine(idx, { price: Number(e.target.value) })}
                      aria-label="Price"
                    />
                  </div>
                  <div className="col-span-2 text-right text-sm">
                    {formatCurrency(line.quantity * line.price)}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {lines.length === 0 && (
                <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Add at least one product to create the invoice.
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-2xl bg-muted/60 p-4 text-sm">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Discount</span>
                <span>−{formatCurrency(Math.min(discount, totals.subtotal))}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Tax</span>
                <span>{formatCurrency(totals.tax)}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>

            <input type="hidden" name="items" value={JSON.stringify(lines)} />
            <TextareaField />

            <div className="flex justify-end gap-2 pt-1">
              <Button asChild variant="outline">
                <Link href="/app/invoices">Cancel</Link>
              </Button>
              <Button type="submit" disabled={pending || lines.length === 0}>
                {pending ? "Creating…" : "Create invoice"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

function TextareaField() {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="notes">Notes</Label>
      <textarea
        id="notes"
        name="notes"
        rows={2}
        className="w-full rounded-xl border border-input bg-card px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
