import { supabase } from "../auth/SupabaseClient";

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
