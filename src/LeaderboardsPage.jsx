import { useEffect, useState } from "react";
import { fetchLeaderboardSections } from "./utility/Scores";
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
      try {
        const loadedSections = await fetchLeaderboardSections();
        if (!cancelled) {
          setSections(loadedSections);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setErr(e?.message || "Failed to load leaderboards.");
          setSections([]);
          setLoading(false);
        }
      }
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
              <h4 className="difficulty-heading leaderboard-heading">
                {section.categoryName} -{" "}
                {section.difficulty.charAt(0).toUpperCase() + section.difficulty.slice(1)}
              </h4>
              <div className="table-wrap">
                <table className="table table--sticky table--leaderboard">
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
