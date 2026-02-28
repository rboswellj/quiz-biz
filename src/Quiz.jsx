import { useState } from "react";
import { useTrivia } from "./fetchQuiz";
import QuestionCard from "./QuestionCard";
import { saveScore } from "./scores";
import { useAuth } from "./auth/AuthProvider";

export default function Quiz() {
  const { user, signOut } = useAuth();

  // Draft settings (change without fetching)
  const [draftDifficulty, setDraftDifficulty] = useState("easy");
  const [draftCategory, setDraftCategory] = useState(9);
  const [draftAmount, setDraftAmount] = useState(10);

  // Committed settings (set only when Start is clicked)
  const [settings, setSettings] = useState(null); // { difficulty, category, amount } | null

  // Quiz flow state
  const [index, setIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);

  // Fetch only after Start
  const { questions, status, error } = useTrivia({
    difficulty: settings?.difficulty,
    category: settings?.category,
    amount: settings?.amount,
    enabled: !!settings,
  });

  const current = questions[index];

  function startQuiz() {
    setSettings({
      difficulty: draftDifficulty,
      category: draftCategory,
      amount: draftAmount,
    });
    // reset quiz state
    setIndex(0);
    setSelectedAnswer(null);
    setScore(0);
  }

  function changeSettings() {
    setSettings(null);
    setIndex(0);
    setSelectedAnswer(null);
    setScore(0);
  }

  function handleSelectAnswer(ans) {
    setSelectedAnswer(ans);

    // Only score once per question
    if (ans === current.correctAnswer) setScore((s) => s + 1);
  }

  function nextQuestion() {
    setSelectedAnswer(null);
    setIndex((i) => i + 1);
  }

  // --- UI: Setup screen ---
  if (!settings) {
    return (
      <div>
        <h2>Quiz Setup</h2>

        <label>
          Difficulty:{" "}
          <select
            value={draftDifficulty}
            onChange={(e) => setDraftDifficulty(e.target.value)}
          >
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>

        <br />

        <label>
          Category:{" "}
          <select
            value={draftCategory}
            onChange={(e) => setDraftCategory(Number(e.target.value))}
          >
            <option value={9}>General Knowledge</option>
            <option value={11}>Movies</option>
            <option value={12}>Music</option>
            <option value={14}>TV</option>
            <option value={15}>Video Games</option>
            <option value={17}>Science & Nature</option>
            <option value={18}>Science: Computers</option>
            <option value={23}>History</option>
            <option value={21}>Sports</option>
          </select>
        </label>

        <br />

        <label>
          Amount:{" "}
          <input
            type="number"
            min={1}
            max={50}
            value={draftAmount}
            onChange={(e) => setDraftAmount(Number(e.target.value))}
          />
        </label>

        <br />

        <button type="button" onClick={startQuiz}>
          Start Quiz
        </button>
      </div>
    );
  }

  // --- UI: Loading / Error ---
  if (status === "loading") return <p>Loading…</p>;

  if (status === "error") {
    return (
      <div>
        <p>Error: {error?.message}</p>
        <button type="button" onClick={changeSettings}>
          Back to Settings
        </button>
      </div>
    );
  }

  // --- UI: Finished ---
  if (!current) {
    return (
      <div>
        <h2>Finished!</h2>
        <p>
          Score: {score} / {questions.length}
        </p>

        <button type="button" onClick={startQuiz}>
          Play Again (same settings)
        </button>

        <button type="button" onClick={changeSettings}>
          Change Settings
        </button>
      </div>
    );
  }

  // --- UI: Quiz screen ---
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button type="button" onClick={changeSettings}>
          Change Settings
        </button>

        <p style={{ margin: "8px 0" }}>
          Question {index + 1} / {questions.length} — Score: {score}
        </p>
      </div>

      <QuestionCard
        question={current.question}
        answers={current.answers}
        correctAnswer={current.correctAnswer}
        selectedAnswer={selectedAnswer}
        locked={selectedAnswer !== null}
        onSelectAnswer={handleSelectAnswer}
      />

      <button
        type="button"
        disabled={selectedAnswer === null}
        onClick={nextQuestion}
        style={{ marginTop: 12 }}
      >
        Next
      </button>
    </div>
  );
}
