import { useState } from "react";

import { AuthProvider } from "./auth/AuthProvider";
import AuthGate from "./auth/AuthGate";
import Navbar from "./navbar";
import Quiz from "./Quiz";
import ScoresPage from "./ScoresPage";
import LeaderboardsPage from "./LeaderboardsPage";

function App() {
  const [page, setPage] = useState("quiz"); // "quiz" | "scores"

  return (
    <AuthProvider>
      <AuthGate>
        <Navbar page={page} onNavigate={setPage} />

       {page === "quiz" ? (
        <Quiz />
      ) : page === "scores" ? ( 
        <ScoresPage onBack={() => setPage("quiz")} />
      ) : (
        <LeaderboardsPage onBack={() => setPage("quiz")} />
      )}
      </AuthGate>
    </AuthProvider>
  );
}

export default App;
