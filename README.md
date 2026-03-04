## Quiz Biz
github.com/rboswellj

Quiz Biz is a React + Supabase trivia app. Features include:
- sign up/sign in
- play quizzes based on selectable categories/difficulties
- Saved statistics at end of each round
- view personal score breakdowns
- view weighted leaderboards by category and difficulty

## Tech Stack
- React 19 + Vite
- Supabase Auth + Postgres + RLS + RPC
- OpenTDB API for trivia questions

## Prerequisites
- Node.js 20+ (recommended)
- npm 10+
- A Supabase project

## CodeLou Requirements
- Analyze data that is stored in arrays, objects, sets or maps and display information about it in your app.
    - Maps used to sort through received data from api calls and display in score tables, as well as to build question card.
- Validate user input and either prevent the invalid input or inform the user about it
    - Login verifies existing user account. Signup prevents repeating an in use nickname as well as verifying length and valid email. 
- Visualize data in a user friendly way
    - User scores and leaderboards displayed in tables with percentages correct by category and difficulty. Percentages displaued with color coded bars.
- Develop your project using a common JavaScript framework such as React, Svelte, or Vue.
    - React used
- Interact with a SQLite database to store and retrieve information (requires building an API)
    Not sure if this counts, but I am interacting with supabase using its existing api.
- Persist important data to the user to local storage and make the stored data accessible in your app.
    Sign in is persistent, though the supabase package does most of the work on that front.

## AI disclosure
- I had AI create the script to create the dummy accounts and push their data to the DB. I figured that was harmless since it is just for populating fake users for testing in the dev environment and is not part of the published product.

## Project Setup
Project has also been deployed to https://quiz-biz.rboswellj.workers.dev/ 

1. Clone and install dependencies:

```bash
git clone https://github.com/rboswellj/quiz-biz.git
cd quiz-biz
npm install
```

2. Create `.env` in the project root:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
```

3. Start the frontend:

```bash
npm run dev
```

4. Open the local URL shown by Vite (usually `http://localhost:5173`).

## Supabase Schema Setup (Important)
This repo includes a full schema file at:
- `schema.sql`

It creates:
- tables: `profiles`, `quiz_attempts`, `scores`
- views: `my_weighted_stats`, `leaderboard_weighted`, `leaderboard_weighted_named`
- RPC: `get_leaderboard_weighted(...)`
- constraints, indexes, RLS policies, and grants

### Option A: Supabase Dashboard (quickest)
1. Open Supabase Dashboard for your project.
2. Go to `SQL Editor`.
3. Open local `schema.sql` and copy/paste contents.
4. Run the script.

### Option B: Supabase CLI (if you use local SQL workflow)
From repo root:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

If you want to execute this exact file directly:

```bash
supabase db reset --linked < schema.sql
```

Note: `db reset` is destructive for linked DBs. Use only on safe/non-production environments.

## Verify Schema Loaded Correctly
In Supabase SQL Editor, run:

```sql
select to_regclass('public.profiles') as profiles_table,
       to_regclass('public.quiz_attempts') as attempts_table,
       to_regclass('public.scores') as scores_table;

select routine_name
from information_schema.routines
where routine_schema = 'public'
  and routine_name = 'get_leaderboard_weighted';
```

Expected:
- all table checks are non-null
- RPC function appears in results

## Auth Setup Notes
- Authentication uses Supabase Email/Password.
- `profiles.id` references `auth.users.id`.
- Nickname is stored in `profiles.nickname`.

## Scripts
- `npm run dev`: run Vite dev server
- `npm run build`: production build
- `npm run preview`: preview production build
- `npm run lint`: run ESLint
- `npm run seed:dummy`: create/update 20 dummy users and seed dummy attempts/scores

## Seed Dummy Data
Use this when you want leaderboard/test data quickly.

1. Ensure these env vars exist in `.env`:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Run from repo root:

```bash
npm run seed:dummy
```

What it does:
- ensures 20 dummy auth users (`dummy_user_01@quizbiz.local` ... `dummy_user_20@quizbiz.local`)
- upserts matching `profiles` rows
- clears existing `quiz_attempts` and `scores` for those dummy users, then reseeds them
- includes focused high-volume matchups so leaderboard buckets populate faster

Test login for seeded dummy users:
- password is `Password123!`

Security note:
- `SUPABASE_SERVICE_ROLE_KEY` is admin-level. Keep it server-side only and never expose it in frontend code.

## Troubleshooting
- `Invalid API key` or `Failed to fetch`:
  - confirm `.env` values and restart dev server
- RLS errors inserting attempts/profiles:
  - make sure `schema.sql` completed successfully
  - confirm you are authenticated in-app
- Leaderboards empty:
  - leaderboard requires enough attempt data in each bucket
  - check `quiz_attempts` has rows for multiple users/categories/difficulties
