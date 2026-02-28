import { useState } from "react";
import { useAuth } from "./auth/AuthProvider";
import "./navbar.css";

const Navbar = () => {
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

  const username =
    user?.user_metadata?.nickname ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "Account";

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/quiz-biz-simple-logo.png" alt="Quiz-Biz Logo" className="nav-logo" />
      </div>
      <div className="menu-icon" onClick={toggleMenu}>
        {/* Hamburger icon for mobile view */}
        {isOpen ? "✕" : "☰"}
      </div>
      <ul className={`nav-links ${isOpen ? "active" : ""}`}>
        <li>
          <a href="/">The Quiz</a>
        </li>
        <li>
          <a href="/about">Leaderboards</a>
        </li>
        <li>
          <a href="/contact">Your Scores</a>
        </li>
      </ul>
      <div className="user-menu">
        <button type="button" className="user-menu-button" onClick={toggleUserMenu}>
          {username} ▾
        </button>
        {isUserMenuOpen && (
          <div className="user-dropdown">
            <button type="button" className="logout-button" onClick={handleSignOut}>
              Log out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
