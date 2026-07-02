"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/client/store";

const FIELDS = [
  { name: "first_name", label: "First name", required: true },
  { name: "last_name", label: "Last name", required: true },
  { name: "phone", label: "Phone number", type: "tel", required: true },
  { name: "address1", label: "Address line 1", required: true },
  { name: "address2", label: "Address line 2 (optional)" },
  { name: "country", label: "Country", required: true },
  { name: "state", label: "State / Province", required: true },
  { name: "postal_code", label: "Postal code", required: true },
  { name: "date_of_birth", label: "Date of birth", type: "date", required: true },
] as const;

export default function SignupPage() {
  const { signup } = useStore();
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (name: string, value: string) => setForm((f) => ({ ...f, [name]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(form);
      router.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <div className="auth-shell wide card">
        <h1>Create your account</h1>
        <p className="sub">Join HEMC to order remedies and track delivery to your door.</p>
        <form className="form" onSubmit={submit}>
          {error && <div className="form-error">{error}</div>}

          <div className="field-row">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="email" required onChange={(e) => set("email", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="new-password" required minLength={8} onChange={(e) => set("password", e.target.value)} />
            </div>
          </div>

          <div className="field-row">
            {FIELDS.map((f) => (
              <div className="field" key={f.name}>
                <label htmlFor={f.name}>{f.label}</label>
                <input
                  id={f.name}
                  type={"type" in f ? f.type : "text"}
                  required={"required" in f ? f.required : false}
                  value={form[f.name] ?? ""}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              </div>
            ))}
          </div>

          <button className="btn btn--primary btn--lg btn--block" disabled={busy}>{busy ? "Creating account…" : "Create account"}</button>
        </form>
        <p className="auth-alt">Already have an account? <Link href="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
