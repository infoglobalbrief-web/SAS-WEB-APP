import Link from "next/link";
import {
  ArrowRight,
  FileText,
  ReceiptText,
  Boxes,
  PackageSearch,
  Truck,
  BarChart3,
  Users,
  ShieldCheck,
  Zap,
  LineChart,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingNav, MarketingFooter } from "@/components/marketing/nav";

const FEATURES = [
  {
    icon: FileText,
    title: "Quotation Maker",
    copy: "Create, send and track professional quotations. View opens, get acceptances, and convert straight into sales orders.",
  },
  {
    icon: ReceiptText,
    title: "Invoices & Payments",
    copy: "GST-ready invoices, UPI QR, payment receipts and outstanding tracking — one connected flow.",
  },
  {
    icon: Boxes,
    title: "Inventory Engine",
    copy: "Opening stock + purchases − sales − returns, with every change logged as a stock movement.",
  },
  {
    icon: Truck,
    title: "GRN & Purchases",
    copy: "Partial receipts, damage and rejection handling, batch & serial tracking, and stock updates on goods receipt.",
  },
  {
    icon: BarChart3,
    title: "Reports",
    copy: "Sales, inventory, purchase and finance reports with a builder to filter, group, sort and export.",
  },
  {
    icon: Layers,
    title: "Multi-workspace",
    copy: "One account, many workspaces. Switch between personal, team and company organizations instantly.",
  },
];

const MODULES = [
  "Quotations",
  "Sales Orders",
  "Invoices",
  "Payments",
  "Customers",
  "Suppliers",
  "Products",
  "Stock",
  "Warehouses",
  "Purchase",
  "GRN",
  "Returns",
  "Expenses",
  "Reports",
  "Teams",
  "Subscriptions",
];

const STEPS = [
  {
    icon: Zap,
    title: "Verify in seconds",
    copy: "Sign up with email OTP — no password required. Your personal workspace is created instantly.",
  },
  {
    icon: Users,
    title: "Invite your team",
    copy: "Invite people by email, assign roles, and manage seats. Grow from solo to a full company account.",
  },
  {
    icon: LineChart,
    title: "Run your business",
    copy: "Quote, sell, invoice, receive goods and report — all in one place that adapts to your role.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <MarketingNav />

      {/* Hero */}
      <section className="hero-glow">
        <div className="container flex flex-col items-center gap-6 py-24 text-center md:py-32">
          <span className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            Multi-tenant subscription SaaS · 2026 design
          </span>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Run Your Business From{" "}
            <span className="text-gradient">One Powerful Workspace.</span>
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Quotes, Sales, Invoices, Inventory &amp; Reports — all connected. For
            solo founders, teams and growing companies, without migrating
            platforms as you grow.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Start Free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/demo">View Demo</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* Feature grid */}
      <section id="features" className="container py-20 md:py-24">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything, connected
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            A complete business-management system rather than a simple invoice
            maker.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-6 shadow-glass transition-transform hover:-translate-y-0.5"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules strip */}
      <section id="modules" className="border-y border-border/60 bg-background py-20">
        <div className="container">
          <div className="mb-10 flex flex-col items-center gap-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Full module coverage</h2>
            <p className="max-w-xl text-muted-foreground">
              The entire business workflow — sales to stock to reports.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {MODULES.map((m) => (
              <span
                key={m}
                className="glass rounded-full px-4 py-2 text-sm font-medium shadow-sm"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-20 md:py-24">
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Start alone. Grow together.
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            The growth path is the strategy — solo user to multi-branch company
            without changing workspaces.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map((s, idx) => (
            <div key={s.title} className="relative">
              <div className="glass h-full rounded-2xl p-6 shadow-glass">
                <span className="mb-4 flex h-8 w-8 items-center justify-center rounded-full teal-accent text-sm font-bold text-white">
                  {idx + 1}
                </span>
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Security / trust */}
      <section className="border-y border-border/60 bg-background py-16">
        <div className="container grid gap-8 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Tenant isolation",
              copy: "Organization data is enforced server-side from your session — never trusted from the browser.",
            },
            {
              icon: Layers,
              title: "Entitlement engine",
              copy: "Plan limits live in data, not code. Change pricing without redeploying.",
            },
            {
              icon: PackageSearch,
              title: "You own your data",
              copy: "Export customers, products, invoices and reports anytime.",
            },
          ].map((t) => (
            <div key={t.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <t.icon className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold">{t.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <div className="glass rounded-3xl p-12 shadow-glass">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to run your business better?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Create your workspace in 60 seconds. Manage sales, invoices &amp;
            inventory in one place.
          </p>
          <div className="mt-8">
            <Button asChild size="lg">
              <Link href="/signup">Create your workspace</Link>
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </main>
  );
}
