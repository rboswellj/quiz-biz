export default function QuestionCard({
  question,
  answers,
  correctAnswer,
  selectedAnswer,
  onSelectAnswer,
  locked,
}) {
  return (
    <div>
      <h2>{question}</h2>

      {answers.map((a) => {
        const isSelected = selectedAnswer === a;
        const isCorrect = selectedAnswer !== null && a === correctAnswer;
        const isWrong = selectedAnswer === a && selectedAnswer !== correctAnswer;

        return (
          <button
            key={a}
            type="button" // ✅ prevents form submit surprises
            onClick={() => onSelectAnswer(a)}
            disabled={locked}
            style={{
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: isCorrect
                ? "green"
                : isWrong
                ? "red"
                : isSelected
                ? "black"
                : "#ccc",
              marginBottom: 8,
              display: "block",
              width: "100%",
              padding: 10,
            }}
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