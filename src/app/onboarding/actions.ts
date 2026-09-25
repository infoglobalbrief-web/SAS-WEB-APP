"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth/get-user";
import { slugify } from "@/lib/slug";
import { nameSchema, workspaceSchema, businessSchema } from "@/lib/validations";
import { audit } from "@/lib/audit";

export type OnboardingState = {
  ok?: boolean;
  message?: string;
};

/**
 * Completes onboarding (plan §10) in one call:
 *   name → use-case → business info → workspace → subscription
 * Creates the personal workspace, the organization (for BUSINESS+), the
 * membership and a TRIAL subscription with the chosen plan.
 */
export async function completeOnboarding(
  prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const session = await getAuthUser();
  if (!session) redirect("/login");

  const nameResult = nameSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName") || undefined,
  });
  if (!nameResult.success) {
    return { message: nameResult.error.errors[0].message };
  }

  const useCase = String(formData.get("useCase") ?? "PERSONAL");
  const orgType = useCase === "PERSONAL" ? "PERSONAL" : useCase;

  const wsResult = workspaceSchema.safeParse({
    name: formData.get("workspaceName"),
    slug: formData.get("slug") || slugify(String(formData.get("workspaceName") ?? "")),
  });
  if (!wsResult.success) {
    return { message: wsResult.error.errors[0].message };
  }

  const biz = businessSchema.safeParse({
    businessName: formData.get("businessName") || undefined,
    industry: formData.get("industry") || undefined,
    country: formData.get("country") || "India",
    state: formData.get("state") || undefined,
    city: formData.get("city") || undefined,
    currency: formData.get("currency") || "INR",
    taxSystem: formData.get("taxSystem") || undefined,
  });

  const planId = String(formData.get("planId") ?? "");

  // Slug uniqueness
  const slugTaken = await prisma.workspace.findUnique({
    where: { slug: wsResult.data.slug },
  });
  if (slugTaken) {
    return { message: "That workspace URL is taken — try a different one." };
  }

  const isOrg = orgType !== "PERSONAL";

  const workspace = await prisma.workspace.create({
    data: {
      slug: wsResult.data.slug,
      name: wsResult.data.name,
      type: orgType as
        | "PERSONAL"
        | "TEAM"
        | "BUSINESS"
        | "COMPANY"
        | "ENTERPRISE",
      industry: biz.success ? biz.data.industry ?? null : null,
      country: biz.success ? biz.data.country : "India",
      state: biz.success ? biz.data.state ?? null : null,
      city: biz.success ? biz.data.city ?? null : null,
      currency: biz.success ? biz.data.currency : "INR",
      taxSystem: biz.success ? biz.data.taxSystem ?? null : null,
      isOrganization: isOrg,
      ownerId: session.user.id,
    },
  });

  let organizationId: string | null = null;

  if (isOrg) {
    const org = await prisma.organization.create({
      data: {
        workspaceId: workspace.id,
        legalName: biz.success ? biz.data.businessName : wsResult.data.name,
      },
    });
    organizationId = org.id;

    await prisma.organizationMember.create({
      data: {
        organizationId: org.id,
        userId: session.user.id,
        role: "OWNER",
        status: "ACTIVE",
      },
    });

    // Default team (plan §3.4)
    const team = await prisma.team.create({
      data: { organizationId: org.id, name: "Core Team" },
    });
    const member = await prisma.organizationMember.findUniqueOrThrow({
      where: {
        organizationId_userId: { organizationId: org.id, userId: session.user.id },
      },
    });
    await prisma.teamMember.create({
      data: { teamId: team.id, memberId: member.id },
    });
  }

  // Subscription (plan §16, §23) — default to the chosen plan or Business.
  const plan = await prisma.subscriptionPlan.findFirst({
    where: planId ? { id: planId } : { code: "business" },
    include: { entitlements: true },
  });
  const chosenPlan =
    plan ??
    (await prisma.subscriptionPlan.findUniqueOrThrow({
      where: { code: "business" },
      include: { entitlements: true },
    }));
  const trialDays = 14;

  if (organizationId) {
    const subscription = await prisma.subscription.create({
      data: {
        organizationId,
        planId: chosenPlan.id,
        state: "TRIAL",
        trialEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        seatsPurchased:
          Number(
            chosenPlan.entitlements.find((e) => e.featureKey === "users.max")
              ?.value ?? 1,
          ) || 1,
        provider: "manual",
      },
    });
    await prisma.subscriptionEvent.create({
      data: {
        subscriptionId: subscription.id,
        organizationId,
        type: "trial_started",
      },
    });
  }

  // Update user profile from onboarding name (plan §10 step 1)
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: nameResult.data.firstName,
      lastName: nameResult.data.lastName ?? null,
      name: [nameResult.data.firstName, nameResult.data.lastName]
        .filter(Boolean)
        .join(" "),
    },
  });

  // Store the active workspace cookie.
  const store = await cookies();
  store.set("sas_workspace", workspace.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  await audit(
    {
      userId: session.user.id,
      organizationId: organizationId ?? undefined,
      workspaceId: workspace.id,
      ip: "local",
    },
    "workspace.created",
    "workspace",
    workspace.id,
  );

  redirect("/app");
}
