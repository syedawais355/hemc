import { handler, ok, noContent } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { updateCategory, deleteCategory, type CategoryInput } from "@/lib/repos/categories";
import { readJson, str, optionalStr, slugify } from "@/lib/validate";

export const PUT = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const b = await readJson(req);
  const patch: Partial<CategoryInput> = {};
  if (b.name !== undefined) patch.name = str(b.name, "Name", { max: 80 });
  if (b.slug !== undefined) patch.slug = slugify(str(b.slug, "Slug"));
  if (b.description !== undefined) patch.description = optionalStr(b.description, 300);
  return ok(await updateCategory(id, patch));
});

export const DELETE = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  await deleteCategory(id);
  return noContent();
});
