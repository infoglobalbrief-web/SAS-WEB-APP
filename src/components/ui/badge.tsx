import * as React from "react";
import { cn } from "@/lib/utils";

type Tone =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

const tones: Record<Tone, string> = {
  default: "bg-primary/10 text-primary",
  success: "bg-emerald-500/12 text-emerald-700",
  warning: "bg-amber-500/15 text-amber-700",
  danger: "bg-red-500/10 text-red-700",
  info: "bg-sky-500/12 text-sky-700",
  neutral: "bg-muted text-muted-foreground",
};

export function Badge({
  className,
  tone = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-4",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
