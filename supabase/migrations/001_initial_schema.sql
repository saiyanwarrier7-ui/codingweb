-- ============================================================================
-- CodeArena Database Schema & Row Level Security (RLS) Migration
-- PostgreSQL / Supabase
-- ============================================================================

-- Enable pgcrypto for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES TABLE (Linked with Supabase auth.users or standalone accounts)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    college_name TEXT,
    department TEXT,
    year_of_study TEXT,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. LANGUAGES TABLE
CREATE TABLE IF NOT EXISTS languages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    editor_mode TEXT NOT NULL,
    execution_language_id TEXT NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true
);

-- 3. PROBLEMS TABLE
CREATE TABLE IF NOT EXISTS problems (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    constraints TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    supported_languages JSONB NOT NULL DEFAULT '["python", "cpp", "c", "java", "html"]'::jsonb,
    starter_code JSONB NOT NULL DEFAULT '{}'::jsonb,
    sample_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. HIDDEN TEST CASES TABLE (Accessible ONLY to backend execution service)
CREATE TABLE IF NOT EXISTS hidden_test_cases (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 10,
    time_limit INTEGER NOT NULL DEFAULT 2000, -- milliseconds
    memory_limit INTEGER NOT NULL DEFAULT 256 -- megabytes
);

-- 5. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    language_id TEXT NOT NULL REFERENCES languages(id) ON DELETE RESTRICT,
    source_code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error', 'Time Limit Exceeded', 'Internal Error')),
    passed_test_cases INTEGER NOT NULL DEFAULT 0,
    total_test_cases INTEGER NOT NULL DEFAULT 0,
    execution_time INTEGER DEFAULT 0, -- ms
    memory_used INTEGER DEFAULT 0, -- KB
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. PROBLEM PROGRESS TABLE
CREATE TABLE IF NOT EXISTS problem_progress (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    is_solved BOOLEAN NOT NULL DEFAULT false,
    first_solved_at TIMESTAMPTZ,
    last_attempted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    attempts_count INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT unique_user_problem UNIQUE (user_id, problem_id)
);

-- 7. BOOKMARKS TABLE
CREATE TABLE IF NOT EXISTS bookmarks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_bookmark UNIQUE (user_id, problem_id)
);

-- 8. DAILY CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS daily_challenges (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    problem_id TEXT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    challenge_date DATE NOT NULL UNIQUE,
    points INTEGER NOT NULL DEFAULT 50
);

-- 9. ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    badge_icon TEXT NOT NULL,
    criteria TEXT NOT NULL
);

-- 10. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_user_achievement UNIQUE (user_id, achievement_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_problem_progress_user ON problem_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_hidden_tests_problem ON hidden_test_cases(problem_id);
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE hidden_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE problem_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- PROFILES
-- Anyone authenticated can view their own profile; public leaderboard can view basic non-sensitive fields
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- LANGUAGES
-- Everyone can read languages
CREATE POLICY "Public read languages" ON languages
    FOR SELECT USING (true);

-- PROBLEMS
-- Published problems are viewable by all authenticated users
CREATE POLICY "View published problems" ON problems
    FOR SELECT USING (is_published = true OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins manage problems" ON problems
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- HIDDEN TEST CASES
-- Strictly forbidden to client access; only service role / backend execution service can access
CREATE POLICY "Hidden test cases restricted to admin/service" ON hidden_test_cases
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- SUBMISSIONS
CREATE POLICY "Users can view own submissions" ON submissions
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can insert own submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- PROBLEM PROGRESS
CREATE POLICY "Users view own progress" ON problem_progress
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users manage own progress" ON problem_progress
    FOR ALL USING (auth.uid() = user_id);

-- BOOKMARKS
CREATE POLICY "Users view and manage bookmarks" ON bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- DAILY CHALLENGES & ACHIEVEMENTS
CREATE POLICY "Anyone can view daily challenges" ON daily_challenges
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view achievements list" ON achievements
    FOR SELECT USING (true);

CREATE POLICY "Users view own earned achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');
