"use client";

import { useActionState, useMemo, useState } from "react";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { completeOnboarding, type OnboardingState } from "./actions";

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPrice: number;
  tier: number;
  entitlements: Record<string, string>;
};

const USE_CASES = [
  { id: "PERSONAL", label: "Just for myself", desc: "Personal workspace" },
  { id: "TEAM", label: "Small team", desc: "Team workspace + seats" },
  { id: "BUSINESS", label: "Business", desc: "Business organization" },
  { id: "COMPANY", label: "Company", desc: "Company organization" },
  { id: "ENTERPRISE", label: "Enterprise", desc: "Enterprise organization" },
];

const STEPS = ["Name", "Use case", "Business", "Workspace", "Plan"];

const initial: OnboardingState = {};

export function OnboardingWizard({
  userName,
  email,
  plans,
}: {
  userName: string;
  email: string;
  plans: Plan[];
}) {
  const [step, setStep] = useState(0);
  const [state, action, pending] = useActionState(completeOnboarding, initial);
  const [firstName, setFirstName] = useState(userName.split(" ")[0] ?? "");
  const [lastName, setLastName] = useState(userName.split(" ")[1] ?? "");
  const [useCase, setUseCase] = useState("PERSONAL");
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("India");
  const [city, setCity] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [workspaceName, setWorkspaceName] = useState("");
  const [slug, setSlug] = useState("");
  const [planId, setPlanId] = useState<string>("");

  const suggestedSlug = useMemo(
    () => (workspaceName || businessName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
    [workspaceName, businessName],
  );

  const isOrg = useCase !== "PERSONAL";
  const fallbackName = isOrg ? businessName || workspaceName : workspaceName;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <form action={action} className="w-full">
      {/* Stepper */}
      <ol className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, idx) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                idx < step
                  ? "bg-emerald-500 text-white"
                  : idx === step
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {idx < step ? <Check className="h-3.5 w-3.5" /> : idx + 1}
            </span>
            <span
              className={cn(
                "hidden text-xs sm:block",
                idx === step ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
            {idx < STEPS.length - 1 && <span className="h-px w-6 bg-border" />}
          </li>
        ))}
      </ol>

      {state.message && (
        <p className="mb-4 rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      )}

      <div className="glass-strong rounded-3xl p-8 shadow-glass">
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold">What&apos;s your name?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Signed in as {email}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold">What are you using it for?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                You can create more workspaces later.
              </p>
            </div>
            <div className="grid gap-3">
              {USE_CASES.map((uc) => (
                <button
                  key={uc.id}
                  type="button"
                  onClick={() => setUseCase(uc.id)}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border p-4 text-left transition-colors",
                    useCase === uc.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "hover:bg-accent/50",
                  )}
                >
                  <div>
                    <p className="font-medium">{uc.label}</p>
                    <p className="text-sm text-muted-foreground">{uc.desc}</p>
                  </div>
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border",
                      useCase === uc.id ? "border-primary bg-primary text-white" : "",
                    )}
                  >
                    {useCase === uc.id && <Check className="h-3 w-3" />}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold">
                {isOrg ? "Tell us about your business" : "Your workspace"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isOrg
                  ? "Business information powers invoices and reports."
                  : "Name your personal workspace."}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {isOrg && (
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="businessName">
                    {useCase === "TEAM" ? "Team name" : "Business name"}
                  </Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                  />
                </div>
              )}
              {!isOrg && (
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="workspaceNameEarly">Workspace name</Label>
                  <Input
                    id="workspaceNameEarly"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. Akash's Workspace"
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Retail, Trading…"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold">Choose your workspace URL</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This is the slug for your workspace.
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="workspaceName">Workspace name</Label>
              <Input
                id="workspaceName"
                name="workspaceName"
                required
                value={workspaceName || businessName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                placeholder="ABC Electronics"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="slug">Workspace URL</Label>
              <div className="flex items-center">
                <span className="rounded-l-xl border border-r-0 bg-muted px-3 py-2 text-sm text-muted-foreground">
                  app/
                </span>
                <Input
                  id="slug"
                  name="slug"
                  required
                  className="rounded-l-none"
                  value={slug || suggestedSlug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers and dashes only.
              </p>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold">Choose your plan</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Every plan starts with a 14-day free trial — change anytime.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {plans
                .filter((p) => (isOrg ? p.tier >= 2 : p.tier <= 3))
                .map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlanId(p.id)}
                    className={cn(
                      "flex flex-col rounded-2xl border p-4 text-left transition-colors",
                      planId === p.id
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "hover:bg-accent/50",
                    )}
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-sm text-muted-foreground">{p.description}</span>
                    <span className="mt-2 text-lg font-semibold">
                      {p.monthlyPrice > 0 ? formatCurrency(p.monthlyPrice) : "Custom"}
                      {p.monthlyPrice > 0 && (
                        <span className="text-xs font-normal text-muted-foreground">
                          {" "}/mo
                        </span>
                      )}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {Number(p.entitlements["users.max"] ?? 1) > 1
                        ? `Up to ${p.entitlements["users.max"]} users`
                        : "1 user"}
                    </span>
                  </button>
                ))}
            </div>
            <input type="hidden" name="planId" value={planId} />
            <input type="hidden" name="useCase" value={useCase} />

            {/* Carry all wizard values through to submit (inputs are
                conditionally rendered per-step). */}
            <input type="hidden" name="firstName" value={firstName} />
            <input type="hidden" name="lastName" value={lastName} />
            <input type="hidden" name="businessName" value={businessName} />
            <input type="hidden" name="industry" value={industry} />
            <input type="hidden" name="country" value={country} />
            <input type="hidden" name="city" value={city} />
            <input type="hidden" name="currency" value={currency} />
            <input type="hidden" name="workspaceName" value={workspaceName || businessName || fallbackName} />
            <input type="hidden" name="slug" value={slug || suggestedSlug} />
          </div>
        )}

        {/* Nav buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={back}
            disabled={step === 0}
          >
            {step > 0 && <ArrowLeft className="h-4 w-4" />} Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next} disabled={!canProceed()}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={pending}>
              {pending ? "Creating workspace…" : "Create workspace"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );

  function canProceed() {
    if (step === 0) return firstName.trim().length > 0;
    if (step === 2) return isOrg ? businessName.trim().length > 0 : true;
    if (step === 3)
      return (workspaceName || businessName).trim().length > 0 && (slug || suggestedSlug).length > 0;
    return true;
  }
}
