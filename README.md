Robert Johnson
rboswellj


🎯 QuizBiz

QuizBiz is a full-stack trivia application built with React and Supabase.
Users can sign up, take quizzes by category and difficulty, track their performance over time, and compete on weighted leaderboards.

🚀 Features
🔐 Authentication

Email/password authentication via Supabase

Nickname stored in a profiles table

Session persistence

Auth-aware UI (Navbar remains visible; content swaps dynamically)

🧠 Quiz Engine

Questions powered by the OpenTDB API

Selectable:

Category

Difficulty

10 questions per round

“Play Again” with fresh API fetch

Immediate answer feedback

📊 Scoring System

Each completed quiz saves:

Category

Difficulty

Correct answers

Total questions

Stored in quiz_attempts table

📈 Weighted Leaderboards

Score = sum(correct) / sum(total)

Calculated per:

Category

Difficulty

Requires minimum 50 total answered questions to rank

Sorted by:

Weighted %

Questions answered

Last played

👤 User Dashboard

Overall weighted percentage

Breakdown by category & difficulty

Recent quiz attempts

🛠 Tech Stack

Frontend

React

Vite

Custom hooks

CSS modules

Backend

Supabase (PostgreSQL + Auth + RPC functions)

API

OpenTDB (Open Trivia Database)

🗂 Database Structure
profiles
Column	    Type	Description
id	        uuid	references auth.users
nickname	text	public display name

quiz_attempts

Column	    Type	Description
id	        bigint	primary key
user_id	    uuid	references auth.users
category	int	    OpenTDB category id
difficulty	text	easy/medium/hard
correct	    int	number correct
total   	int	number of questions
created_at	timestamptz	default now()
Leaderboard Logic

Weighted percentage is calculated as:

sum(correct)::float / nullif(sum(total), 0)

Only users with:

sum(total) >= 50

are eligible for ranking.


Leaderboard data is exposed via a Supabase SECURITY DEFINER RPC function:

get_leaderboard_weighted(category, difficulty, limit)

This prevents exposing raw quiz attempts while still allowing ranked results.

Local Development
1. Clone the repo
git clone https://github.com/rboswellj/quiz-biz
cd quizbiz
2. Install dependencies
npm install
3. Add environment variables

Create a .env file:

VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
4. Run the app
npm run dev

