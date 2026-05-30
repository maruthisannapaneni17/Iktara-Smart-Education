/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Database,
  Brain,
  Binary,
  GitCompare,
  MessageSquare,
  LogOut,
  GraduationCap,
  Shield,
  User
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: {
    name: string;
    email: string;
    role: 'admin' | 'student';
  };
  onLogOut: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, user, onLogOut }: SidebarProps) {
  const isAdmin = user.role === 'admin';

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
    { id: 'dataset', label: 'Dataset Manager', icon: Database, adminOnly: true },
    { id: 'trainer', label: 'Model Trainer', icon: Brain, adminOnly: true },
    { id: 'predictor', label: 'Predictor Form', icon: Binary, adminOnly: false },
    { id: 'comparative', label: 'Comparative Analytics', icon: GitCompare, adminOnly: false },
    { id: 'advisor', label: 'AI Academic Advisor', icon: MessageSquare, adminOnly: false },
  ];

  return (
    <aside className="w-68 bg-slate-800 border-r border-slate-700/60 flex flex-col h-screen fixed top-0 left-0 z-20">
      {/* Brand area */}
      <div className="p-6 border-b border-slate-700/60 flex items-center gap-3">
        <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-white block font-display leading-tight">
            IKTARA
          </span>
          <span className="text-[10px] text-indigo-400 block font-semibold uppercase tracking-wider">
            Smart Education
          </span>
        </div>
      </div>

      {/* Nav Link list */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider px-3 mb-2">
          Diagnostic Suite
        </p>
        {menuItems.map((item) => {
          if (item.adminOnly && !isAdmin) return null;

          const IconComponent = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-700/40 hover:text-slate-200'
              }`}
              id={`sidebar-tab-${item.id}`}
            >
              <IconComponent className={`h-4.5 w-4.5 shrink-0 transition-transform group-hover:scale-105 ${
                isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'
              }`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User block */}
      <div className="p-4 border-t border-slate-700/60 bg-slate-900/35">
        <div className="flex items-center gap-3 px-2 py-1 mb-3.5">
          <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400 shrink-0">
            {isAdmin ? (
              <Shield className="h-4.5 w-4.5 text-rose-400" />
            ) : (
              <User className="h-4.5 w-4.5 text-emerald-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-slate-200 block truncate leading-tight">
              {user.name}
            </span>
            <span className="text-[10px] text-slate-500 block truncate">
              {user.role === 'admin' ? 'Administrator' : 'Student'}
            </span>
          </div>
        </div>

        <button
          onClick={onLogOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-700/60 hover:border-red-500/30 hover:bg-red-500/5 text-slate-400 hover:text-red-400 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          id="sidebar-logout-btn"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign Out Session
        </button>
      </div>
    </aside>
  );
}
