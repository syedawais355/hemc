import { handler, ok } from "@/lib/http";
import { listProducts, getProductsByIds, type ProductFilter } from "@/lib/repos/products";

export const GET = handler(async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const ids = searchParams.get("ids");
  if (ids !== null) {
    const list = ids.split(",").map((s) => s.trim()).filter(Boolean);
    return ok(await getProductsByIds(list));
  }

  const filter: ProductFilter = {
    categorySlug: searchParams.get("cat") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    search: searchParams.get("q") ?? undefined,
    sort: (searchParams.get("sort") as ProductFilter["sort"]) ?? undefined,
  };
  return ok(await listProducts(filter));
});
