/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import AuthPage from './pages/AuthPage.tsx';

// Tabs Views
import Dashboard from './pages/Dashboard.tsx';
import DatasetManager from './pages/DatasetManager.tsx';
import ModelTrainer from './pages/ModelTrainer.tsx';
import PredictorForm from './pages/PredictorForm.tsx';
import ComparativeAnalytics from './pages/ComparativeAnalytics.tsx';
import AIAdvisor from './pages/AIAdvisor.tsx';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('iktara-theme');
    if (savedTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    // If student runs login, map them straight to predictor or dashboard
    setCurrentTab('dashboard');
  };

  const handleLogOut = () => {
    setUser(null);
    setCurrentTab('dashboard');
  };

  // Guard Clause for Credentials
  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderActiveTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'dataset':
        return <DatasetManager />;
      case 'trainer':
        return <ModelTrainer />;
      case 'predictor':
        return <PredictorForm />;
      case 'comparative':
        return <ComparativeAnalytics />;
      case 'advisor':
        return <AIAdvisor />;
      default:
        return <Dashboard />;
    }
  };

  const getPageHeaderTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Cohort Statistical Dashboard';
      case 'dataset': return 'Syllabus Cohort Importer';
      case 'trainer': return 'Machine Learning modeling suite';
      case 'predictor': return 'Diagnostic Performance Predictor';
      case 'comparative': return 'Benchmark Comparative Analytics';
      case 'advisor': return 'Academic Advisor companion AI';
      default: return 'Predictive analytics';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Dynamic Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        onLogOut={handleLogOut}
      />

      {/* Main interactive window area */}
      <div className="flex-1 pl-68 min-h-screen flex flex-col print:pl-0 print:min-h-0 print:bg-white">
        {/* Unified Application Header (Hidden during printing certificates) */}
        <div className="print:hidden">
          <Header title={getPageHeaderTitle()} />
        </div>

        {/* Content Container */}
        <main className="flex-1 p-8 print:p-0">
          <div className="max-w-7xl mx-auto">
            {renderActiveTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
