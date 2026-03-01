import { useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { supabase } from "./auth/SupabaseClient";

export default function Auth() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState("signin"); // signin | signup
  const [nickname, setNickname] = useState(""); // Only used for signup
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
        // Create auth user in Supabase Auth.
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

        // Store nickname in app profile table for leaderboard/display use.
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

      // Existing user sign-in path.
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
    <div className="container">
      <div className="auth-panel">
      <h2>{mode === "signup" ? "Create account" : "Sign in"}</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        {/* Nickname field only for signup */}
        {mode === "signup" && (
          <input
            className="auth-input"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Nickname (3–20 chars, letters/numbers/_)"
            autoComplete="nickname"
          />
        )}

        <input
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
        />

        <input
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />

        <button type="submit" disabled={busy} className="auth-submit">
          {busy ? "Please wait…" : mode === "signup" ? "Sign up" : "Sign in"}
        </button>
      </form>

      <button
        type="button"
        className="auth-switch"
        onClick={() => {
          setMode(mode === "signup" ? "signin" : "signup");
          setMsg("");
        }}
      >
        Switch to {mode === "signup" ? "Sign in" : "Sign up"}
      </button>

      {msg && <p className="auth-message">{msg}</p>}
      </div>
    </div>
  );
}
