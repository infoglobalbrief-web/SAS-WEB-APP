import Link from "next/link";
import { Mail, Phone, Chrome } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  logo,
  children,
}: {
  title: string;
  subtitle: string;
  logo: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="hero-glow flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="glass-strong rounded-3xl p-8 shadow-glass">
          <div className="mb-8 flex flex-col items-center text-center">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl teal-accent text-white">
              {logo}
            </span>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          {children}

          <div className="mt-8 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">OR</span>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="flex h-10 items-center justify-center gap-1 rounded-xl border text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> Email
              </span>
              <span className="flex h-10 items-center justify-center gap-1 rounded-xl border text-xs text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> Mobile
              </span>
              <span className="flex h-10 items-center justify-center gap-1 rounded-xl border text-xs text-muted-foreground">
                <Chrome className="h-3.5 w-3.5" /> Google
              </span>
            </div>
            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Email, mobile and Google identities are linked to one account —
              verifying a new method never creates a duplicate.
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {title === "Welcome back" ? (
            <>
              New here?{" "}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Create a workspace
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Log in
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}

