// QuestionCard.jsx
export default function QuestionCard({
  q,
  selected,
  isLocked,
  onSelect,
}) {
  return (
    <div className="card">
      <div className="meta">
        {q.category} · {q.difficulty}
      </div>

      <h3 className="title">{q.question}</h3>

      <div className="answers">
        {q.answers.map((ans) => {
          const isChosen = selected === ans;

          // Optional coloring when locked
          const className =
            "btn-answer" +
            (isLocked && ans === q.correctAnswer ? " correct" : "") +
            (isLocked && isChosen && ans !== q.correctAnswer ? " wrong" : "") +
            (isChosen ? " chosen" : "");

          return (
            <button
              key={ans}
              className={className}
              disabled={isLocked}
              onClick={() => onSelect(ans)}
            >
              {ans}
            </button>
          );
        })}
      </div>
    </div>
  );
}