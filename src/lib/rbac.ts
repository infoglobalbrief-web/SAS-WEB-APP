import "server-only";
import type { OrganizationRole } from "@prisma/client";

// Granular permission keys (plan §14). Groups are permission namespaces used
// by the UI to render menus conditionally; roles define the actual grants.
export const PERMISSIONS = {
  "dashboards.view": "View dashboards",

  "customers.view": "View customers",
  "customers.create": "Create customers",
  "customers.update": "Update customers",
  "customers.delete": "Delete customers",

  "suppliers.view": "View suppliers",
  "suppliers.create": "Create suppliers",

  "products.view": "View products",
  "products.create": "Create products",
  "products.update": "Update products",
  "products.delete": "Delete products",

  "stock.view": "View stock",
  "stock.adjust": "Adjust stock",
  "stock.transfer": "Transfer stock",
  "stock.delete": "Delete stock",

  "warehouses.view": "View warehouses",
  "warehouses.create": "Create warehouses",

  "quotations.view": "View quotations",
  "quotations.create": "Create quotations",

  "orders.view": "View sales orders",
  "orders.create": "Create sales orders",

  "invoices.view": "View invoices",
  "invoices.create": "Create invoices",

  "payments.view": "View payments",
  "payments.create": "Record payments",

  "purchases.view": "View purchases",
  "purchases.create": "Create purchases",

  "grn.view": "View GRN",
  "grn.create": "Create GRN",

  "reports.view": "View reports",
  "reports.advanced": "View advanced reports",

  "members.manage": "Manage team members",
  "roles.manage": "Manage roles & permissions",
  "subscription.manage": "Manage subscription & billing",
  "settings.manage": "Manage workspace settings",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;

const ALL: PermissionKey[] = Object.keys(PERMISSIONS) as PermissionKey[];

// System role → permission grants (plan §13)
export const ROLE_PERMISSIONS: Record<OrganizationRole, PermissionKey[]> = {
  OWNER: ALL,
  ORG_ADMIN: ALL,
  MANAGER: ALL,
  SALES_MANAGER: [
    "dashboards.view",
    "customers.view",
    "customers.create",
    "customers.update",
    "quotations.view",
    "quotations.create",
    "orders.view",
    "orders.create",
    "invoices.view",
    "invoices.create",
    "payments.view",
    "payments.create",
    "reports.view",
  ],
  SALES_EXECUTIVE: [
    "dashboards.view",
    "customers.view",
    "customers.create",
    "quotations.view",
    "quotations.create",
    "orders.view",
    "orders.create",
    "invoices.view",
    "invoices.create",
    "payments.view",
  ],
  INVENTORY_MANAGER: [
    "dashboards.view",
    "products.view",
    "products.create",
    "products.update",
    "stock.view",
    "stock.adjust",
    "stock.transfer",
    "warehouses.view",
    "warehouses.create",
    "grn.view",
    "grn.create",
    "purchases.view",
  ],
  PURCHASE_MANAGER: [
    "dashboards.view",
    "suppliers.view",
    "suppliers.create",
    "products.view",
    "purchases.view",
    "purchases.create",
    "grn.view",
    "grn.create",
    "warehouses.view",
  ],
  ACCOUNTANT: [
    "dashboards.view",
    "customers.view",
    "invoices.view",
    "invoices.create",
    "payments.view",
    "payments.create",
    "reports.view",
    "reports.advanced",
  ],
  VIEWER: [
    "dashboards.view",
    "customers.view",
    "products.view",
    "stock.view",
    "quotations.view",
    "orders.view",
    "invoices.view",
    "reports.view",
  ],
  CUSTOM: [],
};

// User-facing labels for roles (plan §13)
export const ROLE_LABELS: Record<OrganizationRole, string> = {
  OWNER: "Owner",
  ORG_ADMIN: "Organization Admin",
  MANAGER: "Manager",
  SALES_MANAGER: "Sales Manager",
  SALES_EXECUTIVE: "Sales Executive",
  INVENTORY_MANAGER: "Inventory Manager",
  PURCHASE_MANAGER: "Purchase Manager",
  ACCOUNTANT: "Accountant",
  VIEWER: "Viewer",
  CUSTOM: "Custom Role",
};

export function hasPermission(
  role: OrganizationRole,
  permission: PermissionKey,
  customGrants: PermissionKey[] = [],
): boolean {
  if (role === "OWNER" || role === "ORG_ADMIN" || role === "MANAGER") {
    return true;
  }
  const grants =
    role === "CUSTOM" ? customGrants : (ROLE_PERMISSIONS[role] ?? []);
  return grants.includes(permission);
}
