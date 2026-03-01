import { useEffect, useMemo, useRef, useState } from "react";
import { useTrivia } from "./utility/fetchQuiz";
import QuestionCard from "./QuestionCard";
import { useAuth } from "./auth/AuthProvider";
import { saveAttempt } from "./utility/Scores";
import { CATEGORY_NAMES } from "./utility/utils";

export default function Quiz() {
  const { user } = useAuth();

  // Fixed round length used for each quiz start.
  const questionsPerRound = 10;

  // Draft settings (change without fetching)
  const [draftDifficulty, setDraftDifficulty] = useState("easy");
  const [draftCategory, setDraftCategory] = useState(9);

  // Committed settings (only set when Start is clicked)
  const [settings, setSettings] = useState(null); // { difficulty, category, amount } | null

  // Quiz flow state
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [requestKey, setRequestKey] = useState(0);

  // Prevent double-saving an attempt
  const savedAttemptRef = useRef(false);

  // Fetch only after Start; requestKey forces a refetch for "play again".
  const { questions, status, error } = useTrivia({
    difficulty: settings?.difficulty,
    category: settings?.category,
    amount: settings?.amount,
    enabled: !!settings,
    requestKey // allows manual refresh
  });

  // Current question derived from list + cursor.
  const current = useMemo(() => questions[index], [questions, index]);

  function startQuiz() {
    // New run: clear "saved attempt" guard and trigger fresh fetch.
    savedAttemptRef.current = false;
    setRequestKey((k) => k + 1);

    setSettings({
      difficulty: draftDifficulty,
      category: draftCategory,
      amount: questionsPerRound,
    });

    setIndex(0);
    setSelected(null);
    setLocked(false);
    setScore(0);
  }

  function changeSettings() {
    // Return to setup and clear all in-progress quiz state.
    savedAttemptRef.current = false;
    setSettings(null);

    setIndex(0);
    setSelected(null);
    setLocked(false);
    setScore(0);
  }

  function pickAnswer(ans) {
    if (locked) return;
    // Lock immediately so one question cannot be answered twice.
    setSelected(ans);
    setLocked(true);

    if (ans === current?.correctAnswer) {
      setScore((s) => s + 1);
    }
  }

  function next() {
    setSelected(null);
    setLocked(false);
    setIndex((i) => i + 1);
  }

  // When last question is answered, move index past the end to show results screen
  function finish() {
    setIndex(questions.length); // signals "finished"
  }

  // Pull category list from utils
  const categoryOptions = Object.entries(CATEGORY_NAMES)
  .map(([id, name]) => ({ id: Number(id), name }))
  .sort((a, b) => a.name.localeCompare(b.name));

  const isLastQuestion = index === questions.length - 1;
  const isFinished = settings && status === "ready" && questions.length > 0 && index >= questions.length;

  // Save attempt once when finish screen is reached.
  useEffect(() => {
    if (!isFinished) return;
    if (!user?.id) return;
    if (savedAttemptRef.current) return;

    savedAttemptRef.current = true;

    (async () => {
      try {
        await saveAttempt({
          userId: user.id,
          category: settings.category,
          difficulty: settings.difficulty,
          correct: score,
          total: questions.length,
        });
      } catch (e) {
        console.error("Failed to save attempt:", e);
        // Optional retry behavior:
        // savedAttemptRef.current = false;
      }
    })();
  }, [isFinished, user?.id, settings, score, questions.length]);

  // ----------------------------
  // UI: Setup screen
  // ----------------------------
  if (!settings) {
    return (
      <div className="container">
        <div className="quiz-card">
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

        <div className="spacer-sm" />

        <label>
          Category:{" "}
          <select
            value={draftCategory}
            onChange={(e) => setDraftCategory(Number(e.target.value))}
          >
            {categoryOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div className="spacer-md" />

        <button type="button" className="btn" onClick={startQuiz}>
          Start Quiz
        </button>
        </div>
      </div>
    );
  }

  // ----------------------------
  // UI: Loading / Error
  // ----------------------------
  if (status === "loading") return <p>Loading trivia…</p>;

  if (status === "error") {
    return (
      <div className="container">
        <p>Failed to load: {String(error?.message || error)}</p>
        <button type="button" className="btn" onClick={changeSettings}>
          Back to Settings
        </button>
      </div>
    );
  }

  // ----------------------------
  // UI: Results screen (finished)
  // ----------------------------
  if (isFinished) {
    return (
      <div className="container">
        <div className="topbar">
          <div>Finished!</div>
          <div>
            Score: {score} / {questions.length}
          </div>
        </div>

        <p>
          Difficulty: <b>{settings.difficulty}</b> — Category: <b>{settings.category}</b>
        </p>

        <div className="actions">
          <button type="button" className="btn" onClick={changeSettings}>
            Change Settings
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              // play again with same settings
              savedAttemptRef.current = false;
              setRequestKey((k) => k + 1);
              setIndex(0);
              setSelected(null);
              setLocked(false);
              setScore(0);
            }}
          >
            Play Again (same settings)
          </button>
        </div>
      </div>
    );
  }

  // Guard if questions are empty
  if (status !== "ready" || !current) return <p>No questions found.</p>;

  // ----------------------------
  // UI: Quiz screen
  // ----------------------------
  return (
    <div className="container">
      <div className="topbar">
        <div>
          Question {index + 1} / {questions.length}
        </div>
        <div>Score: {score}</div>
      </div>

      <QuestionCard
        question={current.question}
        answers={current.answers}
        correctAnswer={current.correctAnswer}
        selectedAnswer={selected}
        locked={locked}
        onSelectAnswer={pickAnswer}
      />

      <div className="actions">
        {!isLastQuestion ? (
          <button type="button" className="btn" disabled={!locked} onClick={next}>
            Next
          </button>
        ) : (
          <button type="button" className="btn" disabled={!locked} onClick={finish}>
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
