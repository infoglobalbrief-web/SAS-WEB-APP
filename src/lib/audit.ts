import "server-only";
import { prisma } from "@/lib/prisma";

export type AuditContext = {
  userId?: string;
  organizationId?: string;
  workspaceId?: string;
  ip?: string;
  device?: string;
};

/**
 * Central audit writer (plan §55). Records who did what, on which entity,
 * with before/after values.
 */
export async function audit(
  ctx: AuditContext,
  action: string,
  entity: string,
  entityId?: string,
  oldValue?: string,
  newValue?: string,
) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: ctx.organizationId,
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        action,
        entity,
        entityId,
        oldValue,
        newValue,
        ip: ctx.ip,
        device: ctx.device,
      },
    });
  } catch (error) {
    // Audit failures must never break the user's primary action.
    // eslint-disable-next-line no-console
    console.error("audit write failed", error);
  }
}
