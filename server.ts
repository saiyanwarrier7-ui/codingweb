import express, { Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { dbStore } from './src/server/db.ts';
import { executeCode, normalizeOutput } from './src/server/executor.ts';
import { SubmissionStatus, UserProfile } from './src/server/types.ts';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'codearena-jwt-secret-key-change-in-production';

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Custom Request Interface with User Profile
export interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

// Auth Middleware: extracts user from Bearer header or cookie
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = dbStore.findProfileById(decoded.id);
    if (user) {
      req.user = user;
    }
  } catch (err) {
    // invalid token, proceed without user
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
  }
  next();
}

app.use(authenticateToken);

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// Register
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const {
      full_name,
      email,
      password,
      confirm_password,
      college_name,
      department,
      year_of_study,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const existing = dbStore.findProfileByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const newProfile: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      email,
      password_hash,
      full_name,
      college_name: college_name || undefined,
      department: department || undefined,
      year_of_study: year_of_study || undefined,
      role: 'student',
      created_at: new Date().toISOString(),
    };

    const saved = dbStore.createProfile(newProfile);

    const token = jwt.sign({ id: saved.id, role: saved.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Account created successfully!',
      user: saved,
      token,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = dbStore.findProfileByEmail(email);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password_hash, ...safeUser } = user;
    return res.json({
      message: 'Logged in successfully!',
      user: safeUser,
      token,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get Current Logged-in User
app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ user: null });
  }
  const { password_hash, ...safeUser } = req.user;
  return res.json({ user: safeUser });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully.' });
});

// Forgot / Reset Password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = dbStore.findProfileByEmail(email || '');
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address.' });
  }
  return res.json({
    message: 'Password reset link has been dispatched to your email address.',
    reset_token: 'demo-token-' + Date.now(),
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { email, new_password } = req.body;
  if (!email || !new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'Valid email and new password (min 6 chars) required.' });
  }
  const user = dbStore.findProfileByEmail(email);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(new_password, salt);
  dbStore.updateProfile(user.id, { password_hash });
  return res.json({ message: 'Password has been successfully updated. You may now log in.' });
});

// ==========================================
// 2. LANGUAGES & ROADMAPS
// ==========================================
app.get('/api/languages', (req: Request, res: Response) => {
  const languages = dbStore.getLanguages();
  const problems = dbStore.getProblems();

  const enriched = languages.map((lang) => {
    const langProblems = problems.filter((p) => p.supported_languages.includes(lang.slug));
    const easyCount = langProblems.filter((p) => p.difficulty === 'Easy').length;
    const mediumCount = langProblems.filter((p) => p.difficulty === 'Medium').length;
    const hardCount = langProblems.filter((p) => p.difficulty === 'Hard').length;

    return {
      ...lang,
      problemCount: langProblems.length,
      difficultyCounts: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
    };
  });

  return res.json(enriched);
});

app.get('/api/languages/:slug', (req: AuthenticatedRequest, res: Response) => {
  const lang = dbStore.getLanguageBySlug(req.params.slug);
  if (!lang) {
    return res.status(404).json({ error: 'Language track not found.' });
  }

  const problems = dbStore.getProblems({ language: lang.slug });
  let solvedProblemIds = new Set<string>();

  if (req.user) {
    const progress = dbStore.getProgressForUser(req.user.id);
    solvedProblemIds = new Set(progress.filter((p) => p.is_solved).map((p) => p.problem_id));
  }

  const enrichedProblems = problems.map((p) => ({
    ...p,
    is_solved: solvedProblemIds.has(p.id),
  }));

  const solvedCount = enrichedProblems.filter((p) => p.is_solved).length;

  return res.json({
    language: lang,
    problems: enrichedProblems,
    completionStats: {
      total: problems.length,
      solved: solvedCount,
      percentage: problems.length > 0 ? Math.round((solvedCount / problems.length) * 100) : 0,
    },
  });
});

// ==========================================
// 3. PROBLEMS & BOOKMARKS
// ==========================================
app.get('/api/problems', (req: AuthenticatedRequest, res: Response) => {
  const { language, difficulty, topic, search } = req.query;

  const problems = dbStore.getProblems({
    language: language as string,
    difficulty: difficulty as string,
    topic: topic as string,
    search: search as string,
  });

  let userSolved = new Set<string>();
  let userBookmarks = new Set<string>();

  if (req.user) {
    const progress = dbStore.getProgressForUser(req.user.id);
    userSolved = new Set(progress.filter((p) => p.is_solved).map((p) => p.problem_id));
    userBookmarks = new Set(dbStore.getBookmarks(req.user.id));
  }

  const result = problems.map((p) => ({
    ...p,
    is_solved: userSolved.has(p.id),
    is_bookmarked: userBookmarks.has(p.id),
  }));

  return res.json(result);
});

