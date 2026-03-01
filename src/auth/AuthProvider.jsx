import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./SupabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Raw Supabase session; derive user from this.
  const [session, setSession] = useState(null);
  // Tracks initial auth bootstrap so UI can show a loading state.
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let mounted = true;

    // 1) Read existing session once on app load.
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) console.error(error);
      setSession(data.session ?? null);
      setBooting(false);
    });

    // 2) Keep session in sync with future sign-in / sign-out events.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => {
    const user = session?.user ?? null;

    return {
      booting,
      session,
      user,

      // Expose common auth actions so components do not call supabase directly.
      signUp: (email, password) =>
        supabase.auth.signUp({ email, password }),

      signIn: (email, password) =>
        supabase.auth.signInWithPassword({ email, password }),

      signOut: () => supabase.auth.signOut(),
    };
  }, [session, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
