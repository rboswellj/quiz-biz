import Auth from "../Auth";
import { useAuth } from "./AuthProvider";

export default function AuthGate({ children, loadingFallback = <p>Loading…</p> }) {
  const { booting, user } = useAuth();

  // Wait for initial auth check before deciding what to render.
  if (booting) return loadingFallback;
  // No session yet: show sign-in / sign-up screen.
  if (!user) return <Auth />;

  // Session exists: render protected app UI.
  return children;
}