app.get('/api/problems/:id', (req: AuthenticatedRequest, res: Response) => {
  const problem = dbStore.getProblemById(req.params.id, req.user?.role === 'admin');
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found.' });
  }

  let is_solved = false;
  let is_bookmarked = false;

  if (req.user) {
    const progress = dbStore.getProgressForUser(req.user.id);
    is_solved = progress.some((p) => p.problem_id === problem.id && p.is_solved);
    is_bookmarked = dbStore.getBookmarks(req.user.id).includes(problem.id);
  }

  // Previous and Next problem IDs for navigation
  const allProblems = dbStore.getProblems();
  const currentIndex = allProblems.findIndex((p) => p.id === problem.id);
  const prevProblem = currentIndex > 0 ? allProblems[currentIndex - 1] : null;
  const nextProblem = currentIndex < allProblems.length - 1 ? allProblems[currentIndex + 1] : null;

  return res.json({
    ...problem,
    is_solved,
    is_bookmarked,
    navigation: {
      prevId: prevProblem?.id || null,
      prevTitle: prevProblem?.title || null,
      nextId: nextProblem?.id || null,
      nextTitle: nextProblem?.title || null,
    },
  });
});

// Toggle Bookmark
app.post('/api/problems/:id/bookmark', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const bookmarked = dbStore.toggleBookmark(req.user!.id, req.params.id);
  return res.json({ bookmarked });
});

// ==========================================
// 4. CODE EXECUTION & TEST CASES
// ==========================================

// Run Code (Sample test or Custom Input)
app.post('/api/code/run', async (req: Request, res: Response) => {
  try {
    const { language, code, stdin } = req.body;
    if (!language || typeof code !== 'string') {
      return res.status(400).json({ error: 'Language and code are required.' });
    }

    const result = await executeCode(language, code, stdin || '');
    return res.json(result);
  } catch (err: any) {
    console.error('Run code error:', err);
    return res.status(500).json({
      status: 'Internal Error',
      stdout: '',
      stderr: err.message || 'Execution failed',
      execution_time: 0,
      passed: false,
    });
  }
});

// Submit Solution (Server-side hidden test case evaluation!)
app.post('/api/code/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { problemId, language, code } = req.body;
    if (!problemId || !language || !code) {
      return res.status(400).json({ error: 'Problem ID, language, and code are required.' });
    }

    const problem = dbStore.getProblemById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found.' });
    }

    // Hidden test cases are queried exclusively on the server
    const hiddenTests = dbStore.getHiddenTestCases(problemId);
    const testsToRun = hiddenTests.length > 0 ? hiddenTests : (problem.sample_tests as any[]);

    if (testsToRun.length === 0) {
      return res.status(400).json({ error: 'No test cases configured for this problem.' });
    }

    let passedCount = 0;
    let finalStatus: SubmissionStatus = 'Accepted';
    let errorMessage = '';
    let totalTime = 0;

    for (let i = 0; i < testsToRun.length; i++) {
      const test = testsToRun[i];
      const testInput = test.input_data !== undefined ? test.input_data : test.input;
      const expectedOutput = test.expected_output;
      const timeLimit = test.time_limit || 3000;

      const execResult = await executeCode(language, code, testInput, expectedOutput, timeLimit);
      totalTime += execResult.execution_time;

      if (execResult.status === 'Compilation Error') {
        finalStatus = 'Compilation Error';
        errorMessage = execResult.compile_output || execResult.stderr;
        break;
      }

      if (execResult.status === 'Time Limit Exceeded') {
        finalStatus = 'Time Limit Exceeded';
        errorMessage = `Time limit exceeded on test case ${i + 1}`;
        break;
      }

      if (execResult.status === 'Runtime Error') {
        finalStatus = 'Runtime Error';
        errorMessage = execResult.stderr || 'Runtime error occurred';
        break;
      }

      // Check outputs
      if (language === 'html') {
        if (execResult.passed) {
          passedCount++;
        } else {
          finalStatus = 'Wrong Answer';
          errorMessage = execResult.stderr || `Validation failed on test ${i + 1}`;
          break;
        }
      } else {
        const actualNorm = normalizeOutput(execResult.stdout);
        const expectedNorm = normalizeOutput(expectedOutput);

        if (actualNorm === expectedNorm) {
          passedCount++;
        } else {
          finalStatus = 'Wrong Answer';
          errorMessage = `Failed on test case ${i + 1}. Expected: "${expectedNorm}", Got: "${actualNorm}"`;
          break;
        }
      }
    }

    const isAccepted = finalStatus === 'Accepted' && passedCount === testsToRun.length;
    const avgTime = Math.round(totalTime / Math.max(1, passedCount + (isAccepted ? 0 : 1)));

    // Record submission
    const submission: any = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: req.user!.id,
      user_name: req.user!.full_name,
      problem_id: problemId,
      problem_title: problem.title,
      language_id: language,
      source_code: code,
      status: finalStatus,
      passed_test_cases: passedCount,
      total_test_cases: testsToRun.length,
      execution_time: avgTime,
      memory_used: 10240,
      error_message: errorMessage || undefined,
      submitted_at: new Date().toISOString(),
    };

    dbStore.addSubmission(submission);

    // Update student progress & check achievements
    const progress = dbStore.updateProgress(req.user!.id, problemId, isAccepted);

    return res.json({
      submission,
      is_accepted: isAccepted,
      passed_test_cases: passedCount,
      total_test_cases: testsToRun.length,
      progress,
    });
  } catch (err: any) {
    console.error('Submission error:', err);
    return res.status(500).json({ error: 'Internal server error while grading submission.' });
  }
});

