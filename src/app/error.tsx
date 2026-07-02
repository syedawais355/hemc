"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container">
      <div className="empty" style={{ paddingBlock: "var(--sp-9)" }}>
        <h1 style={{ fontSize: "var(--step-5)" }}>Something went wrong</h1>
        <p>We hit an unexpected error. Please try again — if it keeps happening, contact us.</p>
        <div style={{ display: "flex", gap: "var(--sp-3)", flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn--primary btn--lg" onClick={reset}>Try again</button>
          <Link className="btn btn--ghost btn--lg" href="/">Back home</Link>
        </div>
      </div>
    </div>
  );
}
