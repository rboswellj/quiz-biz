// Import React hooks
import { useEffect, useState } from "react";

// shuffle -> randomizes answers
// decodeHtml -> converts HTML entities like &quot; into "
import { shuffle, decodeHtml } from "./utils";

// Custom hook that fetches and normalizes OpenTDB questions.
export function useTrivia({ difficulty, category, amount = 10, enabled = true, requestKey = 0 }) {
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    // Caller can defer fetching until setup is complete.
    if (!enabled) return;
    if (!difficulty || !category) return;

    let ignore = false;

    const params = new URLSearchParams({
      amount,
      category,
      difficulty,
      type: "multiple",
    });

    const apiUrl = `https://opentdb.com/api.php?${params.toString()}`;

    async function load() {
      setStatus("loading");
      setError(null);

      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data.response_code !== 0) {
          throw new Error(`OpenTDB response_code ${data.response_code}`);
        }

        // Normalize OpenTDB shape into UI-ready question objects.
        const normalized = data.results.map((q, idx) => {
          const correct = decodeHtml(q.correct_answer);
          const incorrect = q.incorrect_answers.map(decodeHtml);
          const answers = shuffle([correct, ...incorrect]);

          return {
            id: `${idx}-${correct}`,
            category: q.category,
            difficulty: q.difficulty,
            question: decodeHtml(q.question),
            correctAnswer: correct,
            answers,
          };
        });

        if (!ignore) {
          setQuestions(normalized);
          setStatus("ready");
        }
      } catch (e) {
        if (!ignore) {
          setError(e);
          setStatus("error");
        }
      }
    }

    load();
    return () => {
      // Ignore any pending result if component unmounts/settings change.
      ignore = true;
    };
  }, [difficulty, category, amount, enabled, requestKey]);

  return { questions, status, error };
}