// ==========================================
// 5. STUDENT DASHBOARD & ANALYTICS
// ==========================================
app.get('/api/student/dashboard', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const submissions = dbStore.getSubmissions(userId, 50);
  const progressList = dbStore.getProgressForUser(userId);
  const bookmarks = dbStore.getBookmarks(userId);
  const achievements = dbStore.getUserAchievements(userId);
  const allProblems = dbStore.getProblems();

  const solvedSet = new Set(progressList.filter((p) => p.is_solved).map((p) => p.problem_id));
  const solvedCount = solvedSet.size;

  let easySolved = 0;
  let mediumSolved = 0;
  let hardSolved = 0;

  for (const pid of solvedSet) {
    const prob = allProblems.find((p) => p.id === pid);
    if (prob) {
      if (prob.difficulty === 'Easy') easySolved++;
      else if (prob.difficulty === 'Medium') mediumSolved++;
      else if (prob.difficulty === 'Hard') hardSolved++;
    }
  }

  const totalEasy = allProblems.filter((p) => p.difficulty === 'Easy').length;
  const totalMedium = allProblems.filter((p) => p.difficulty === 'Medium').length;
  const totalHard = allProblems.filter((p) => p.difficulty === 'Hard').length;

  // Language breakdown from accepted submissions
  const acceptedSubs = submissions.filter((s) => s.status === 'Accepted');
  const languageStats: Record<string, number> = {
    python: 0,
    cpp: 0,
    c: 0,
    html: 0,
    java: 0,
  };

  for (const s of acceptedSubs) {
    if (languageStats[s.language_id] !== undefined) {
      languageStats[s.language_id]++;
    }
  }

  // Acceptance rate
  const acceptanceRate =
    submissions.length > 0
      ? Math.round((acceptedSubs.length / submissions.length) * 100)
      : 100;

  // Bookmarked problems
  const bookmarkedProblems = allProblems.filter((p) => bookmarks.includes(p.id));

  // Activity dates map for heatmap
  const activityMap: Record<string, number> = {};
  for (const sub of submissions) {
    const day = sub.submitted_at.split('T')[0];
    activityMap[day] = (activityMap[day] || 0) + 1;
  }

  const currentStreak = Math.min(solvedCount * 2 + 1, 14);
  const longestStreak = Math.max(currentStreak, 7);

  return res.json({
    user: req.user,
    stats: {
      totalSolved: solvedCount,
      totalSubmissions: submissions.length,
      acceptanceRate,
      currentStreak,
      longestStreak,
      difficulty: {
        easy: { solved: easySolved, total: totalEasy },
        medium: { solved: mediumSolved, total: totalMedium },
        hard: { solved: hardSolved, total: totalHard },
      },
      languageStats,
    },
    recentSubmissions: submissions.slice(0, 10),
    bookmarkedProblems,
    achievements,
    activityMap,
  });
});

// Student Submissions History
app.get('/api/student/submissions', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const submissions = dbStore.getSubmissions(req.user!.id, 100);
  return res.json(submissions);
});

// Student Bookmarks
app.get('/api/student/bookmarks', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const bookmarks = dbStore.getBookmarks(req.user!.id);
  const problems = dbStore.getProblems().filter((p) => bookmarks.includes(p.id));
  return res.json(problems);
});

// Update Profile
app.put('/api/student/profile', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { full_name, college_name, department, year_of_study } = req.body;
  const updated = dbStore.updateProfile(req.user!.id, {
    full_name,
    college_name,
    department,
    year_of_study,
  });
  return res.json(updated);
});

// ==========================================
// 6. LEADERBOARD & ACHIEVEMENTS
// ==========================================
app.get('/api/leaderboard', (req: Request, res: Response) => {
  const leaderboard = dbStore.getLeaderboard();
  return res.json(leaderboard);
});

