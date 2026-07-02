import { handler, ok } from "@/lib/http";
import { requireAdmin } from "@/lib/auth";
import { listAllOrders } from "@/lib/repos/orders";

export const GET = handler(async () => {
  await requireAdmin();
  return ok(await listAllOrders());
});
