import "server-only";
import { prisma } from "@/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Entitlement engine (plan §17): plan limits are DATA (subscription_entitlements
// rows), not code. Changing pricing never requires changing application logic.
// ─────────────────────────────────────────────────────────────────────────────

export async function getEntitlements(planId: string) {
  const rows = await prisma.subscriptionEntitlement.findMany({
    where: { planId },
  });
  const map: Record<string, string> = {};
  for (const row of rows) map[row.featureKey] = row.value;
  return map;
}

export async function getNumericEntitlement(
  planId: string,
  key: string,
  fallback = Number.MAX_SAFE_INTEGER,
) {
  const rows = await getEntitlements(planId);
  const raw = rows[key];
  if (raw === undefined) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

export async function getBooleanEntitlement(
  planId: string,
  key: string,
  fallback = false,
) {
  const rows = await getEntitlements(planId);
  const raw = rows[key];
  if (raw === undefined) return fallback;
  return raw === "true" || raw === "1";
}

export async function getActiveSubscription(organizationId: string) {
  return prisma.subscription.findFirst({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: { plan: { include: { entitlements: true } } },
  });
}

export type LimitCheck =
  | { ok: true }
  | { ok: false; limit: number; current: number; featureKey: string };

/**
 * The conceptual middleware from plan §53:
 *   Authenticated? → Organization? → Permission? → Subscription active?
 *   → Feature enabled? → Usage limit available? → Execute
 */
export async function checkLimit(
  organizationId: string,
  featureKey: string,
  current: number,
): Promise<LimitCheck> {
  const subscription = await getActiveSubscription(organizationId);
  if (!subscription) return { ok: false, limit: 0, current, featureKey };

  const raw = subscription.plan.entitlements.find(
    (e) => e.featureKey === featureKey,
  );
  if (!raw) return { ok: true }; // no limit configured → unlimited

  const limit = Number(raw.value);
  if (Number.isFinite(limit) && current >= limit) {
    return { ok: false, limit, current, featureKey };
  }
  return { ok: true };
}

// ═════════════════════════════════════════════════════════════════════════════
// Usage metering (plan §33)
// ═════════════════════════════════════════════════════════════════════════════

export async function recordUsage(
  organizationId: string,
  metric: string,
  value: number,
) {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  await prisma.usageRecord.upsert({
    where: {
      organizationId_metric_periodStart: {
        organizationId,
        metric,
        periodStart,
      },
    },
    create: { organizationId, metric, value, periodStart, periodEnd },
    update: { value: { increment: value } },
  });
}

export async function getUsageSnapshot(organizationId: string) {
  const [counts] = await Promise.all([
    (async () => {
      const [products, invoices, warehouses, users] = await Promise.all([
        prisma.product.count({ where: { organizationId } }),
        prisma.invoice.count({ where: { organizationId } }),
        prisma.warehouse.count({ where: { organizationId } }),
        prisma.organizationMember.count({
          where: { organizationId, status: { in: ["ACTIVE", "INVITED", "PENDING"] } },
        }),
      ]);
      return { products, invoices, warehouses, users };
    })(),
  ]);
  return counts;
}
