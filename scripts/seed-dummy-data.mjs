import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DUMMY_COUNT = 20;
const ATTEMPTS_PER_USER = 18;
const FOCUSED_USER_COUNT = 8;
const FOCUSED_ATTEMPTS_PER_MATCHUP = 4;
const CATEGORIES = [9, 10, 11, 12, 14, 15, 17, 18, 21, 22, 23, 24, 27, 31, 32];
const DIFFICULTIES = ["easy", "medium", "hard"];
const FOCUSED_MATCHUPS = [
  { category: 9, difficulty: "easy" },
  { category: 18, difficulty: "medium" },
  { category: 23, difficulty: "hard" },
];

const pad2 = (n) => String(n).padStart(2, "0");
const rand = (max) => Math.floor(Math.random() * max);
const pick = (arr) => arr[rand(arr.length)];

function makeDummyUsers() {
  return Array.from({ length: DUMMY_COUNT }, (_, i) => {
    const idx = i + 1;
    const suffix = pad2(idx);
    return {
      email: `dummy_user_${suffix}@quizbiz.local`,
      password: "Password123!",
      nickname: `Dummy${suffix}`,
    };
  });
}

function randomAttempt(userId, forced = null) {
  const total = 10;
  const difficulty = forced?.difficulty ?? pick(DIFFICULTIES);
  const createdAt = new Date(
    Date.now() - rand(1000 * 60 * 60 * 24 * 60) // last 60 days
  ).toISOString();

  let maxCorrect = 10;
  if (difficulty === "hard") maxCorrect = 8;
  if (difficulty === "easy") maxCorrect = 10;
  if (difficulty === "medium") maxCorrect = 9;

  const correct = 3 + rand(maxCorrect - 2);
  return {
    user_id: userId,
    category: forced?.category ?? pick(CATEGORIES),
    difficulty,
    correct,
    total,
    created_at: createdAt,
  };
}

async function listAllUsersByEmail() {
  const byEmail = new Map();
  let page = 1;
  const perPage = 200;

  for (;;) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const users = data?.users ?? [];
    for (const u of users) {
      if (u.email) byEmail.set(u.email.toLowerCase(), u.id);
    }

    if (users.length < perPage) break;
    page += 1;
  }

  return byEmail;
}

async function ensureDummyUsers() {
  const dummy = makeDummyUsers();
  const existingByEmail = await listAllUsersByEmail();
  const ensured = [];

  for (const d of dummy) {
    const existingId = existingByEmail.get(d.email.toLowerCase());
    if (existingId) {
      ensured.push({ id: existingId, nickname: d.nickname, email: d.email });
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: d.email,
      password: d.password,
      email_confirm: true,
      user_metadata: { nickname: d.nickname },
    });
    if (error) throw error;
    ensured.push({ id: data.user.id, nickname: d.nickname, email: d.email });
  }

  return ensured;
}

async function seedProfiles(users) {
  const rows = users.map((u) => ({
    id: u.id,
    nickname: u.nickname,
  }));

  const { error } = await supabase
    .from("profiles")
    .upsert(rows, { onConflict: "id", ignoreDuplicates: false });

  if (error) throw error;
}

async function clearAndSeedAttempts(users) {
  const userIds = users.map((u) => u.id);

  const { error: delAttemptsErr } = await supabase
    .from("quiz_attempts")
    .delete()
    .in("user_id", userIds);
  if (delAttemptsErr) throw delAttemptsErr;

  const { error: delScoresErr } = await supabase
    .from("scores")
    .delete()
    .in("user_id", userIds);
  if (delScoresErr) throw delScoresErr;

  const attempts = [];
  for (let idx = 0; idx < users.length; idx += 1) {
    const u = users[idx];
    const isFocusedUser = idx < FOCUSED_USER_COUNT;

    if (isFocusedUser) {
      for (const matchup of FOCUSED_MATCHUPS) {
        for (let i = 0; i < FOCUSED_ATTEMPTS_PER_MATCHUP; i += 1) {
          attempts.push(randomAttempt(u.id, matchup));
        }
      }
    }

    for (let i = 0; i < ATTEMPTS_PER_USER; i += 1) {
      attempts.push(randomAttempt(u.id));
    }
  }

  const { error: attemptErr } = await supabase.from("quiz_attempts").insert(attempts);
  if (attemptErr) throw attemptErr;

  const scores = attempts.map((a) => ({
    user_id: a.user_id,
    score: a.correct,
    total: a.total,
    category: a.category,
    difficulty: a.difficulty,
    created_at: a.created_at,
  }));

  const { error: scoreErr } = await supabase.from("scores").insert(scores);
  if (scoreErr) throw scoreErr;

  return { attemptsInserted: attempts.length, scoresInserted: scores.length };
}

async function main() {
  const users = await ensureDummyUsers();
  await seedProfiles(users);
  const { attemptsInserted, scoresInserted } = await clearAndSeedAttempts(users);

  console.log(`Dummy users ensured: ${users.length}`);
  console.log(`quiz_attempts inserted: ${attemptsInserted}`);
  console.log(`scores inserted: ${scoresInserted}`);
  console.log(
    `Focused users: ${FOCUSED_USER_COUNT}, matchups/user: ${FOCUSED_MATCHUPS.length}, attempts/matchup: ${FOCUSED_ATTEMPTS_PER_MATCHUP}`
  );
  console.log("Test login (all users): password is Password123!");
}

main().catch((err) => {
  console.error("Dummy seed failed:", err.message || err);
  process.exit(1);
});
