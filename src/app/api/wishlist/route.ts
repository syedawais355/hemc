import { handler, ok, noContent } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { getWishlist, addToWishlist, removeFromWishlist, mergeWishlist } from "@/lib/repos/wishlist";
import { readJson, uuid } from "@/lib/validate";

export const GET = handler(async () => {
  const { userId } = await requireUser();
  return ok(await getWishlist(userId));
});

export const POST = handler(async (req: Request) => {
  const { userId } = await requireUser();
  const body = await readJson<{ product_id?: unknown; merge?: unknown[] }>(req);
  if (Array.isArray(body.merge)) {
    await mergeWishlist(userId, body.merge.map((id) => uuid(id, "product_id")));
  } else {
    await addToWishlist(userId, uuid(body.product_id, "product_id"));
  }
  return ok(await getWishlist(userId));
});

export const DELETE = handler(async (req: Request) => {
  const { userId } = await requireUser();
  const productId = uuid(new URL(req.url).searchParams.get("product_id"), "product_id");
  await removeFromWishlist(userId, productId);
  return noContent();
});
