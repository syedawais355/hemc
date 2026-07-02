"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/Toast";
import type { Review } from "@/lib/types";

type AdminReview = Review & { product_name: string };

export default function AdminReviewsPage() {
  const toast = useToast();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setReviews(await api.get<AdminReview[]>("/admin/reviews"));
    setLoading(false);
  };
  useEffect(() => { load().catch(() => setLoading(false)); }, []);

  const remove = async (r: AdminReview) => {
    if (!confirm("Remove this review?")) return;
    try { await api.del(`/admin/reviews/${r.id}`); toast("Review removed"); await load(); }
    catch (err) { toast(err instanceof Error ? err.message : "Could not remove"); }
  };

  return (
    <div>
      <div className="admin__head"><h1>Reviews</h1></div>
      {loading ? <p className="loading">Loading…</p> : (
        <div className="table-wrap">
          <table className="data">
            <thead><tr><th>Product</th><th>Author</th><th>Rating</th><th>Comment</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>{r.product_name}</td>
                  <td className="tag-dim">{r.author_name}</td>
                  <td>{"★".repeat(r.rating)}<span className="tag-dim">{"★".repeat(5 - r.rating)}</span></td>
                  <td>{r.title ? <strong>{r.title}</strong> : null} <span className="tag-dim">{r.body ?? ""}</span></td>
                  <td className="tag-dim">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td><button className="btn btn--danger btn--sm" onClick={() => remove(r)}>Remove</button></td>
                </tr>
              ))}
              {!reviews.length && <tr><td colSpan={6} className="tag-dim">No reviews yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
