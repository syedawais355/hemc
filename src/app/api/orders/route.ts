import { handler, ok, created } from "@/lib/http";
import { requireUser } from "@/lib/auth";
import { listOrders, placeOrder } from "@/lib/repos/orders";

export const GET = handler(async () => {
  const { userId } = await requireUser();
  return ok(await listOrders(userId));
});

// Checkout. Totals + items are built server-side from the DB cart.
export const POST = handler(async () => {
  const { userId, profile } = await requireUser();
  const shipping = {
    name: `${profile.first_name} ${profile.last_name}`,
    phone: profile.phone,
    address1: profile.address1,
    address2: profile.address2,
    city_state: profile.state,
    country: profile.country,
    postal_code: profile.postal_code,
  };
  const orderId = await placeOrder(userId, shipping);
  return created({ id: orderId });
});
