import React, { useEffect, useState } from 'react';
import { Users, ChevronLeft, Shield, User, School, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { useAuth } from '../context/AuthContext';

interface Props {
  onNavigate: (path: string) => void;
}

export const AdminUsersPage: React.FC<Props> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('codearena_token')}`,
          },
        });
        if (res.ok) {
          setProfiles(await res.json());
        }
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user && user.role === 'admin') {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-bold text-white mb-2">Admin Authorization Required</h2>
        <button
          onClick={() => onNavigate('/admin/login')}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => onNavigate('/admin/dashboard')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 transition-colors mb-3"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Admin Overview</span>
          </button>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Registered Student Accounts ({profiles.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Directory of all student profiles, college affiliations, and platform roles.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-mono text-slate-400 flex flex-col items-center justify-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400 animate-spin" />
          <span>Loading user accounts...</span>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Institution</th>
                  <th className="py-3 px-4">Department & Year</th>
                  <th className="py-3 px-4 text-center">Role</th>
                  <th className="py-3 px-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-100 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs">
                        {p.full_name.charAt(0)}
                      </div>
                      <span>{p.full_name}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">{p.email}</td>

                    <td className="py-3.5 px-4 font-sans text-slate-400">
                      {p.college_name || '—'}
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-400">
                      {p.department ? `${p.department} (${p.year_of_study || 'N/A'})` : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.role === 'admin'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        }`}
                      >
                        {p.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-500 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
