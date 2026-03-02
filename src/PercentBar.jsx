function clamp01(value) {
  if (value == null || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(1, value));
}

export default function PercentBar({ value }) {
  const clamped = clamp01(value);
  const percent = clamped == null ? null : clamped * 100;
  const widthStep = percent == null ? 0 : Math.round(percent / 5) * 5;
  const fillClass = `percent-fill w-${Math.max(0, Math.min(100, widthStep))}`;
  const toneClass =
    percent == null || percent < 35
      ? "percent-tone-red"
      : percent < 55
      ? "percent-tone-orange"
      : percent < 75
      ? "percent-tone-yellow"
      : "percent-tone-green";

  return (
    <div className="percent-bar-cell">
      <div className={`percent-track ${toneClass}`}>
        <div
          className={fillClass}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent == null ? 0 : Number(percent.toFixed(1))}
          aria-label="Percentage"
        />
        <span className="percent-label percent-label-inside">
          {percent == null ? "—" : `${percent.toFixed(1)}%`}
        </span>
      </div>
    </div>
  );
}
