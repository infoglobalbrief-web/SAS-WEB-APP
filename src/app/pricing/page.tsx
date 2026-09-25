import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav, MarketingFooter } from "@/components/marketing/nav";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { PricingToggle } from "./pricing-toggle";

export const dynamic = "force-dynamic";

const FEATURE_NAMES: Record<string, string> = {
  "users.max": "Users",
  "customers.max": "Customers",
  "products.max": "Products",
  "warehouses.max": "Warehouses",
  "invoices.monthly": "Invoices / month",
  "inventory.enabled": "Inventory",
  "grn.enabled": "GRN",
  "reports.level": "Reports",
  "teams.enabled": "Teams",
  "approvals.enabled": "Approvals",
  "api.enabled": "API",
  "whatsapp.enabled": "WhatsApp",
  "ai.enabled": "AI Insights",
  "support.level": "Support",
};

function humanize(planCode: string, key: string, value: string) {
  if (value === "unlimited") return `Unlimited ${FEATURE_NAMES[key] ?? key}`;
  if (value === "true") return FEATURE_NAMES[key] ?? key;
  if (value === "false") return null;
  if (value === "basic") return `Basic ${FEATURE_NAMES[key] ?? key}`;
  if (value === "advanced") return `Advanced ${FEATURE_NAMES[key] ?? key}`;
  if (value === "standard") return "Standard support";
  if (value === "priority") return "Priority support";
  if (value === "dedicated") return "Dedicated support";
  if (value === "optional" || value === "custom") return `${FEATURE_NAMES[key] ?? key} (${value})`;
  if (/^\d+$/.test(value) && key.endsWith(".max")) {
    return `Up to ${Number(value).toLocaleString()} ${FEATURE_NAMES[key] ?? key}`;
  }
  if (/^\d+$/.test(value) && key === "invoices.monthly") {
    return `${Number(value).toLocaleString()} invoices/month`;
  }
  return `${FEATURE_NAMES[key] ?? key}: ${value}`;
}

export default async function PricingPage() {
  const plans = await prisma.subscriptionPlan.findMany({
    where: { published: true },
    orderBy: { tier: "asc" },
    include: { entitlements: true },
  });

  return (
    <main className="min-h-screen">
      <MarketingNav />
      <section className="container py-20">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple, scalable pricing</h1>
          <p className="max-w-xl text-muted-foreground">
            Managed entirely from the admin panel — change prices and limits
            without touching code.
          </p>
          <PricingToggle />
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-2xl border p-6 shadow-card ${
                plan.featured ? "border-primary ring-1 ring-primary" : ""
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full teal-accent px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="mr-1 inline h-3 w-3" /> Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">
                  {plan.monthlyPrice > 0 ? formatCurrency(plan.monthlyPrice) : "Custom"}
                </span>
                {plan.monthlyPrice > 0 && (
                  <span className="text-sm text-muted-foreground">/month</span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {plan.monthlyPrice > 0
                  ? `or ${formatCurrency(plan.annualPrice)}/year`
                  : "Custom pricing"}
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {plan.entitlements
                  .map((e) => humanize(plan.code, e.featureKey, e.value))
                  .filter(Boolean)
                  .slice(0, 8)
                  .map((line) => (
                    <li key={line} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{line}</span>
                    </li>
                  ))}
              </ul>
              <Button asChild className="mt-6 w-full" variant={plan.featured ? "default" : "outline"}>
                <Link href="/signup">
                  {plan.monthlyPrice === 0 && plan.tier === 4
                    ? "Contact sales"
                    : plan.monthlyPrice === 0
                      ? "Start Free"
                      : "Start Trial"}
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>
      <MarketingFooter />
    </main>
  );
}
