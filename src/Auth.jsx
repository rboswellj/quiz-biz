import { useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { supabase } from "./auth/SupabaseClient"; // <-- adjust path if needed

export default function Auth() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState("signin"); // signin | signup
  const [nickname, setNickname] = useState(""); // ✅ moved INSIDE component
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setBusy(true);

    try {
      const cleanEmail = email.trim();
      if (!cleanEmail || !password) {
        setMsg("Please enter both email and password.");
        return;
      }

      // If signing up, validate nickname
      let cleanNickname = nickname.trim();
      if (mode === "signup") {
        // 3–20 chars, letters/numbers/underscore
        const ok = /^[a-zA-Z0-9_]{3,20}$/.test(cleanNickname);
        if (!ok) {
          setMsg("Nickname must be 3–20 characters (letters, numbers, underscore).");
          return;
        }
      }

      if (mode === "signup") {
        // signUp should return { data, error }
        const { data, error } = await signUp(cleanEmail, password);
        if (error) {
          setMsg(error.message);
          return;
        }

        const userId = data?.user?.id;
        if (!userId) {
          setMsg("Signup succeeded, but no user id returned.");
          return;
        }

        // Insert nickname into profiles table
        const { error: profileErr } = await supabase
          .from("profiles")
          .insert({ id: userId, nickname: cleanNickname });

        if (profileErr) {
          // Postgres unique violation (nickname taken)
          if (profileErr.code === "23505") {
            setMsg("That nickname is already taken. Try another.");
          } else {
            setMsg(profileErr.message);
          }
          return;
        }

        setMsg("Account created! Check your email to confirm (if enabled).");
        return;
      }

      // ✅ Sign in
      const { error } = await signIn(cleanEmail, password);
      if (error) setMsg(error.message);
      else setMsg("Signed in!");
    } catch (err) {
      setMsg(err?.message || "Unexpected auth error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 360 }}>
      <h2>{mode === "signup" ? "Create account" : "Sign in"}</h2>

      <form onSubmit={handleSubmit}>
        {/* Nickname field only for signup */}
        {mode === "signup" && (
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nickname (3–20 chars, letters/numbers/_)"
            autoComplete="nickname"
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          />
        )}

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        />

        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          style={{ width: "100%", padding: 10, marginBottom: 8 }}
        />

        <button type="submit" disabled={busy} style={{ width: "100%", padding: 10 }}>
          {busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "signup" ? "signin" : "signup");
          setMsg("");
        }}
        style={{ marginTop: 10 }}
      >
        Switch to {mode === "signup" ? "Sign in" : "Sign up"}
      </button>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}