import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const iconTones = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-500/12 text-emerald-600",
    warning: "bg-amber-500/15 text-amber-600",
    danger: "bg-red-500/10 text-red-600",
    info: "bg-sky-500/12 text-sky-600",
  };
  return (
    <div className="glass rounded-2xl p-4 shadow-glass">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl",
            iconTones[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint ? (
        <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
      ) : null}
    </div>
  );
}
