import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { getAuthUser } from "@/lib/auth/get-user";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "./onboarding-wizard";

export const metadata: Metadata = { title: "Finish setting up" };

export default async function OnboardingPage() {
  const session = await getAuthUser();
  if (!session) redirect("/login");

  const personal = await prisma.workspace.findFirst({
    where: { ownerId: session.user.id },
  });
  if (personal) redirect("/app");

  const plans = await prisma.subscriptionPlan.findMany({
    where: { published: true },
    orderBy: { tier: "asc" },
    include: { entitlements: { select: { featureKey: true, value: true } } },
  });

  return (
    <main className="hero-glow min-h-screen py-10">
      <div className="container flex max-w-2xl flex-col items-center">
        <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl teal-accent text-white">
          <Boxes className="h-5 w-5" />
        </span>
        <OnboardingWizard
          userName={session.user.name ?? ""}
          email={session.user.email ?? ""}
          plans={plans.map((p) => ({
            id: p.id,
            code: p.code,
            name: p.name,
            description: p.description ?? "",
            monthlyPrice: p.monthlyPrice,
            tier: p.tier,
            entitlements: p.entitlements.reduce<Record<string, string>>(
              (acc, e) => {
                acc[e.featureKey] = e.value;
                return acc;
              },
              {},
            ),
          }))}
        />
      </div>
    </main>
  );
}
