import { useEffect, useState } from "react";
import { shuffle, decodeHtml } from "./utils";

const API_URL =
  "https://opentdb.com/api.php?amount=10&category=9&difficulty=easy&type=multiple";

export function useTrivia() {
  const [questions, setQuestions] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setStatus("loading");
      setError(null);

      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (data.response_code !== 0) {
          throw new Error(`OpenTDB response_code ${data.response_code}`);
        }

        // Normalize into a shape that your UI likes
        const normalized = data.results.map((q, idx) => {
          const correct = decodeHtml(q.correct_answer);
          const incorrect = q.incorrect_answers.map(decodeHtml);
          const answers = shuffle([correct, ...incorrect]);

          return {
            id: `${idx}-${correct}`, // good enough for this use
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
      ignore = true;
    };
  }, []);

  return { questions, status, error };
}