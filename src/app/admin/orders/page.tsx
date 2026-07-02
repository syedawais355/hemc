"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/Toast";
import { money } from "@/lib/format";

type OrderStatus = "placed" | "processing" | "shipped" | "delivered" | "cancelled";
const STATUSES: OrderStatus[] = ["placed", "processing", "shipped", "delivered", "cancelled"];

interface OrderItem {
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
}
interface AdminOrder {
  id: string;
  status: OrderStatus;
  subtotal: number;
  delivery_fee: number;
  total: number;
  shipping_address: Record<string, unknown> | null;
  created_at: string;
  items: OrderItem[];
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
}

const fmtKey = (k: string) => k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function AdminOrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setOrders(await api.get<AdminOrder[]>("/admin/orders"));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load().catch(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const s of STATUSES) c[s] = 0;
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const changeStatus = async (o: AdminOrder, status: OrderStatus) => {
    if (status === o.status) return;
    setSaving(o.id);
    try {
      await api.patch(`/admin/orders/${o.id}`, { status });
      setOrders((prev) => prev.map((x) => (x.id === o.id ? { ...x, status } : x)));
      toast(`Order marked ${status}`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not update order");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div className="admin__head">
        <h1>Orders</h1>
        <span className="tag-dim">{orders.length} total</span>
      </div>

      <div className="filter-row">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            className={`pill ${filter === s ? "is-active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s === "all" ? "All" : fmtKey(s)} <span className="tag-dim">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading">Loading orders…</p>
      ) : visible.length === 0 ? (
        <div className="table-wrap">
          <p className="loading">No orders{filter !== "all" ? ` with status “${filter}”` : " yet"}.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((o) => {
                const itemCount = o.items.reduce((n, i) => n + i.quantity, 0);
                const isOpen = open === o.id;
                return (
                  <Fragment key={o.id}>
                    <tr>
                      <td className="mono">#{o.id.slice(0, 8)}</td>
                      <td className="tag-dim">
                        {new Date(o.created_at).toLocaleDateString(undefined, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.customer_name}</div>
                        <div className="tag-dim" style={{ fontSize: 12 }}>{o.customer_email ?? "—"}</div>
                      </td>
                      <td className="tag-dim">{itemCount}</td>
                      <td className="mono" style={{ fontWeight: 700 }}>{money(o.total)}</td>
                      <td>
                        <select
                          className="status-select"
                          value={o.status}
                          disabled={saving === o.id}
                          onChange={(e) => changeStatus(o, e.target.value as OrderStatus)}
                          aria-label={`Status for order ${o.id.slice(0, 8)}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{fmtKey(s)}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => setOpen(isOpen ? null : o.id)}
                          aria-expanded={isOpen}
                        >
                          {isOpen ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="order-detail">
                        <td colSpan={7}>
                          <div className="order-detail__inner">
                            <div>
                              <h4>Items</h4>
                              <table className="oitems">
                                <tbody>
                                  {o.items.map((it, i) => (
                                    <tr key={i}>
                                      <td>{it.product_name}</td>
                                      <td className="tag-dim">
                                        {it.quantity} × {money(it.unit_price)}
                                      </td>
                                      <td className="mono" style={{ textAlign: "right", fontWeight: 600 }}>
                                        {money(it.unit_price * it.quantity)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              <div style={{ marginTop: 14, display: "grid", gap: 4, fontSize: "var(--step-0)" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span className="tag-dim">Subtotal</span><span className="mono">{money(o.subtotal)}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                  <span className="tag-dim">Delivery</span>
                                  <span className="mono">{o.delivery_fee ? money(o.delivery_fee) : "Free"}</span>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700 }}>
                                  <span>Total</span><span className="mono">{money(o.total)}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4>Ship to</h4>
                              <div className="oaddr">
                                <strong>{o.customer_name}</strong>
                                {o.customer_phone && <span className="muted">{o.customer_phone}</span>}
                                {o.customer_email && <span className="muted">{o.customer_email}</span>}
                                {o.shipping_address &&
                                  Object.entries(o.shipping_address)
                                    .filter(([, v]) => v != null && String(v).trim() !== "")
                                    .map(([k, v]) => (
                                      <span className="muted" key={k}>
                                        {fmtKey(k)}: {String(v)}
                                      </span>
                                    ))}
                                {!o.shipping_address && <span className="muted">No address on file</span>}
                              </div>
                              <div style={{ marginTop: 14 }}>
                                <span className={`ostatus ostatus--${o.status}`}>{o.status}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
