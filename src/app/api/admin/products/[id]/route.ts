import { handler, ok, noContent } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { updateProduct, deleteProduct, type ProductInput } from "@/lib/repos/products";
import { readJson, str, num, optionalStr, slugify } from "@/lib/validate";

export const PUT = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  const b = await readJson(req);
  const patch: Partial<ProductInput> = {};
  if (b.name !== undefined) patch.name = str(b.name, "Name", { max: 160 });
  if (b.slug !== undefined) patch.slug = slugify(str(b.slug, "Slug"));
  if (b.description !== undefined) patch.description = optionalStr(b.description);
  if (b.price !== undefined) patch.price = num(b.price, "Price", { min: 0, max: 1_000_000 });
  if (b.uom !== undefined) patch.uom = str(b.uom, "Unit of measure", { max: 60 });
  if (b.image_url !== undefined) patch.image_url = optionalStr(b.image_url, 1000);
  if (b.category_id !== undefined) patch.category_id = b.category_id ? String(b.category_id) : null;
  if (b.tag !== undefined) patch.tag = optionalStr(b.tag, 40);
  if (b.is_active !== undefined) patch.is_active = Boolean(b.is_active);
  return ok(await updateProduct(id, patch));
});

export const DELETE = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await ctx.params;
  await deleteProduct(id);
  return noContent();
});
