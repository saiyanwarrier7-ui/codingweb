import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { ProblemsPage } from './pages/ProblemsPage';
import { ProblemWorkspacePage } from './pages/ProblemWorkspacePage';
import { LanguagesPage } from './pages/LanguagesPage';
import { LanguageDetailPage } from './pages/LanguageDetailPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { SubmissionsPage } from './pages/SubmissionsPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminProblemsPage } from './pages/AdminProblemsPage';
import { AdminProblemFormPage } from './pages/AdminProblemFormPage';
import { AdminSubmissionsPage } from './pages/AdminSubmissionsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Router matching logic
  const renderPage = () => {
    // 1. Home
    if (currentPath === '/') {
      return <HomePage onNavigate={navigate} />;
    }

    // 2. Problems list
    if (currentPath === '/problems') {
      return <ProblemsPage onNavigate={navigate} />;
    }

    // 3. Problem Workspace (/problems/:id)
    if (currentPath.startsWith('/problems/')) {
      const id = currentPath.replace('/problems/', '');
      return <ProblemWorkspacePage problemId={id} onNavigate={navigate} />;
    }

    // 4. Languages list
    if (currentPath === '/languages') {
      return <LanguagesPage onNavigate={navigate} />;
    }

    // 5. Language track (/languages/:slug)
    if (currentPath.startsWith('/languages/')) {
      const slug = currentPath.replace('/languages/', '');
      return <LanguageDetailPage slug={slug} onNavigate={navigate} />;
    }

    // 6. Leaderboard
    if (currentPath === '/leaderboard') {
      return <LeaderboardPage onNavigate={navigate} />;
    }

    // 7. Auth: Login & Register & Forgot Password
    if (currentPath === '/login') {
      return <LoginPage onNavigate={navigate} />;
    }
    if (currentPath === '/register') {
      return <RegisterPage onNavigate={navigate} />;
    }
    if (currentPath === '/forgot-password') {
      return <ForgotPasswordPage onNavigate={navigate} />;
    }

    // 8. Student Protected Pages
    if (currentPath === '/dashboard' || currentPath === '/my-progress') {
      return <StudentDashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/submissions') {
      return <SubmissionsPage onNavigate={navigate} />;
    }
    if (currentPath === '/bookmarks') {
      return <BookmarksPage onNavigate={navigate} />;
    }
    if (currentPath === '/profile') {
      return <ProfilePage onNavigate={navigate} />;
    }

    // 9. Admin Portal Pages
    if (currentPath === '/admin/login') {
      return <LoginPage onNavigate={navigate} isAdminLogin={true} />;
    }
    if (currentPath === '/admin' || currentPath === '/admin/dashboard') {
      return <AdminDashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin/problems') {
      return <AdminProblemsPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin/problems/create') {
      return <AdminProblemFormPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/admin/problems/') && currentPath.endsWith('/edit')) {
      const parts = currentPath.split('/');
      const problemId = parts[3];
      return <AdminProblemFormPage problemId={problemId} onNavigate={navigate} />;
    }
    if (currentPath === '/admin/submissions') {
      return <AdminSubmissionsPage onNavigate={navigate} />;
    }
    if (currentPath === '/admin/users') {
      return <AdminUsersPage onNavigate={navigate} />;
    }

    // Fallback: Home
    return <HomePage onNavigate={navigate} />;
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
          <Navbar currentPath={currentPath} onNavigate={navigate} />
          <main className="flex-1 flex flex-col">{renderPage()}</main>
          <Footer onNavigate={navigate} />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
