import { useState } from "react";

import { AuthProvider } from "./auth/AuthProvider";
import AuthGate from "./auth/AuthGate";
import Navbar from "./navbar";

import "./App.css";
import Quiz from "./Quiz";
import ScoresPage from "./ScoresPage"; // <-- make sure this path matches your file

function App() {
  const [page, setPage] = useState("quiz"); // "quiz" | "scores"

  return (
    <AuthProvider>
      <AuthGate>
        <Navbar page={page} onNavigate={setPage} />

        {page === "quiz" ? (
          <Quiz />
        ) : (
          <ScoresPage onBack={() => setPage("quiz")} />
        )}
      </AuthGate>
    </AuthProvider>
  );
}

export default App;