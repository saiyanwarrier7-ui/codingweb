export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  college_name?: string;
  department?: string;
  year_of_study?: string;
  role: UserRole;
  created_at: string;
}

export type ProblemDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  id?: string;
  input: string;
  expected_output: string;
  explanation?: string;
}

export interface HiddenTestCase {
  id: string;
  problem_id: string;
  input_data: string;
  expected_output: string;
  points: number;
  time_limit: number;
  memory_limit: number;
}

export interface LanguageTrack {
  id: string;
  name: string;
  slug: 'python' | 'cpp' | 'c' | 'html' | 'java';
  editor_mode: string;
  execution_language_id: string;
  icon: string;
  badge_color: string;
  description: string;
  is_enabled: boolean;
  topics: Array<{
    title: string;
    description: string;
    difficulty: ProblemDifficulty;
    items: string[];
  }>;
}

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  description: string;
  input_format: string;
  output_format: string;
  constraints: string;
  difficulty: ProblemDifficulty;
  topic_tags: string[];
  supported_languages: string[];
  starter_code: Record<string, string>;
  sample_tests: TestCase[];
  created_by?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export type SubmissionStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Compilation Error'
  | 'Runtime Error'
  | 'Time Limit Exceeded'
  | 'Internal Error';

export interface Submission {
  id: string;
  user_id: string;
  user_name?: string;
  problem_id: string;
  problem_title?: string;
  language_id: string;
  source_code: string;
  status: SubmissionStatus;
  passed_test_cases: number;
  total_test_cases: number;
  execution_time: number;
  memory_used: number;
  error_message?: string;
  submitted_at: string;
}

export interface ProblemProgress {
  id: string;
  user_id: string;
  problem_id: string;
  is_solved: boolean;
  first_solved_at?: string;
  last_attempted_at: string;
  attempts_count: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  problem_id: string;
  created_at: string;
}

export interface DailyChallenge {
  id: string;
  problem_id: string;
  challenge_date: string;
  points: number;
  problem?: CodingProblem;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  criteria: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  college_name?: string;
  problems_solved: number;
  points: number;
  current_streak: number;
  badges_count: number;
}

export interface ExecutionResult {
  status: SubmissionStatus;
  stdout: string;
  stderr: string;
  compile_output?: string;
  execution_time: number;
  memory_used?: number;
  passed: boolean;
}
