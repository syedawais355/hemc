import { handler, created } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { createCategory } from "@/lib/repos/categories";
import { readJson, str, optionalStr, slugify } from "@/lib/validate";

export const POST = handler(async (req: Request) => {
  await requireAdmin();
  const b = await readJson(req);
  const name = str(b.name, "Name", { max: 80 });
  const category = await createCategory({
    name,
    slug: b.slug ? slugify(str(b.slug, "Slug")) : slugify(name),
    description: optionalStr(b.description, 300),
  });
  return created(category);
});
