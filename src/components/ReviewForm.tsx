"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/client/store";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client/api";
import { Icon } from "@/components/Icon";

export function ReviewForm({ productId }: { productId: string }) {
  const { user } = useStore();
  const toast = useToast();
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div className="form-note">
        <Link href="/login">Sign in</Link> to write a review.
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/reviews", { product_id: productId, rating, title, body });
      setTitle(""); setBody(""); setRating(5);
      toast("Thanks for your review");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not submit review");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="form card" style={{ padding: "var(--sp-5)" }} onSubmit={submit}>
      <div className="field">
        <label>Your rating</label>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} stars`}>
              <Icon name="star" size={24} fill={n <= rating ? "currentColor" : "none"} />
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label htmlFor="rv-title">Title</label>
        <input id="rv-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sums it up…" maxLength={120} />
      </div>
      <div className="field">
        <label htmlFor="rv-body">Review</label>
        <textarea id="rv-body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="What did you think?" maxLength={2000} />
      </div>
      <button className="btn btn--primary" disabled={busy}>{busy ? "Submitting…" : "Submit review"}</button>
    </form>
  );
}