app.get('/api/achievements', (req: Request, res: Response) => {
  const achievements = dbStore.getAchievements();
  return res.json(achievements);
});

// ==========================================
// 7. DAILY CHALLENGE & PLATFORM STATS
// ==========================================
app.get('/api/daily-challenge', (req: Request, res: Response) => {
  const challenge = dbStore.getDailyChallenge();
  return res.json(challenge);
});

app.get('/api/stats', (req: Request, res: Response) => {
  const stats = dbStore.getPlatformStats();
  return res.json(stats);
});

// ==========================================
// 8. ADMIN DASHBOARD (PROTECTED)
// ==========================================
app.get('/api/admin/overview', requireAdmin, (req: Request, res: Response) => {
  const stats = dbStore.getPlatformStats();
  const allSubmissions = dbStore.getSubmissions(undefined, 10);
  const allUsers = dbStore.getProfiles();
  return res.json({
    stats,
    recentSubmissions: allSubmissions,
    usersCount: allUsers.length,
  });
});

app.get('/api/admin/problems', requireAdmin, (req: Request, res: Response) => {
  const problems = dbStore.getProblems({ includeUnpublished: true });
  return res.json(problems);
});

app.post('/api/admin/problems', requireAdmin, (req: AuthenticatedRequest, res: Response) => {
  const {
    title,
    description,
    input_format,
    output_format,
    constraints,
    difficulty,
    topic_tags,
    supported_languages,
    starter_code,
    sample_tests,
    hidden_test_cases,
    is_published,
  } = req.body;

  if (!title || !description || !difficulty) {
    return res.status(400).json({ error: 'Title, description, and difficulty are required.' });
  }

  const id = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const newProblem: any = {
    id,
    title,
    slug: id,
    description,
    input_format: input_format || '',
    output_format: output_format || '',
    constraints: constraints || '',
    difficulty,
    topic_tags: topic_tags || ['Basics'],
    supported_languages: supported_languages || ['python', 'cpp', 'c', 'java'],
    starter_code: starter_code || {},
    sample_tests: sample_tests || [],
    created_by: req.user!.id,
    is_published: is_published !== false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const hiddenTests = (hidden_test_cases || []).map((ht: any, idx: number) => ({
    id: `htc_${id}_${idx + 1}`,
    problem_id: id,
    input_data: ht.input_data,
    expected_output: ht.expected_output,
    points: ht.points || 10,
    time_limit: ht.time_limit || 2000,
    memory_limit: ht.memory_limit || 256,
  }));

  const created = dbStore.createProblem(newProblem, hiddenTests);
  return res.status(201).json(created);
});

app.put('/api/admin/problems/:id', requireAdmin, (req: Request, res: Response) => {
  const { hidden_test_cases, ...updates } = req.body;

  const hiddenTests = hidden_test_cases
    ? hidden_test_cases.map((ht: any, idx: number) => ({
        id: ht.id || `htc_${req.params.id}_${idx + 1}`,
        problem_id: req.params.id,
        input_data: ht.input_data,
        expected_output: ht.expected_output,
        points: ht.points || 10,
        time_limit: ht.time_limit || 2000,
        memory_limit: ht.memory_limit || 256,
      }))
    : undefined;

  const updated = dbStore.updateProblem(req.params.id, updates, hiddenTests);
  if (!updated) {
    return res.status(404).json({ error: 'Problem not found.' });
  }
  return res.json(updated);
});

app.delete('/api/admin/problems/:id', requireAdmin, (req: Request, res: Response) => {
  const success = dbStore.deleteProblem(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Problem not found.' });
  }
  return res.json({ message: 'Problem deleted successfully.' });
});

app.get('/api/admin/problems/:id/test-cases', requireAdmin, (req: Request, res: Response) => {
  const hiddenTests = dbStore.getHiddenTestCases(req.params.id);
  return res.json(hiddenTests);
});

app.get('/api/admin/submissions', requireAdmin, (req: Request, res: Response) => {
  const submissions = dbStore.getSubmissions(undefined, 100);
  return res.json(submissions);
});

app.get('/api/admin/users', requireAdmin, (req: Request, res: Response) => {
  const profiles = dbStore.getProfiles();
  return res.json(profiles);
});

app.get('/api/admin/export', requireAdmin, (req: Request, res: Response) => {
  const problems = dbStore.getProblems({ includeUnpublished: true });
  const exportData = problems.map((p) => ({
    ...p,
    hidden_test_cases: dbStore.getHiddenTestCases(p.id),
  }));
  res.setHeader('Content-Disposition', 'attachment; filename="codearena-problems.json"');
  res.setHeader('Content-Type', 'application/json');
  return res.send(JSON.stringify(exportData, null, 2));
});

// ==========================================
// 9. VITE DEV SERVER / STATIC DIST SERVING
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CodeArena Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
