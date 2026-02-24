import { useMemo, useState } from "react";
import { useTrivia } from "../server/fetchQuiz";
import QuestionCard from "./QuestionCard";

export default function Quiz() {
  const { questions, status, error } = useTrivia();

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);

  const current = useMemo(() => questions[index], [questions, index]);

  function pickAnswer(ans) {
    if (locked) return;
    setSelected(ans);
    setLocked(true);

    if (ans === current.correctAnswer) {
      setScore((s) => s + 1);
    }
  }

  function next() {
    setSelected(null);
    setLocked(false);
    setIndex((i) => i + 1);
  }

  function restart() {
    // simplest restart without refetch:
    setIndex(0);
    setSelected(null);
    setLocked(false);
    setScore(0);
  }

  if (status === "loading") return <p>Loading trivia…</p>;
  if (status === "error")
    return <p>Failed to load: {String(error?.message || error)}</p>;
  if (status !== "ready" || !current) return <p>No questions found.</p>;

  const isLast = index === questions.length - 1;

  return (
    <div className="container">
      <div className="topbar">
        <div>
          Question {index + 1} / {questions.length}
        </div>
        <div>Score: {score}</div>
      </div>

      <QuestionCard
        q={current}
        selected={selected}
        isLocked={locked}
        onSelect={pickAnswer}
      />

      <div className="actions">
        {!isLast ? (
          <button className="btn" disabled={!locked} onClick={next}>
            Next
          </button>
        ) : (
          <button className="btn" disabled={!locked} onClick={restart}>
            Finish / Restart
          </button>
        )}
      </div>
    </div>
  );
}