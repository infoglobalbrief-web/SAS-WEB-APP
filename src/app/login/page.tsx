import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in with your email — we'll send you a one-time code."
      logo={<Boxes className="h-5 w-5" />}
    >
      <LoginForm />
    </AuthShell>
  );
}
