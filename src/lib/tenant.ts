import "server-only";
import { prisma } from "@/lib/prisma";
import type { OrganizationRole } from "@prisma/client";

/**
 * All workspaces a user can switch between (plan §12), for the switcher UI.
 */
export async function listWorkspacesForUser(userId: string) {
  const [memberships, personal] = await Promise.all([
    prisma.organizationMember.findMany({
      where: { userId, status: { in: ["ACTIVE", "PENDING", "INVITED"] } },
      include: { organization: { include: { workspace: true } } },
      orderBy: { joinedAt: "asc" },
    }),
    prisma.workspace.findMany({ where: { ownerId: userId } }),
  ]);

  const orgs = memberships.map((m) => ({
    id: m.organization.workspace.id,
    name: m.organization.workspace.name,
    slug: m.organization.workspace.slug,
    type: m.organization.workspace.type,
    role: m.role,
    isOrganization: true,
  }));

  const personals = personal.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: p.type,
    role: "OWNER" as OrganizationRole,
    isOrganization: p.isOrganization,
  }));

  return [...personals, ...orgs];
}
