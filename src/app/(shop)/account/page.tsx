"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/client/store";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client/api";
import { money } from "@/lib/format";
import type { Order, Profile } from "@/lib/types";

const PROFILE_FIELDS = [
  { name: "first_name", label: "First name" },
  { name: "last_name", label: "Last name" },
  { name: "phone", label: "Phone number" },
  { name: "address1", label: "Address line 1" },
  { name: "address2", label: "Address line 2" },
  { name: "country", label: "Country" },
  { name: "state", label: "State / Province" },
  { name: "postal_code", label: "Postal code" },
  { name: "date_of_birth", label: "Date of birth", type: "date" },
] as const;

function AccountView() {
  const { ready, user, logout } = useStore();
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") === "orders" ? "orders" : "profile";

  const [profile, setProfile] = useState<(Profile & { email: string }) | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [p, o] = await Promise.all([
      api.get<Profile & { email: string }>("/profile"),
      api.get<Order[]>("/orders"),
    ]);
    setProfile(p);
    setOrders(o);
    const rec = p as unknown as Record<string, unknown>;
    setForm(Object.fromEntries(PROFILE_FIELDS.map((f) => [f.name, (rec[f.name] as string) ?? ""])));
  }, []);

  useEffect(() => {
    if (ready && !user) { router.replace("/login?next=/account"); return; }
    if (user) load().catch(() => {});
  }, [ready, user, load, router]);

  if (!ready || !user) return <div className="container"><p className="loading">Loading…</p></div>;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/profile", form);
      toast("Profile updated");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const go = (t: string) => router.push(`/account${t === "orders" ? "?tab=orders" : ""}`);

  return (
    <div className="container">
      <div className="page-head"><span className="eyebrow">{profile?.email}</span><h1>Your account</h1></div>
      <div className="account">
        <aside className="account__nav card">
          <button className={tab === "profile" ? "is-active" : ""} onClick={() => go("profile")}>Profile</button>
          <button className={tab === "orders" ? "is-active" : ""} onClick={() => go("orders")}>Orders</button>
          {user.role === "admin" && <button onClick={() => router.push("/admin")}>Admin panel</button>}
          <button onClick={async () => { await logout(); router.push("/"); }}>Sign out</button>
        </aside>

        <div>
          {tab === "profile" ? (
            <form className="form card" style={{ padding: "var(--sp-6)" }} onSubmit={save}>
              <div className="field-row">
                {PROFILE_FIELDS.map((f) => (
                  <div className="field" key={f.name}>
                    <label htmlFor={f.name}>{f.label}</label>
                    <input
                      id={f.name}
                      type={"type" in f ? f.type : "text"}
                      value={form[f.name] ?? ""}
                      onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <button className="btn btn--primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
            </form>
          ) : (
            <div>
              {orders.length ? orders.map((o) => (
                <div className="order-card card" key={o.id}>
                  <div className="order-card__head">
                    <span className="order-card__id">Order #{o.id.slice(0, 8)}</span>
                    <span className="status-pill">{o.status}</span>
                  </div>
                  {o.items?.map((it, i) => (
                    <div className="order-line" key={i}><span>{it.product_name} × {it.quantity}</span><span>{money(it.unit_price * it.quantity)}</span></div>
                  ))}
                  <div className="order-line" style={{ fontWeight: 700, color: "var(--text)" }}>
                    <span>Total</span><span>{money(o.total)}</span>
                  </div>
                  <div className="review__meta">{new Date(o.created_at).toLocaleString()}</div>
                </div>
              )) : <p className="muted">No orders yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return <Suspense fallback={<div className="container"><p className="loading">Loading…</p></div>}><AccountView /></Suspense>;
}
