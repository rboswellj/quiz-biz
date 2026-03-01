import { useEffect, useMemo, useState } from "react";
import { supabase } from "./auth/SupabaseClient";
import { useAuth } from "./auth/AuthProvider";
import { CATEGORY_NAMES } from "./utility/utils";

// Optional: map OpenTDB category ids to names (add as you like)

function fmtPercent(x) {
  if (x == null || Number.isNaN(x)) return "—";
  return `${Math.round(x * 1000) / 10}%`; // one decimal
}

export default function ScoresPage({ onBack }) {
  const { user, signOut } = useAuth();

  const [nickname, setNickname] = useState(null);
  const [stats, setStats] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) return;
      setLoading(true);
      setErr("");

      try {
        // 1) profile nickname
        const prof = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", user.id)
          .maybeSingle();

        if (prof.error) throw prof.error;

        // 2) weighted stats per category+difficulty
        const st = await supabase
          .from("my_weighted_stats")
          .select("category,difficulty,weighted_percent,questions_answered,attempts,last_played")
          .order("category", { ascending: true })
          .order("difficulty", { ascending: true });

        if (st.error) throw st.error;

        // 3) recent attempts list
        const at = await supabase
          .from("quiz_attempts")
          .select("id,category,difficulty,correct,total,created_at")
          .order("created_at", { ascending: false })
          .limit(25);

        if (at.error) throw at.error;

        if (!cancelled) {
          setNickname(prof.data?.nickname ?? null);
          setStats(st.data ?? []);
          setAttempts(at.data ?? []);
        }
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load scores.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const overall = useMemo(() => {
    // Weighted overall across ALL buckets: sum(correct)/sum(total) across attempts
    const totalQ = attempts.reduce((acc, a) => acc + (a.total || 0), 0);
    const totalC = attempts.reduce((acc, a) => acc + (a.correct || 0), 0);
    return {
      totalQ,
      totalC,
      pct: totalQ ? totalC / totalQ : null,
    };
  }, [attempts]);

  if (loading) return <p>Loading your scores…</p>;

  if (err) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h2>My Scores</h2>
        <p style={{ color: "crimson" }}>{err}</p>
        <div style={{ display: "flex", gap: 8 }}>
          {onBack && (
            <button type="button" onClick={onBack}>
              Back
            </button>
          )}
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>My Scores</h2>
          <div style={{ opacity: 0.8 }}>
            {nickname ? `Nickname: ${nickname}` : "Nickname: —"}
          </div>
          <div style={{ opacity: 0.8 }}>
            Overall: {fmtPercent(overall.pct)} ({overall.totalC}/{overall.totalQ})
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "start" }}>
          {onBack && (
            <button type="button" onClick={onBack}>
              Back to Quiz
            </button>
          )}
          <button type="button" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <h3>Weighted stats by category & difficulty</h3>
      {stats.length === 0 ? (
        <p>No attempts yet. Finish a quiz and come back!</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Category
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Difficulty
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Weighted %
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Questions
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Attempts
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={`${s.category}-${s.difficulty}`}>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {CATEGORY_NAMES[s.category] ?? `Category ${s.category}`}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {s.difficulty}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {fmtPercent(s.weighted_percent)}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {s.questions_answered}
                  </td>
                  <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                    {s.attempts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <hr style={{ margin: "16px 0" }} />

      <h3>Recent quiz attempts</h3>
      {attempts.length === 0 ? (
        <p>No attempts yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  When
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Category
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Difficulty
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  Score
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a) => {
                const pct = a.total ? a.correct / a.total : null;
                return (
                  <tr key={a.id}>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {CATEGORY_NAMES[a.category] ?? `Category ${a.category}`}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {a.difficulty}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {a.correct}/{a.total}
                    </td>
                    <td style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
                      {fmtPercent(pct)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}