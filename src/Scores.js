import { supabase } from "./auth/SupabaseClient";

export async function saveScore({ userId, score, total, category, difficulty }) {
  const { error } = await supabase.from("scores").insert({
    user_id: userId,
    score,
    total,
    category,
    difficulty,
  });

  if (error) throw error;
}

export async function fetchMyScores(userId) {
  const { data, error } = await supabase
    .from("scores")
    .select("id, score, total, category, difficulty, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) throw error;
  return data;
}