import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PGlite } from "@electric-sql/pglite";
import { PrismaPGlite } from "pglite-prisma-adapter";

const prisma = new PrismaClient({
  adapter: new PrismaPGlite(new PGlite({ dataDir: process.env.DATABASE_DIR ?? ".data/pglite" })),
});

const PERMISSION_KEYS = [
  "dashboards.view",
  "customers.view", "customers.create", "customers.update", "customers.delete",
  "suppliers.view", "suppliers.create",
  "products.view", "products.create", "products.update", "products.delete",
  "stock.view", "stock.adjust", "stock.transfer", "stock.delete",
  "warehouses.view", "warehouses.create",
  "quotations.view", "quotations.create",
  "orders.view", "orders.create",
  "invoices.view", "invoices.create",
  "payments.view", "payments.create",
  "purchases.view", "purchases.create",
  "grn.view", "grn.create",
  "reports.view", "reports.advanced",
  "members.manage", "roles.manage",
  "subscription.manage", "settings.manage",
];

type PlanSeed = {
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  tier: number;
  featured?: boolean;
  entitlements: Record<string, string>;
};

const PLANS: PlanSeed[] = [
  {
    code: "individual",
    name: "Individual",
    description: "For solo professionals",
    monthlyPrice: 0,
    annualPrice: 0,
    tier: 1,
    entitlements: {
      "users.max": "1",
      "customers.max": "200",
      "products.max": "500",
      "warehouses.max": "1",
      "invoices.monthly": "500",
      "quotations.enabled": "true",
      "invoices.enabled": "true",
      "inventory.enabled": "basic",
      "grn.enabled": "basic",
      "reports.level": "basic",
      "teams.enabled": "false",
      "approvals.enabled": "false",
      "api.enabled": "false",
      "whatsapp.enabled": "false",
      "ai.enabled": "false",
      "support.level": "standard",
    },
  },
  {
    code: "team",
    name: "Team",
    description: "For growing teams",
    monthlyPrice: 999,
    annualPrice: 9990,
    tier: 2,
    entitlements: {
      "users.max": "3",
      "customers.max": "2000",
      "products.max": "2500",
      "warehouses.max": "2",
      "invoices.monthly": "2500",
      "quotations.enabled": "true",
      "invoices.enabled": "true",
      "inventory.enabled": "true",
      "grn.enabled": "true",
      "reports.level": "standard",
      "teams.enabled": "true",
      "approvals.enabled": "basic",
      "api.enabled": "false",
      "whatsapp.enabled": "false",
      "ai.enabled": "false",
      "support.level": "standard",
    },
  },
  {
    code: "business",
    name: "Business",
    description: "For companies",
    monthlyPrice: 2499,
    annualPrice: 24990,
    tier: 3,
    featured: true,
    entitlements: {
      "users.max": "10",
      "customers.max": "10000",
      "products.max": "5000",
      "warehouses.max": "5",
      "invoices.monthly": "5000",
      "quotations.enabled": "true",
      "invoices.enabled": "true",
      "inventory.enabled": "advanced",
      "grn.enabled": "true",
      "reports.level": "advanced",
      "teams.enabled": "true",
      "approvals.enabled": "true",
      "api.enabled": "optional",
      "whatsapp.enabled": "true",
      "ai.enabled": "false",
      "support.level": "priority",
    },
  },
  {
    code: "enterprise",
    name: "Enterprise",
    description: "For larger organizations",
    monthlyPrice: 0,
    annualPrice: 0,
    tier: 4,
    entitlements: {
      "users.max": "1000",
      "customers.max": "unlimited",
      "products.max": "unlimited",
      "warehouses.max": "100",
      "invoices.monthly": "unlimited",
      "quotations.enabled": "true",
      "invoices.enabled": "true",
      "inventory.enabled": "advanced",
      "grn.enabled": "true",
      "reports.level": "custom",
      "teams.enabled": "true",
      "approvals.enabled": "advanced",
      "api.enabled": "true",
      "whatsapp.enabled": "true",
      "ai.enabled": "custom",
      "support.level": "dedicated",
    },
  },
];

async function main() {
  // 1. Permissions (plan §14)
  for (const key of PERMISSION_KEYS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    });
  }

  // 2. Subscription plans + entitlements (plan §16-17, §30)
  for (const p of PLANS) {
    const plan = await prisma.subscriptionPlan.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        description: p.description,
        monthlyPrice: p.monthlyPrice,
        annualPrice: p.annualPrice,
        tier: p.tier,
        featured: p.featured ?? false,
      },
      create: {
        code: p.code,
        name: p.name,
        description: p.description,
        monthlyPrice: p.monthlyPrice,
        annualPrice: p.annualPrice,
        tier: p.tier,
        featured: p.featured ?? false,
      },
    });
    for (const [featureKey, value] of Object.entries(p.entitlements)) {
      await prisma.subscriptionEntitlement.upsert({
        where: { planId_featureKey: { planId: plan.id, featureKey } },
        update: { value },
        create: { planId: plan.id, featureKey, value },
      });
    }
  }

  // 3. Add-ons (plan §31)
  const business = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { code: "business" } });
  const team = await prisma.subscriptionPlan.findUniqueOrThrow({ where: { code: "team" } });
  const ADDONS = [
    { planId: team.id, code: "additional-user-team", name: "Additional User", unitPrice: 199 },
    { planId: business.id, code: "additional-user-business", name: "Additional User", unitPrice: 249 },
    { planId: business.id, code: "additional-warehouse", name: "Additional Warehouse", unitPrice: 499 },
    { planId: business.id, code: "whatsapp-pack", name: "WhatsApp Pack", unitPrice: 399 },
    { planId: business.id, code: "advanced-reports", name: "Advanced Reports", unitPrice: 299 },
    { planId: business.id, code: "api-access", name: "API Access", unitPrice: 799 },
  ];
  for (const a of ADDONS) {
    await prisma.subscriptionAddon.upsert({
      where: { code: a.code },
      update: { planId: a.planId, name: a.name, unitPrice: a.unitPrice },
      create: { planId: a.planId, code: a.code, name: a.name, unitPrice: a.unitPrice },
    });
  }

  // eslint-disable-next-line no-console
  console.log("Seeded permissions, plans, entitlements and add-ons.");
  await prisma.$disconnect();
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
