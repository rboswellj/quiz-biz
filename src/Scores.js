import { supabase } from "./auth/SupabaseClient";

export async function saveAttempt({ userId, category, difficulty, correct, total }) {
  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: userId,
    category,
    difficulty,
    correct,
    total,
  });
  if (error) throw error;
}