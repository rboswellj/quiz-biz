export default function QuestionCard({
  question,
  answers,
  correctAnswer,
  selectedAnswer,
  onSelectAnswer,
  locked,
}) {
  return (
    <div className="quiz-card">
      <h2>{question}</h2>

      {answers.map((a) => {
        // Derive per-answer visual state from current selection.
        const isSelected = selectedAnswer === a;
        const isCorrect = selectedAnswer !== null && a === correctAnswer;
        const isWrong = selectedAnswer === a && selectedAnswer !== correctAnswer;

        return (
          <button
            key={a}
<<<<<<< HEAD
            type="button" // ✅ prevents form submit surprises
=======
            type="button"
>>>>>>> 341db8c (Did some more styling and cleaned up a few of the components)
            onClick={() => onSelectAnswer(a)}
            disabled={locked}
            className={`quiz-answer ${
              isCorrect
                ? "quiz-answer-correct"
                : isWrong
<<<<<<< HEAD
                ? "quiz-answer-wrong"
=======
                ? "quiz-answer-incorrect"
>>>>>>> 341db8c (Did some more styling and cleaned up a few of the components)
                : isSelected
                ? "quiz-answer-selected"
                : ""
            }`}
          >
            {a}
          </button>
        );
      })}

      {selectedAnswer !== null && (
        <p>{selectedAnswer === correctAnswer ? "✅ Correct!" : "❌ Incorrect"}</p>
      )}
    </div>
  );
}
