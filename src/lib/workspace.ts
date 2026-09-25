import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/get-user";
import type { OrganizationRole } from "@prisma/client";

export type WorkspaceContext = {
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  isOrganization: boolean;
  organizationId: string | null;
  role: OrganizationRole;
  userId: string;
};

/**
 * Resolve the tenant context for the ACTIVE workspace (plan §49).
 * The workspace id comes from the httpOnly `sas_workspace` cookie and is always
 * validated against the user's memberships/ownership on the SERVER — never
 * trusted from the browser.
 */
export const getWorkspaceContext = cache(async (): Promise<WorkspaceContext | null> => {
  const session = await getAuthUser();
  if (!session) return null;

  const store = await cookies();
  const activeId = store.get("sas_workspace")?.value;

  // 1) Active workspace from cookie → verify membership or ownership.
  if (activeId) {
    const member = await prisma.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        status: "ACTIVE",
        organization: { workspaceId: activeId },
      },
      include: { organization: { include: { workspace: true } } },
    });
    if (member) {
      return {
        workspaceId: member.organization.workspace.id,
        workspaceName: member.organization.workspace.name,
        workspaceSlug: member.organization.workspace.slug,
        isOrganization: true,
        organizationId: member.organization.id,
        role: member.role,
        userId: session.user.id,
      };
    }
    const personal = await prisma.workspace.findFirst({
      where: { id: activeId, ownerId: session.user.id },
      include: { organization: true },
    });
    if (personal) {
      return {
        workspaceId: personal.id,
        workspaceName: personal.name,
        workspaceSlug: personal.slug,
        isOrganization: personal.isOrganization,
        organizationId: personal.organization?.id ?? null,
        role: "OWNER",
        userId: session.user.id,
      };
    }
  }

  // 2) Fallback: first active membership, else personal workspace.
  const member = await prisma.organizationMember.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: { organization: { include: { workspace: true } } },
    orderBy: { joinedAt: "asc" },
  });
  if (member) {
    return {
      workspaceId: member.organization.workspace.id,
      workspaceName: member.organization.workspace.name,
      workspaceSlug: member.organization.workspace.slug,
      isOrganization: true,
      organizationId: member.organization.id,
      role: member.role,
      userId: session.user.id,
    };
  }

  const personal = await prisma.workspace.findFirst({
    where: { ownerId: session.user.id },
    include: { organization: true },
  });
  if (personal) {
    return {
      workspaceId: personal.id,
      workspaceName: personal.name,
      workspaceSlug: personal.slug,
      isOrganization: personal.isOrganization,
      organizationId: personal.organization?.id ?? null,
      role: "OWNER",
      userId: session.user.id,
    };
  }
  return null;
});
