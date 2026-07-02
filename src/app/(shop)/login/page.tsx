"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/client/store";

function LoginForm() {
  const { login } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      router.push(params.get("next") || "/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-shell card">
        <h1>Welcome back</h1>
        <p className="sub">Sign in to your HEMC account.</p>
        <form className="form" onSubmit={submit}>
          {error && <div className="form-error">{error}</div>}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn--primary btn--lg btn--block" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="auth-alt">New here? <Link href="/signup">Create an account</Link></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div className="container"><p className="loading">Loading…</p></div>}><LoginForm /></Suspense>;
}
