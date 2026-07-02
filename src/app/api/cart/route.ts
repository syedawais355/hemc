import { handler, ok, noContent } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { getCart, addToCart, setCartItem, removeCartItem, clearCart } from "@/lib/repos/cart";
import { readJson, uuid, num } from "@/lib/validate";

export const GET = handler(async () => {
  const { userId } = await requireUser();
  return ok(await getCart(userId));
});

// Add quantity on top of the current line.
export const POST = handler(async (req: Request) => {
  const { userId } = await requireUser();
  const body = await readJson(req);
  await addToCart(userId, uuid(body.product_id, "product_id"), num(body.quantity ?? 1, "quantity", { min: 1, max: 99 }));
  return ok(await getCart(userId));
});

// Set an absolute quantity (0 removes the line).
export const PATCH = handler(async (req: Request) => {
  const { userId } = await requireUser();
  const body = await readJson(req);
  await setCartItem(userId, uuid(body.product_id, "product_id"), num(body.quantity, "quantity", { min: 0, max: 99 }));
  return ok(await getCart(userId));
});

export const DELETE = handler(async (req: Request) => {
  const { userId } = await requireUser();
  const productId = new URL(req.url).searchParams.get("product_id");
  if (productId) await removeCartItem(userId, uuid(productId, "product_id"));
  else await clearCart(userId);
  return noContent();
});
