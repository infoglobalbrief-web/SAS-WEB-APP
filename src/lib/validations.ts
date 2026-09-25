import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address");

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{7,15}$/, "Enter a valid mobile number");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const nameSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(60),
  lastName: z.string().trim().max(60).optional(),
});

export const workspaceSchema = z.object({
  name: z.string().trim().min(2, "Workspace name is too short").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]{2,40}$/, "Use lowercase letters, numbers and dashes"),
});

export const businessSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required").max(120),
  industry: z.string().trim().optional(),
  country: z.string().trim().default("India"),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
  currency: z.string().trim().default("INR"),
  taxSystem: z.string().trim().optional(),
});

export const inviteSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email").optional(),
  phone: phoneSchema.optional(),
  role: z.string().trim().default("VIEWER"),
  teamId: z.string().optional(),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  company: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  gstin: z.string().trim().optional(),
  currency: z.string().trim().default("INR"),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required"),
  sku: z.string().trim().optional(),
  barcode: z.string().trim().optional(),
  hsnSac: z.string().trim().optional(),
  salePrice: z.coerce.number().min(0).default(0),
  purchasePrice: z.coerce.number().min(0).default(0),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  minStock: z.coerce.number().min(0).default(0),
  trackInventory: z.boolean().default(true),
});

export const saleItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  quantity: z.coerce.number().positive(),
  price: z.coerce.number().min(0),
  taxRate: z.coerce.number().min(0).default(0),
});

export const documentSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),
  items: z.array(saleItemSchema).min(1, "Add at least one line item"),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  terms: z.string().optional(),
  validUntil: z.string().optional(),
});
