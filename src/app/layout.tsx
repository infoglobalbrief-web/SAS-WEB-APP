import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SAS Web App — Run Your Business From One Workspace",
    template: "%s · SAS Web App",
  },
  description:
    "Quotes, Sales, Invoices, Inventory, Purchases, GRN and Reports — all connected in one multi-tenant business operating system.",
};

export const viewport: Viewport = {
  themeColor: "#0b3a3a",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
