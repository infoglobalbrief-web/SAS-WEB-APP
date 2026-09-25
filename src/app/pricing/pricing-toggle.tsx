"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function PricingToggle() {
  const [annual, setAnnual] = useState(false);
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className={cn(!annual && "font-medium text-foreground", "text-muted-foreground")}>
        Monthly
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={annual}
        onClick={() => setAnnual((v) => !v)}
        className={cn(
          "relative h-6 w-11 rounded-full transition-colors",
          annual ? "bg-primary" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            annual ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
      <span className={cn(annual && "font-medium text-foreground", "text-muted-foreground")}>
        Annual <span className="text-emerald-600">−10%</span>
      </span>
    </div>
  );
}
