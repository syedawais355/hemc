import { handler, ok } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { mergeCart, getCart } from "@/lib/repos/cart";
import { readJson, uuid, num } from "@/lib/validate";

// Merges a guest cart (held in browser storage) into the DB cart on sign-in.
export const POST = handler(async (req: Request) => {
  const { userId } = await requireUser();
  const body = await readJson<{ items?: { product_id: unknown; quantity: unknown }[] }>(req);
  const items = (body.items ?? []).map((i) => ({
    product_id: uuid(i.product_id, "product_id"),
    quantity: num(i.quantity, "quantity", { min: 1, max: 99 }),
  }));
  await mergeCart(userId, items);
  return ok(await getCart(userId));
});
