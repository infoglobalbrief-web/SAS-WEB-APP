import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Boxes } from "lucide-react";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl teal-accent text-white">
            <Boxes className="h-4 w-4" />
          </span>
          <span>SAS Web App</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#modules" className="hover:text-foreground">
            Modules
          </a>
          <a href="#how" className="hover:text-foreground">
            How it works
          </a>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Start Free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 py-12">
      <div className="container flex flex-col items-center justify-between gap-6 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2 font-medium text-foreground">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg teal-accent text-white">
            <Boxes className="h-3.5 w-3.5" />
          </span>
          SAS Web App
        </div>
        <p>Sales · Quotation · Invoice · Inventory · Purchase · GRN · Reports</p>
        <p>© {new Date().getFullYear()} SAS Web App. All rights reserved.</p>
      </div>
    </footer>
  );
}
