import { useEffect, useMemo, useState } from "react";
import { supabase } from "./auth/SupabaseClient";
import { useAuth } from "./auth/AuthProvider";
import { CATEGORY_NAMES } from "./utility/Utils";
import PercentBar from "./PercentBar";

// Optional: map OpenTDB category ids to names (add as you like)

export default function ScoresPage() {
  const { user } = useAuth();

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
        // 1) Load profile nickname for header display.
        const prof = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", user.id)
          .maybeSingle();

        if (prof.error) throw prof.error;

        // 2) Load precomputed weighted stats view.
        const st = await supabase
        .from("my_weighted_stats")
        .select("category,difficulty,weighted_percent,questions_answered,attempts,last_played")
        .eq("user_id", user.id) // ✅ add this
        .order("category", { ascending: true })
        .order("difficulty", { ascending: true });

        if (st.error) throw st.error;

        // 3) Load most recent attempts for history table.
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
      // Avoid state updates when async work finishes after unmount.
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

  const statsByDifficulty = useMemo(() => {
    const groups = new Map();
    for (const row of stats) {
      const key = String(row.difficulty || "unknown").toLowerCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }

    const preferredOrder = ["easy", "medium", "hard"];
    const orderedKeys = [
      ...preferredOrder.filter((k) => groups.has(k)),
      ...Array.from(groups.keys())
        .filter((k) => !preferredOrder.includes(k))
        .sort((a, b) => a.localeCompare(b)),
    ];

    return orderedKeys.map((difficulty) => ({
      difficulty,
      rows: groups.get(difficulty) ?? [],
    }));
  }, [stats]);

  const attemptsByDifficulty = useMemo(() => {
    const groups = new Map();
    for (const row of attempts) {
      const key = String(row.difficulty || "unknown").toLowerCase();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(row);
    }

    const preferredOrder = ["easy", "medium", "hard"];
    const orderedKeys = [
      ...preferredOrder.filter((k) => groups.has(k)),
      ...Array.from(groups.keys())
        .filter((k) => !preferredOrder.includes(k))
        .sort((a, b) => a.localeCompare(b)),
    ];

    return orderedKeys.map((difficulty) => ({
      difficulty,
      rows: groups.get(difficulty) ?? [],
    }));
  }, [attempts]);

  if (loading) return <p>Loading your scores…</p>;

  if (err) {
    return (
      <div className="page-wrap">
        <h2>My Scores</h2>
        <p className="text-error">{err}</p>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div className="page-header">
        <div>
          <h2 className="title-tight">My Scores</h2>
          <div className="text-muted">
            {nickname ? `Nickname: ${nickname}` : "Nickname: —"}
          </div>
          <div className="text-muted">
            Overall:{" "}
            <span className="overall-percent">
              <PercentBar value={overall.pct} />
            </span>{" "}
            ({overall.totalC}/{overall.totalQ})
          </div>
        </div>
      </div>

      <hr className="section-divider" />

      <h3>Weighted stats by category & difficulty</h3>
      {stats.length === 0 ? (
        <p>No attempts yet. Finish a quiz and come back!</p>
      ) : (
        statsByDifficulty.map((group) => (
          <section key={group.difficulty} className="difficulty-group">
            <h4 className="difficulty-heading">
              {group.difficulty.charAt(0).toUpperCase() + group.difficulty.slice(1)}
            </h4>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Weighted %</th>
                    <th>Questions</th>
                    <th>Attempts</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((s) => (
                    <tr key={`${s.category}-${s.difficulty}`}>
                      <td>
                        {CATEGORY_NAMES[s.category] ?? `Category ${s.category}`}
                      </td>
                      <td>
                        <PercentBar value={s.weighted_percent} />
                      </td>
                      <td>{s.questions_answered}</td>
                      <td>{s.attempts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}

      <hr className="section-divider" />

      <h3>Recent quiz attempts</h3>
      {attempts.length === 0 ? (
        <p>No attempts yet.</p>
      ) : (
        attemptsByDifficulty.map((group) => (
          <section key={`attempts-${group.difficulty}`} className="difficulty-group">
            <h4 className="difficulty-heading">
              {group.difficulty.charAt(0).toUpperCase() + group.difficulty.slice(1)}
            </h4>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {group.rows.map((a) => {
                    const pct = a.total ? a.correct / a.total : null;
                    return (
                      <tr key={a.id}>
                        <td>
                          {new Date(a.created_at).toLocaleString()}
                        </td>
                        <td>
                          {CATEGORY_NAMES[a.category] ?? `Category ${a.category}`}
                        </td>
                        <td>{a.correct}/{a.total}</td>
                        <td><PercentBar value={pct} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))
      )}
    </div>
  );
}
