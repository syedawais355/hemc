import { handler, created, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { createProduct, listProducts } from "@/lib/repos/products";
import { readJson, str, num, optionalStr, slugify } from "@/lib/validate";

// Admin product list includes inactive items.
export const GET = handler(async () => {
  await requireAdmin();
  return ok(await listProducts({ includeInactive: true }));
});

export const POST = handler(async (req: Request) => {
  await requireAdmin();
  const b = await readJson(req);
  const name = str(b.name, "Name", { max: 160 });
  const product = await createProduct({
    name,
    slug: b.slug ? slugify(str(b.slug, "Slug")) : slugify(name),
    description: optionalStr(b.description),
    price: num(b.price, "Price", { min: 0, max: 1_000_000 }),
    uom: str(b.uom, "Unit of measure", { max: 60 }),
    image_url: optionalStr(b.image_url, 1000),
    category_id: b.category_id ? str(b.category_id, "Category") : null,
    tag: optionalStr(b.tag, 40),
    is_active: b.is_active === undefined ? true : Boolean(b.is_active),
  });
  return created(product);
});
