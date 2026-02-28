import Auth from "../auth";
import { useAuth } from "./AuthProvider";

export default function AuthGate({ children, loadingFallback = <p>Loading…</p> }) {
  const { booting, user } = useAuth();

  if (booting) return loadingFallback;
  if (!user) return <Auth />;

  return children;
}