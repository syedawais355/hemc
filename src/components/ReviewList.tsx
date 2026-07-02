"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/client/store";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client/api";
import { Icon } from "@/components/Icon";
import type { Review } from "@/lib/types";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const { user } = useStore();
  const toast = useToast();
  const router = useRouter();

  if (!reviews.length) return <p className="muted">No reviews yet. Be the first to share your experience.</p>;

  const remove = async (review: Review) => {
    const isAdmin = user?.role === "admin";
    try {
      await api.del(isAdmin ? `/admin/reviews/${review.id}` : `/reviews/${review.id}`);
      toast("Review removed");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not remove review");
    }
  };

  return (
    <>
      {reviews.map((r) => {
        const canRemove = user && (user.role === "admin" || user.id === r.user_id);
        return (
          <div className="review card" key={r.id}>
            <div className="review__head">
              <div>
                <span className="review__author">{r.author_name}</span>
                <span className="review__stars" style={{ marginLeft: 8 }}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon key={i} name="star" size={14} fill={i < r.rating ? "currentColor" : "none"} />
                  ))}
                </span>
              </div>
              {canRemove && (
                <button className="cart-row__remove" onClick={() => remove(r)} aria-label="Delete review">
                  <Icon name="trash" size={17} />
                </button>
              )}
            </div>
            {r.title && <strong>{r.title}</strong>}
            {r.body && <p className="review__body">{r.body}</p>}
            <div className="review__meta">{new Date(r.created_at).toLocaleDateString()}</div>
          </div>
        );
      })}
    </>
  );
}
