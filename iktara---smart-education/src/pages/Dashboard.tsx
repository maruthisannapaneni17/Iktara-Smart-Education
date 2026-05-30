/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, LineChart, Line, Cell, PieChart, Pie
} from 'recharts';
import {
  Users, Award, Calendar, Percent, BookOpen, AlertTriangle, ShieldCheck, ArrowRight, Activity
} from 'lucide-react';

export default function Dashboard() {
  const [chartsData, setChartsData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOnlyAtRisk, setShowOnlyAtRisk] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const summaryRes = await fetch('/api/dataset-summary');
      if (!summaryRes.ok) throw new Error('Failed to retrieve cohort information.');
      const summaryData = await summaryRes.json();
      setSummary(summaryData);

      const chartsRes = await fetch('/api/charts');
      if (!chartsRes.ok) throw new Error('Failed to retrieve analytics visualizations.');
      const charts = await chartsRes.json();
      setChartsData(charts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 text-slate-400">
        <span className="inline-block border-3 border-indigo-500/20 border-t-indigo-500 rounded-full w-10 h-10 animate-spin mb-4"></span>
        <p className="text-sm font-medium">Recompiling visual analytics dashboard charts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-200 text-sm">
        <h4 className="font-bold mb-2">Error Loading Visual Analytics</h4>
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/45 border border-red-500/30 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
        >
          Retry Calculations
        </button>
      </div>
    );
  }

  const studentCount = summary?.rowCount || 0;
  const attendanceAvg = summary?.stats?.attendance?.mean || 0;
  const studyHoursAvg = summary?.stats?.study_hours?.mean || 0;
  const examAvg = summary?.stats?.internal_marks?.mean || 0;

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const data = item.payload;

      if (data.department !== undefined) {
        // Pass/Fail ratio across departments chart
        return (
          <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-xl text-xs leading-relaxed min-w-[180px] backdrop-blur-md">
            <p className="font-bold text-slate-100 border-b border-slate-700/60 mb-2 pb-1.5 text-[13px]">{data.department}</p>
            {payload.map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center gap-4 mt-1.5">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
                  {p.name}:
                </span>
                <span className="font-bold text-slate-100 font-mono text-right">{p.value} students</span>
              </div>
            ))}
            <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-indigo-400 flex justify-between">
              <span>Pass Rate:</span>
              <span className="font-bold font-mono">{data.passPercentage}%</span>
            </div>
          </div>
        );
      } else if (data.attendance !== undefined && data.marks !== undefined) {
        // Scatter plot
        return (
          <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-xl text-xs leading-relaxed min-w-[190px] backdrop-blur-md">
            <p className="font-bold text-slate-100 border-b border-slate-700/60 mb-2 pb-1.5 text-[13px]">{data.name}</p>
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-400">Attendance:</span>
              <span className="font-bold text-indigo-300 font-mono">{data.attendance}%</span>
            </div>
            <div className="flex justify-between items-center gap-4 mt-1">
              <span className="text-slate-400">Internal Marks:</span>
              <span className="font-bold text-purple-300 font-mono">{data.marks}%</span>
            </div>
            <div className="mt-2.5 text-[10px] flex justify-between items-center border-t border-slate-800 pt-2">
              <span className="text-slate-400">Result Status:</span>
              <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${data.result === 'Pass' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                {data.result}
              </span>
            </div>
          </div>
        );
      } else if (data.semester !== undefined) {
        // Line chart (Semester trends)
        return (
          <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-xl text-xs leading-relaxed min-w-[180px] backdrop-blur-md">
            <p className="font-bold text-slate-100 border-b border-slate-700/60 mb-2 pb-1.5 text-[13px]">{data.semester}</p>
            {payload.map((p: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center gap-4 mt-1.5">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.color }} />
                  {p.name}:
                </span>
                <span className="font-bold text-slate-100 font-mono text-right">{p.value}%</span>
              </div>
            ))}
          </div>
        );
      } else {
        // Performance distribution bar chart
        return (
          <div className="bg-slate-900/95 border border-slate-700/80 p-3.5 rounded-xl shadow-xl text-xs leading-relaxed min-w-[180px] backdrop-blur-md">
            <p className="font-bold text-slate-100 border-b border-slate-700/60 mb-2 pb-1.5 text-[13px]">{data.name} Cohort</p>
            <div className="flex justify-between items-center gap-4">
              <span className="text-slate-400">Total Count:</span>
              <span className="font-bold text-slate-100 font-mono">{data.count}</span>
            </div>
            {summary?.rowCount && (
              <div className="flex justify-between items-center gap-4 mt-1">
                <span className="text-slate-400">Proportion:</span>
                <span className="font-bold text-indigo-400 font-mono">
                  {((data.count / summary.rowCount) * 100).toFixed(1)}%
                </span>
              </div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Quick Stats Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Cohort Card */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Cohort Size</span>
            <span className="text-3xl font-bold text-white mt-1 block font-display">{studentCount}</span>
            <span className="text-[10px] text-indigo-400 mt-1 block font-medium">Active Registered Profiles</span>
          </div>
          <div className="p-3.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
            <Users className="h-6 w-6" id="card-users-icon" />
          </div>
        </div>

        {/* Avg Attendance Card */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Avg Attendance</span>
            <span className="text-3xl font-bold text-white mt-1 block font-display">{attendanceAvg}%</span>
            <span className="text-[10px] text-emerald-400 mt-1 block font-medium">Within safe guidelines</span>
          </div>
          <div className="p-3.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Percent className="h-6 w-6" id="card-attendance-icon" />
          </div>
        </div>

        {/* Study Hours Card */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Self-study hours</span>
            <span className="text-3xl font-bold text-white mt-1 block font-display">{studyHoursAvg} hrs/wk</span>
            <span className="text-[10px] text-amber-500 mt-1 block font-medium">Average student self-study</span>
          </div>
          <div className="p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
            <BookOpen className="h-6 w-6" id="card-hours-icon" />
          </div>
        </div>

        {/* Grade Average Card */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Assesment Avg</span>
            <span className="text-3xl font-bold text-white mt-1 block font-display">{examAvg}%</span>
            <span className="text-[10px] text-purple-400 mt-1 block font-medium">Internal term avg</span>
          </div>
          <div className="p-3.5 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
            <Award className="h-6 w-6" id="card-marks-icon" />
          </div>
        </div>
      </div>

      {/* 2. Visual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Performance Distribution */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white font-display">Student Performance Distribution</h3>
            <p className="text-slate-400 text-xs mt-0.5">Classification counts from current academic cohort records</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData?.performanceDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tickLine={false} style={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tickLine={false} style={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.15)' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartsData?.performanceDistribution?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 2: Pass/Fail Ratio Stacked Bar */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white font-display">Pass / Fail Ratio Across Fields</h3>
            <p className="text-slate-400 text-xs mt-0.5">Comparison of targets across different academic branches</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartsData?.passFailByDept} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="department" stroke="#64748b" tickLine={false} style={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tickLine={false} style={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(51, 65, 85, 0.15)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Pass" fill="#10B981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Fail" fill="#EF4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 3: Scatter Plot Attendance vs Marks */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-white font-display">Attendance vs assessment Score Correlation</h3>
              <p className="text-slate-400 text-xs mt-0.5">Plotting individual attendance rates against internal exam grades</p>
            </div>
            
            {/* Filter Toggle */}
            <div className="flex items-center gap-2.5 bg-slate-900/40 border border-slate-700/50 px-3.5 py-1.5 rounded-xl self-start sm:self-auto transition-all duration-200">
              <span className="text-[11px] font-semibold text-slate-300">Show only At-Risk</span>
              <button
                type="button"
                id="scatter-risk-toggle"
                onClick={() => setShowOnlyAtRisk(!showOnlyAtRisk)}
                className={`relative inline-flex h-4.5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showOnlyAtRisk ? 'bg-rose-500' : 'bg-slate-750'
                }`}
                aria-checked={showOnlyAtRisk}
              >
                <span
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                    showOnlyAtRisk ? 'translate-x-4.5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis type="number" dataKey="attendance" name="Attendance" unit="%" domain={[40, 100]} stroke="#64748b" tickLines={false} style={{ fontSize: 11 }} />
                <YAxis type="number" dataKey="marks" name="Internal Marks" unit="%" domain={[30, 100]} stroke="#64748b" tickLines={false} style={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Passing Student" data={(chartsData?.scatterData?.filter((d: any) => d.result === 'Pass' && (!showOnlyAtRisk || d.riskLevel !== 'Low')) || [])} fill="#10B981" shape="circle" />
                <Scatter name="Failing risks" data={(chartsData?.scatterData?.filter((d: any) => d.result === 'Fail' && (!showOnlyAtRisk || d.riskLevel !== 'Low')) || [])} fill="#EF4444" shape="triangle" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graph 4: Line chart semester performance grades */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white font-display">Cohort Marks Trend</h3>
            <p className="text-slate-400 text-xs mt-0.5">Average academic progress comparing internal exams to previous semester</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartsData?.semesterTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="semester" stroke="#64748b" tickLine={false} style={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tickLine={false} style={{ fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="internalAverage" name="Assessments" stroke="#8B5CF6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="previousAverage" name="Prev Semester" stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Educational Preprocessing Stepper Mapping */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6">
        <div className="mb-6">
          <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            Machine Learning Workflow Preprocessing pipeline
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">Explore standard visual preprocessing steps from clean-ups to model inputs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Step 1 */}
          <div className="bg-slate-900/40 border border-slate-700/40 p-4 rounded-xl relative">
            <span className="absolute top-3 right-3 text-[10px] font-mono text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">01</span>
            <span className="block text-xs font-bold text-slate-200 uppercase tracking-wide">Data Imputation</span>
            <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
              Scan raw inputs. Missing study values or grades are filled automatically with the safe computed cohort mean.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-900/40 border border-slate-700/40 p-4 rounded-xl relative">
            <span className="absolute top-3 right-3 text-[10px] font-mono text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded">02</span>
            <span className="block text-xs font-bold text-slate-200 uppercase tracking-wide">Label Encoding</span>
            <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
              Convert strings to binary weights: <span className="font-mono text-amber-500">Male/Female</span> values yield <span className="font-mono text-indigo-400">0 / 1</span>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-900/40 border border-slate-700/40 p-4 rounded-xl relative">
            <span className="absolute top-3 right-3 text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">03</span>
            <span className="block text-xs font-bold text-slate-200 uppercase tracking-wide">MinMax Scaling</span>
            <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
              Scale continuous scores to <span className="font-mono text-indigo-400">0.0 - 1.0</span> boundaries so high marks don't overwhelm other indicators.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-900/40 border border-slate-700/40 p-4 rounded-xl relative">
            <span className="absolute top-3 right-3 text-[10px] font-mono text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">04</span>
            <span className="block text-xs font-bold text-slate-200 uppercase tracking-wide">Train-Test Split</span>
            <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
              Segregate records: <span className="font-mono text-indigo-400">75%</span> train indices fit classifier structure, <span className="font-mono text-indigo-400">25%</span> audit the accuracy.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-900/40 border border-slate-700/40 p-4 rounded-xl relative">
            <span className="absolute top-3 right-3 text-[10px] font-mono text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">05</span>
            <span className="block text-xs font-bold text-slate-200 uppercase tracking-wide">Inference Dial</span>
            <p className="text-slate-400 text-[11px] mt-2 leading-relaxed">
              Feed scaled metrics vector. Compute Gini/Sigmoid node thresholds to output probability margins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
