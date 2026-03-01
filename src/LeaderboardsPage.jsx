import { useEffect, useState } from "react";
import { supabase } from "./auth/SupabaseClient";
import { CATEGORY_NAMES } from "./utility/utils";

function fmtPercent(x) {
  if (x == null || Number.isNaN(x)) return "—";
  return `${Math.round(x * 1000) / 10}%`;
}

export default function LeaderboardsPage({ onBack }) {
  // Filter state for leaderboard bucket.
  const [category, setCategory] = useState(9);
  const [difficulty, setDifficulty] = useState("easy");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErr("");

      // RPC returns leaderboard rows ranked by weighted performance.
      const { data, error } = await supabase.rpc("get_leaderboard_weighted", {
        p_category: category,
        p_difficulty: difficulty,
        p_limit: 50,
      });

      if (cancelled) return;

      if (error) {
        setErr(error.message);
        setRows([]);
      } else {
        setRows(data || []);
      }

      setLoading(false);
    }

    load();
    return () => {
      // Guard against state changes after unmount/filter switch.
      cancelled = true;
    };
  }, [category, difficulty]);

  return (
    <div className="page-wrap">
      <div className="filters-row">
        <label>
          Category:{" "}
          <select value={category} onChange={(e) => setCategory(Number(e.target.value))}>
            {Object.entries(CATEGORY_NAMES).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Difficulty:{" "}
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">easy</option>
            <option value="medium">medium</option>
            <option value="hard">hard</option>
          </select>
        </label>
      </div>

      {loading && <p>Loading leaderboard…</p>}
      {err && <p className="text-error">{err}</p>}

      {!loading && !err && (
        rows.length === 0 ? (
          <p>No one has enough attempts yet (needs 50+ questions in this bucket).</p>
        ) : (
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
                {rows.map((r, i) => (
                  <tr key={`${r.nickname}-${i}`}>
                    <td>{i + 1}</td>
                    <td>{r.nickname}</td>
                    <td>{fmtPercent(r.weighted_percent)}</td>
                    <td>{r.questions_answered}</td>
                    <td>{r.attempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
