import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Create your workspace" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your workspace"
      subtitle="Manage sales, invoices & inventory in one place."
      logo={<Boxes className="h-5 w-5" />}
    >
      <SignupForm />
    </AuthShell>
  );
}
