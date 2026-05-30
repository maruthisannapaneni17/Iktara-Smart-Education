/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Shield, GraduationCap, Lock, Mail, UserPlus, LogIn, Sparkles } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const endpoint = isRegister ? '/api/register' : '/api/login';
    const payload = isRegister ? { email, password, name, role } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Authenication process failed. Please double-check credentials.');
      }

      if (isRegister) {
        setSuccess('Registration successful! Please login with your new credentials.');
        setIsRegister(false);
        setPassword('');
      } else {
        onLoginSuccess(data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (userRole: 'admin' | 'student') => {
    setEmail(userRole === 'admin' ? 'admin@predictor.com' : 'student@predictor.com');
    setPassword(userRole === 'admin' ? 'admin' : 'student');
    setIsRegister(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-lg bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl shadow-2xl p-8 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 mb-3 animate-pulse">
            <GraduationCap className="h-8 w-8" id="auth-logo-icon" />
          </div>
          <h1 className="text-2xl font-bold font-display text-white tracking-tight" id="auth-title">
            IKTARA - Smart Education
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Machine Learning Diagnostics & Remediation Portal
          </p>
        </div>

        {/* Informative Messages */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-200 text-sm flex items-start gap-2 animate-shake">
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-200 text-sm flex items-start gap-2">
            <span className="font-semibold">Success:</span>
            <span>{success}</span>
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                  id="auth-name-input"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Mail className="h-4.5 w-4.5" />
              </span>
              <input
                type="email"
                required
                placeholder="e.g. analyst@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                id="auth-email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm"
                id="auth-password-input"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-slate-300 text-xs font-semibold mb-2 uppercase tracking-wider">
                Academic Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                    role === 'student'
                      ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400'
                      : 'bg-slate-900/30 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <User className="h-4 w-4" /> Student View
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                    role === 'admin'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                      : 'bg-slate-900/30 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <Shield className="h-4 w-4" /> Admin Console
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all mt-6 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            id="auth-submit-btn"
          >
            {loading ? (
              <span className="inline-block border-2 border-white/30 border-t-white rounded-full w-4 h-4 animate-spin"></span>
            ) : isRegister ? (
              <>
                <UserPlus className="h-4.5 w-4.5" /> Initialize Account
              </>
            ) : (
              <>
                <LogIn className="h-4.5 w-4.5" /> Sign In to System
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccess('');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-all underline font-medium cursor-pointer"
          >
            {isRegister ? 'Already have an academic profile? Sign in' : 'Request new performance analyzer credentials'}
          </button>
        </div>

        {/* Quick demo shortcut profiles */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <p className="text-slate-500 text-xs text-center font-medium mb-3 flex items-center justify-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            Quick Demo Profiles for Grading Evaluation
          </p>
          <div className="grid grid-cols-2 gap-3.5">
            <button
              onClick={() => handleDemoLogin('admin')}
              className="bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/40 hover:border-slate-600 text-slate-400 hover:text-white rounded-xl py-2 px-3 text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <Shield className="h-4 w-4 text-rose-400" />
              <span className="font-semibold text-slate-300">Admin Account</span>
              <span className="text-[10px] text-slate-500">Full Model training Suite</span>
            </button>
            <button
              onClick={() => handleDemoLogin('student')}
              className="bg-slate-900/40 hover:bg-slate-900/60 border border-slate-700/40 hover:border-slate-600 text-slate-400 hover:text-white rounded-xl py-2 px-3 text-xs flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
            >
              <GraduationCap className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">Student Account</span>
              <span className="text-[10px] text-slate-500">View diagnostic results</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
