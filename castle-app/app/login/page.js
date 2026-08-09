"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { browserClient } from "../../lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setError(null);
    const supabase = browserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="login-shell">
      <form className="login-card" onSubmit={submit}>
        <p className="eyebrow" style={{ marginBottom: 8 }}>AI-EMPIRE HQ</p>
        <h2 style={{ marginTop: 0 }}>Sign in</h2>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Enter the castle</button>
        {error && <p style={{ color: "var(--crit-500)", fontSize: "0.82rem", marginTop: 10 }}>{error}</p>}
        <p style={{ fontSize: "0.72rem", color: "var(--stone-400)", marginTop: 14, marginBottom: 0 }}>
          Single-founder account, created in the Supabase dashboard — this app doesn&apos;t self-register users.
        </p>
      </form>
    </div>
  );
}
