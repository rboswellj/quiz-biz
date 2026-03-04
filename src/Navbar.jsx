import { useEffect, useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import { supabase } from "./auth/SupabaseClient";

const Navbar = ({ page, onNavigate }) => {
  // Mobile nav menu state.
  const [isOpen, setIsOpen] = useState(false);
  // User dropdown state.
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // Profile nickname fetched from the `profiles` table.
  const [nickname, setNickname] = useState(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function loadNickname() {
      if (!user?.id) {
        setNickname(null);
        return;
      }

      // Nickname is stored in `profiles`, keyed by auth user id.
      const prof = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .maybeSingle();

      if (!cancelled) {
        setNickname(prof.data?.nickname ?? null);
      }
    }

    loadNickname();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await signOut();
  };

  const navigate = (target) => {
    onNavigate(target);
    setIsOpen(false); // Close mobile menu after selecting a page.
  };

  // Prefer nickname for display; fallback to email prefix.
  const displayName = nickname || user?.email?.split("@")[0] || "Account";

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img
          src="/quiz-biz-simple-logo.png"
          alt="Quiz-Biz Logo"
          className="nav-logo"
          onClick={() => navigate("quiz")}
        />
      </div>

      <div className="menu-icon" onClick={toggleMenu}>
        {isOpen ? "✕" : "☰"}
      </div>

      <ul className={`nav-links ${isOpen ? "active" : ""}`}>
        <li>
          <button
            type="button"
            className={page === "quiz" ? "active" : ""}
            onClick={() => navigate("quiz")}
          >
            The Quiz
          </button>
        </li>

        <li>
          <button
            type="button"
            className={page === "scores" ? "active" : ""}
            onClick={() => navigate("scores")}
          >
            Your Scores
          </button>
        </li>

        <li>
          <button
            type="button"
            className={page === "leaderboard" ? "active" : ""}
            onClick={() => navigate("leaderboard")}
          >
            Leaderboards
          </button>
        </li>

        <li className="mobile-user-row">
          <span className="mobile-username">{displayName}</span>
        </li>
        <li className="mobile-signout-row">
          <button type="button" className="mobile-signout-button" onClick={handleSignOut}>
            Log out
          </button>
        </li>
      </ul>

      <div className="user-menu">
        <button
          type="button"
          className="user-menu-button"
          onClick={toggleUserMenu}
        >
          {displayName} ▾
        </button>

        {isUserMenuOpen && (
          <div className="user-dropdown">
            <button
              type="button"
              className="logout-button"
              onClick={handleSignOut}
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
