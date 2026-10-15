import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Code2,
  Terminal,
  Trophy,
  BookOpen,
  LayoutDashboard,
  Bookmark,
  History,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Shield,
  ChevronDown,
} from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<Props> = ({ currentPath, onNavigate }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/', icon: Code2 },
    { label: 'Problems', path: '/problems', icon: Terminal },
    { label: 'Languages', path: '/languages', icon: BookOpen },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleLinkClick('/')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-cyan-200 to-purple-400 bg-clip-text text-transparent">
              CodeArena
            </span>
            <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded">
              v1.0
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              currentPath === link.path ||
              (link.path !== '/' && currentPath.startsWith(link.path));
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Right Action Icons & Auth Profile */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Admin Badge button if user is admin */}
          {user && user.role === 'admin' && (
            <button
              onClick={() => handleLinkClick('/admin/dashboard')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              Admin Portal
            </button>
          )}

          {/* User Auth state */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">
                    {user.full_name.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono capitalize">
                    {user.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl py-1 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-3 border-b border-slate-800/80">
                    <p className="font-semibold text-slate-100 truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    {user.college_name && (
                      <p className="text-[11px] text-cyan-400 font-medium truncate mt-0.5">
                        {user.college_name}
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleLinkClick('/dashboard')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                      Student Dashboard
                    </button>
                    <button
                      onClick={() => handleLinkClick('/my-progress')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
                    >
                      <Trophy className="w-4 h-4 text-amber-400" />
                      Progress & Stats
                    </button>
                    <button
                      onClick={() => handleLinkClick('/submissions')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
                    >
                      <History className="w-4 h-4 text-blue-400" />
                      My Submissions
                    </button>
                    <button
                      onClick={() => handleLinkClick('/bookmarks')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-purple-400" />
                      Bookmarked Problems
                    </button>
                    <button
                      onClick={() => handleLinkClick('/profile')}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 text-left transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Profile Settings
                    </button>
                  </div>

                  {user.role === 'admin' && (
                    <div className="py-1 border-t border-slate-800">
                      <button
                        onClick={() => handleLinkClick('/admin/dashboard')}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-purple-400 hover:bg-purple-950/40 text-left transition-colors font-medium"
                      >
                        <Shield className="w-4 h-4 text-purple-400" />
                        Admin Management
                      </button>
                    </div>
                  )}

                  <div className="py-1 border-t border-slate-800">
                    <button
                      onClick={async () => {
                        await logout();
                        setIsProfileDropdownOpen(false);
                        onNavigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-950/30 text-left transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLinkClick('/login')}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => handleLinkClick('/register')}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all"
              >
                Register
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleLinkClick(link.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </button>
            );
          })}
          {user && (
            <>
              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={() => handleLinkClick('/dashboard')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  Dashboard
                </button>
                <button
                  onClick={() => handleLinkClick('/submissions')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
                >
                  <History className="w-4 h-4 text-blue-400" />
                  Submissions
                </button>
                <button
                  onClick={() => handleLinkClick('/bookmarks')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
                >
                  <Bookmark className="w-4 h-4 text-purple-400" />
                  Bookmarks
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </header>
  );
};
