import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { getWorkspaceContext } from "@/lib/workspace";
import { PageHeader } from "@/components/app/page-header";
import { EmptyState } from "@/components/app/empty-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SimpleModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/onboarding");

  const config = moduleConfig(module);

  return (
    <div className="animate-fade-in">
      <PageHeader title={config.title} description={config.description} />

      {config.kind === "table" ? (
        <Card>
          <CardHeader>
            <CardTitle>{config.title}</CardTitle>
          </CardHeader>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <EmptyState
              icon={<ClipboardList className="h-6 w-6" />}
              title={`No ${config.title.toLowerCase()} yet`}
              description={config.empty}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <EmptyState
              icon={<ClipboardList className="h-6 w-6" />}
              title={`No ${config.title.toLowerCase()} yet`}
              description={config.empty}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function moduleConfig(module: string) {
  switch (module) {
    case "orders":
      return {
        title: "Sales Orders",
        description: "Convert quotations into confirmed orders.",
        kind: "table",
        empty: "Create a sales order from an accepted quotation.",
      };
    case "suppliers":
      return {
        title: "Suppliers",
        description: "Manage the vendors you purchase from.",
        kind: "table",
        empty: "Add a supplier to start raising purchase orders.",
      };
    case "warehouses":
      return {
        title: "Warehouses",
        description: "Locations where stock is held and received.",
        kind: "table",
        empty: "Create a warehouse to receive GRNs and track stock by location.",
      };
    case "purchase":
      return {
        title: "Purchase Orders",
        description: "Orders placed with suppliers.",
        kind: "table",
        empty: "Raise a purchase order to begin the procurement flow.",
      };
    default:
      return {
        title: "Module",
        description: "This module is being built out.",
        kind: "simple",
        empty: "Nothing here yet.",
      };
  }
}
