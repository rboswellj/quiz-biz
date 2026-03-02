import { useEffect, useState } from "react";
import { supabase } from "./auth/SupabaseClient";
import { CATEGORY_NAMES } from "./utility/Utils";
import PercentBar from "./PercentBar";

export default function LeaderboardsPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      const difficulties = ["easy", "medium", "hard"];
      const categoryIds = Object.keys(CATEGORY_NAMES).map(Number);

      const jobs = categoryIds.flatMap((category) =>
        difficulties.map((difficulty) =>
          supabase
            .rpc("get_leaderboard_weighted", {
              p_category: category,
              p_difficulty: difficulty,
              p_limit: 50,
            })
            .then(({ data, error }) => ({ category, difficulty, data, error }))
        )
      );

      const results = await Promise.all(jobs);

      if (cancelled) return;

      const firstError = results.find((r) => r.error);
      if (firstError) {
        setErr(firstError.error.message || "Failed to load leaderboards.");
        setSections([]);
        setLoading(false);
        return;
      }

      const nonEmpty = results
        .map((r) => ({
          category: r.category,
          categoryName: CATEGORY_NAMES[r.category] ?? `Category ${r.category}`,
          difficulty: r.difficulty,
          rows: r.data ?? [],
        }))
        .filter((r) => r.rows.length > 0)
        .sort((a, b) => {
          if (a.category !== b.category) return a.category - b.category;
          const order = { easy: 0, medium: 1, hard: 2 };
          return (order[a.difficulty] ?? 99) - (order[b.difficulty] ?? 99);
        });

      setSections(nonEmpty);

      setLoading(false);
    }

    load();
    return () => {
      // Guard against state changes after unmount/filter switch.
      cancelled = true;
    };
  }, []);

  return (
    <div className="page-wrap">
      {loading && <p>Loading leaderboards…</p>}
      {err && <p className="text-error">{err}</p>}

      {!loading && !err && (
        sections.length === 0 ? (
          <p>No leaderboards have enough results yet.</p>
        ) : (
          sections.map((section) => (
            <section
              key={`${section.category}-${section.difficulty}`}
              className="difficulty-group"
            >
              <h4 className="difficulty-heading">
                {section.categoryName} -{" "}
                {section.difficulty.charAt(0).toUpperCase() + section.difficulty.slice(1)}
              </h4>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Nickname</th>
                      <th>Weighted %</th>
                      <th>Questions</th>
                      <th>Attempts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((r, i) => (
                      <tr key={`${section.category}-${section.difficulty}-${r.nickname}-${i}`}>
                        <td>{i + 1}</td>
                        <td>{r.nickname}</td>
                        <td><PercentBar value={r.weighted_percent} /></td>
                        <td>{r.questions_answered}</td>
                        <td>{r.attempts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )
      )}
    </div>
  );
}
