"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Package,
  ReceiptText,
  CreditCard,
  Boxes,
  PackageSearch,
  Truck,
  Warehouse,
  BarChart3,
  Settings,
  Boxes as LogoIcon,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { section: "Overview", items: [{ href: "/app", label: "Dashboard", icon: LayoutDashboard }] },
  {
    section: "Sales",
    items: [
      { href: "/app/quotations", label: "Quotations", icon: FileText },
      { href: "/app/orders", label: "Orders", icon: ClipboardList },
      { href: "/app/invoices", label: "Invoices", icon: ReceiptText },
      { href: "/app/payments", label: "Payments", icon: CreditCard },
      { href: "/app/customers", label: "Customers", icon: Package },
    ],
  },
  {
    section: "Inventory",
    items: [
      { href: "/app/products", label: "Products", icon: Boxes },
      { href: "/app/stock", label: "Stock", icon: PackageSearch },
      { href: "/app/grn", label: "GRN", icon: Truck },
      { href: "/app/warehouses", label: "Warehouses", icon: Warehouse },
    ],
  },
  {
    section: "Purchase",
    items: [
      { href: "/app/suppliers", label: "Suppliers", icon: Package },
      { href: "/app/purchase", label: "Purchase", icon: ClipboardList },
    ],
  },
  {
    section: "Insights",
    items: [{ href: "/app/reports", label: "Reports", icon: BarChart3 }],
  },
  {
    section: "Manage",
    items: [
      { href: "/app/team", label: "Team", icon: Warehouse },
      { href: "/app/subscription", label: "Subscription", icon: CreditCard },
      { href: "/app/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar-gradient sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/5 lg:flex">
      <div className="flex h-16 items-center gap-2 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-white">
          <LogoIcon className="h-4 w-4" />
        </span>
        <span className="font-semibold text-white">SAS Web App</span>
      </div>
      <nav className="scrollbar-thin flex-1 space-y-5 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.section}>
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {section.section}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/app"
                    ? pathname === "/app"
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white",
                        active && "bg-white/10 font-medium text-white",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="glass rounded-2xl p-3 text-white/80">
          <p className="text-xs font-medium text-white">Free trial</p>
          <p className="mt-0.5 text-[11px] text-white/60">
            Upgrade to unlock more seats and warehouses.
          </p>
        </div>
      </div>
    </aside>
  );
}
