import { useEffect, useState } from "react";
import { supabase } from "./auth/SupabaseClient";
import { CATEGORY_NAMES } from "./utility/utils";

function fmtPercent(x) {
  if (x == null || Number.isNaN(x)) return "—";
  return `${Math.round(x * 1000) / 10}%`;
}

export default function LeaderboardsPage({ onBack }) {
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
      cancelled = true;
    };
  }, [category, difficulty]);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
    
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
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
      {err && <p style={{ color: "crimson" }}>{err}</p>}

      {!loading && !err && (
        rows.length === 0 ? (
          <p>No one has enough attempts yet (needs 50+ questions in this bucket).</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>
                    Rank
                  </th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>
                    Nickname
                  </th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>
                    Weighted %
                  </th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>
                    Questions
                  </th>
                  <th style={{ textAlign: "left", padding: 8, borderBottom: "1px solid #ddd" }}>
                    Attempts
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={`${r.nickname}-${i}`}>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {r.nickname}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {fmtPercent(r.weighted_percent)}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {r.questions_answered}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {r.attempts}
                    </td>
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