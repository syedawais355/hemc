import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

export const ORDER_STATUSES: OrderStatus[] = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// Places an order atomically via the place_order() DB function.
export async function placeOrder(userId: string, shipping: Record<string, unknown>): Promise<string> {
  const db = createAdminClient();
  const { data, error } = await db.rpc("place_order", { p_user: userId, p_shipping: shipping });
  if (error) {
    if (error.message.includes("CART_EMPTY")) throw new ApiError(400, "Your cart is empty");
    throw new ApiError(400, error.message);
  }
  return data as string;
}

export async function listOrders(userId: string): Promise<Order[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("orders")
    .select("*, order_items(product_id, product_name, unit_price, quantity)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(500, error.message);

  return (data as (Order & { order_items: OrderItem[] })[]).map(({ order_items, ...o }) => ({
    ...o,
    items: order_items,
  }));
}

// ---------------- Admin order management ----------------

export interface AdminOrder extends Order {
  user_id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
}

// All orders (newest first) with customer details + line items — admin view.
export async function listAllOrders(): Promise<AdminOrder[]> {
  const db = createAdminClient();
  const { data, error } = await db
    .from("orders")
    .select("*, order_items(product_id, product_name, unit_price, quantity)")
    .order("created_at", { ascending: false });
  if (error) throw new ApiError(500, error.message);

  const orders = (data ?? []) as (Order & { user_id: string; order_items: OrderItem[] })[];
  const ids = [...new Set(orders.map((o) => o.user_id).filter(Boolean))];

  const { data: profiles } = ids.length
    ? await db.from("profiles").select("id, first_name, last_name, phone").in("id", ids)
    : { data: [] };
  const pmap = new Map(
    ((profiles ?? []) as { id: string; first_name: string | null; last_name: string | null; phone: string | null }[])
      .map((p) => [p.id, p]),
  );

  const { data: authList } = await db.auth.admin.listUsers({ perPage: 1000 });
  const emails = new Map(authList.users.map((u) => [u.id, u.email ?? null]));

  return orders.map(({ order_items, ...o }) => {
    const p = pmap.get(o.user_id);
    const name = p ? `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim() : "";
    return {
      ...o,
      items: order_items ?? [],
      customer_name: name || "Guest",
      customer_email: emails.get(o.user_id) ?? null,
      customer_phone: p?.phone ?? null,
    };
  });
}

export async function updateOrderStatus(id: string, status: string): Promise<void> {
  if (!ORDER_STATUSES.includes(status as OrderStatus)) throw new ApiError(400, "Invalid order status");
  const db = createAdminClient();
  const { error, count } = await db
    .from("orders")
    .update({ status }, { count: "exact" })
    .eq("id", id);
  if (error) throw new ApiError(400, error.message);
  if (count === 0) throw new ApiError(404, "Order not found");
}

export interface OrderStats {
  count: number;
  revenue: number;
  byStatus: Record<OrderStatus, number>;
}

// Totals for the admin dashboard. Revenue excludes cancelled orders.
export async function getOrderStats(): Promise<OrderStats> {
  const db = createAdminClient();
  const { data, error } = await db.from("orders").select("status, total");
  if (error) throw new ApiError(500, error.message);
  const rows = (data ?? []) as { status: OrderStatus; total: number }[];

  const byStatus = { placed: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 } as Record<OrderStatus, number>;
  let revenue = 0;
  for (const r of rows) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
    if (r.status !== "cancelled") revenue += Number(r.total) || 0;
  }
  return { count: rows.length, revenue, byStatus };
}
