/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Calendar, RefreshCw, Cpu, Activity, Database, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [activeModel, setActiveModel] = useState<string>("Loading active model...");
  const [cohortSize, setCohortSize] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('iktara-theme') as 'light' | 'dark') || 'dark';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('iktara-theme', nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const modelRes = await fetch('/api/model-accuracy');
      if (modelRes.ok) {
        const models = await modelRes.json();
        const active = models.find((m: any) => m.isActive);
        if (active) {
          setActiveModel(`${active.name} (${Math.round(active.accuracy * 100)}% Acc)`);
        } else if (models.length > 0) {
          setActiveModel(models[0].name);
        } else {
          setActiveModel("None trained");
        }
      }

      const summaryRes = await fetch('/api/dataset-summary');
      if (summaryRes.ok) {
        const summary = await summaryRes.json();
        setCohortSize(summary.rowCount || 0);
      }
    } catch (e) {
      setActiveModel("Offline mode");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Listening to custom triggers if someone updates models or uploads datasets
    window.addEventListener('refreshHeader', fetchStatus);
    return () => window.removeEventListener('refreshHeader', fetchStatus);
  }, []);

  return (
    <header className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/60 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold font-display text-white tracking-tight" id="header-page-title">
          {title}
        </h1>
        {loading && (
          <span className="inline-block w-4 h-4 rounded-full border-2 border-slate-400 border-t-transparent animate-spin"></span>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Model State Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-900/40 rounded-xl border border-slate-700/50 text-xs">
          <Cpu className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-semibold text-slate-400">Active ML Classifier:</span>
          <span className="font-mono text-indigo-300 font-bold">{activeModel}</span>
        </div>

        {/* Database Size Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/40 rounded-xl border border-slate-700/50 text-xs">
          <Database className="h-3.5 w-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-400">Syllabus Cohorts:</span>
          <span className="font-mono text-emerald-300 font-bold">{cohortSize} students</span>
        </div>

        {/* Theme Toggle Indicator */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-white bg-slate-700/35 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all cursor-pointer flex items-center justify-center"
          title={theme === 'light' ? "Activate Dark theme mode" : "Activate Light theme mode"}
          id="theme-mode-toggle-btn"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>

        {/* Refresh Indicator */}
        <button
          onClick={fetchStatus}
          className="p-2 text-slate-400 hover:text-white bg-slate-700/35 hover:bg-slate-700/70 border border-slate-700/50 hover:border-slate-600 rounded-xl transition-all cursor-pointer"
          title="Synch Diagnostics"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
