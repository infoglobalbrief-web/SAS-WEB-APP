import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link";
type Size = "default" | "sm" | "lg" | "icon";

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-card hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-lg px-3 text-xs",
  lg: "h-12 rounded-2xl px-6 text-base",
  icon: "h-10 w-10",
};

const baseStyles =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "default", asChild, ...props },
    ref,
  ) => {
    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(props.children as React.ReactElement)) {
      const child = props.children as React.ReactElement<{
        className?: string;
      }>;
      return React.cloneElement(child, {
        className: cn(classes, child.props.className),
      });
    }

    return <button ref={ref} className={classes} {...props} />;
  },
);
Button.displayName = "Button";
