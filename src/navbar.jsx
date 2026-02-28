import { useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import "./navbar.css";

const Navbar = ({ page, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

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
    setIsOpen(false); // close mobile menu after click
  };

  const username =
    user?.user_metadata?.nickname ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Account";

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img
          src="/quiz-biz-simple-logo.png"
          alt="Quiz-Biz Logo"
          className="nav-logo"
          onClick={() => navigate("quiz")}
          style={{ cursor: "pointer" }}
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
      </ul>

      <div className="user-menu">
        <button
          type="button"
          className="user-menu-button"
          onClick={toggleUserMenu}
        >
          {username} ▾
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