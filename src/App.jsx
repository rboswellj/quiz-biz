import { useEffect, useState } from "react";

import { AuthProvider, useAuth } from "./auth/AuthProvider";
import Navbar from "./navbar";

import Quiz from "./Quiz";
import ScoresPage from "./ScoresPage";
import LeaderboardsPage from "./LeaderboardsPage";
import Auth from "./Auth";

function AppShell() {
  const { user, booting } = useAuth();
  const [page, setPage] = useState("quiz"); // quiz | scores | leaderboard | auth

  // When auth state changes, keep page sane
  useEffect(() => {
    if (booting) return;

    if (!user) {
      setPage("auth");     // logged out -> show auth content
    } else if (page === "auth") {
      setPage("quiz");     // logged in -> default to quiz
    }
  }, [user, booting]); // intentionally not depending on `page`

  // Optional: block navigation to protected pages when logged out
  const safeNavigate = (nextPage) => {
    if (!user && nextPage !== "auth") {
      setPage("auth");
      return;
    }
    setPage(nextPage);
  };

  return (
    <>
      <Navbar page={page} onNavigate={safeNavigate} />

      <main>
        {booting ? (
          <p>Loading…</p>
        ) : !user ? (
          <Auth onAuthed={() => safeNavigate("quiz")} />
        ) : page === "quiz" ? (
          <Quiz />
        ) : page === "scores" ? (
          <ScoresPage />
        ) : (
          <LeaderboardsPage />
        )}
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}