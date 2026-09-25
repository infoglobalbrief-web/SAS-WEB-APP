"use client";

import { useActionState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createCustomer, type CustomerState } from "../actions";

const initial: CustomerState = {};

export function CustomerForm({ currency }: { currency: string }) {
  const [state, action, pending] = useActionState(createCustomer, initial);

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <Link
        href="/app/customers"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to customers
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New customer</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="flex flex-col gap-4">
            {state.message && (
              <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700">
                {state.message}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Full name *</Label>
                <Input id="name" name="name" required placeholder="Rahul Sharma" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="company">Company</Label>
                <Input id="company" name="company" placeholder="ABC Traders" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="gstin">GSTIN</Label>
                <Input id="gstin" name="gstin" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue={currency} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button asChild variant="outline">
                <Link href="/app/customers">Cancel</Link>
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save customer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
