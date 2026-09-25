export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function slugExists(slug: string, prisma: {
  workspace: { findUnique(args: any): Promise<unknown> };
}) {
  const existing = await prisma.workspace.findUnique({ where: { slug } });
  return Boolean(existing);
}
