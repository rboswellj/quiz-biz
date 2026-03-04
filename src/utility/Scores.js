import { supabase } from "../auth/SupabaseClient";
import { CATEGORY_NAMES } from "./Utils";

export async function saveAttempt({ userId, category, difficulty, correct, total }) {
  // Persist one completed quiz attempt for stats + leaderboard queries.
  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    category,
    difficulty,
    correct,
    total,
  });
  if (error) throw error;
}

export async function fetchProfileNickname(userId) {
  const result = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", userId)
    .maybeSingle();

  if (result.error) throw result.error;
  return result.data?.nickname ?? null;
}

export async function fetchMyWeightedStats(userId) {
  const result = await supabase
    .from("my_weighted_stats")
    .select("category,difficulty,weighted_percent,questions_answered,attempts,last_played")
    .eq("user_id", userId)
    .order("category", { ascending: true })
    .order("difficulty", { ascending: true });

  if (result.error) throw result.error;
  return result.data ?? [];
}

export async function fetchRecentAttempts(limit = 25) {
  const result = await supabase
    .from("quiz_attempts")
    .select("id,category,difficulty,correct,total,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (result.error) throw result.error;
  return result.data ?? [];
}

export async function fetchLeaderboardSections() {
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
  const firstError = results.find((r) => r.error);
  if (firstError) {
    throw new Error(firstError.error.message || "Failed to load leaderboards.");
  }

  return results
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
}
