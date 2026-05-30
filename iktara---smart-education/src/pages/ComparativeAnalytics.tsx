/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { GitCompare, TrendingUp, HelpCircle, Users, Columns, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function ComparativeAnalytics() {
  const [history, setHistory] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Local benchmarks averages
  const classAverages = {
    attendance: 82,
    study_hours: 12,
    assignment_score: 75,
    internal_marks: 72,
    previous_marks: 70
  };

  const departmentAverages = {
    attendance: 84,
    study_hours: 14,
    assignment_score: 78,
    internal_marks: 74,
    previous_marks: 73
  };

  const fetchPredictHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/saved-predictions');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        if (data.length > 0) {
          setSelectedStudentId(data[0].id);
        }
      }
    } catch (e) {
      setError("Failed to load historical comparison registries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictHistory();
  }, []);

  const selectedRecord = history.find(h => h.id === selectedStudentId);

  // Construct comparative dataset for the Recharts Bar Chart
  const getComparativeChartData = () => {
    if (!selectedRecord) return [];
    
    const inputs = selectedRecord.inputs;
    return [
      {
        attribute: 'Attendance %',
        Individual: inputs.attendance,
        'Class Average': classAverages.attendance,
        'Dept Average': departmentAverages.attendance
      },
      {
        attribute: 'Assessments %',
        Individual: inputs.internal_marks,
        'Class Average': classAverages.internal_marks,
        'Dept Average': departmentAverages.internal_marks
      },
      {
        attribute: 'Assignments %',
        Individual: inputs.assignment_score,
        'Class Average': classAverages.assignment_score,
        'Dept Average': departmentAverages.assignment_score
      },
      {
        attribute: 'Self-study hours (x4)', // scaled for charting ease
        Individual: Math.min(100, inputs.study_hours * 4),
        'Class Average': Math.min(100, classAverages.study_hours * 4),
        'Dept Average': Math.min(100, departmentAverages.study_hours * 4)
      },
      {
        attribute: 'Prev Semester %',
        Individual: inputs.previous_marks,
        'Class Average': classAverages.previous_marks,
        'Dept Average': departmentAverages.previous_marks
      }
    ];
  };

  const chartData = getComparativeChartData();

  // Draw comparison deviation blocks
  const renderDeviationRow = (label: string, indVal: number, classAvg: number, deptAvg: number, suffix: string = '%') => {
    const classDiff = indVal - classAvg;
    const deptDiff = indVal - deptAvg;

    return (
      <tr className="hover:bg-slate-700/20 text-xs">
        <td className="py-2.5 px-3.5 font-semibold text-slate-200 capitalize">{label}</td>
        <td className="py-2.5 px-3.5 text-slate-300 font-mono text-center font-semibold">{indVal}{suffix}</td>
        
        {/* Class Deviation */}
        <td className="py-2.5 px-3.5 text-center">
          <span className={`inline-flex items-center gap-0.5 font-bold font-mono px-2 py-0.5 rounded ${
            classDiff >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
          }`}>
            {classDiff >= 0 ? '+' : ''}{classDiff.toFixed(1)}{suffix}
            {classDiff >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          </span>
        </td>

        {/* Dept Deviation */}
        <td className="py-2.5 px-3.5 text-center">
          <span className={`inline-flex items-center gap-0.5 font-bold font-mono px-2 py-0.5 rounded ${
            deptDiff >= 0 ? 'text-emerald-300 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
          }`}>
            {deptDiff >= 0 ? '+' : ''}{deptDiff.toFixed(1)}{suffix}
            {deptDiff >= 0 ? <ArrowUpRight className="h-3 w-3 animate-bounce" /> : <ArrowDownRight className="h-3 w-3" />}
          </span>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in animate-duration-300">
      {/* 1. Selector area */}
      <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white font-display">Comparative Benchmark Analysis</h3>
          <p className="text-slate-400 text-xs mt-0.5">Select a diagnostics record from saved predictions history to compare against benchmarks</p>
        </div>

        <div>
          {history.length > 0 ? (
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl py-2 px-4 text-slate-200 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer w-full md:w-64"
              id="comparative-student-select"
            >
              {history.map((record) => (
                <option key={record.id} value={record.id}>
                  {record.studentName} ({record.category})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-slate-500 font-mono">No prediction history loaded</span>
          )}
        </div>
      </div>

      {selectedRecord ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparative visual chart */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 lg:col-span-2">
            <h3 className="text-base font-bold text-white font-display mb-1">Side-by-Side Parameter Comparison</h3>
            <p className="text-slate-400 text-xs mb-5">Comparing active candidate inputs against class standard score grids</p>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="attribute" stroke="#64748b" tickLine={false} style={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} stroke="#64748b" tickLine={false} style={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                  <Bar dataKey="Individual" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Class Average" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Dept Average" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deviation table */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white font-display mb-1">Diagnostic Deviations</h3>
              <p className="text-slate-400 text-xs mb-5">Specific variance compared against baseline limits</p>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2 px-3 text-left">Category</th>
                      <th className="py-2 px-3 text-center">Score</th>
                      <th className="py-2 px-3 text-center">vs Class</th>
                      <th className="py-2 px-3 text-center">vs Dept</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {renderDeviationRow('Attendance', selectedRecord.inputs.attendance, classAverages.attendance, departmentAverages.attendance)}
                    {renderDeviationRow('Assessments', selectedRecord.inputs.internal_marks, classAverages.internal_marks, departmentAverages.internal_marks)}
                    {renderDeviationRow('Assignments', selectedRecord.inputs.assignment_score, classAverages.assignment_score, departmentAverages.assignment_score)}
                    {renderDeviationRow('Self-study', selectedRecord.inputs.study_hours, classAverages.study_hours, departmentAverages.study_hours, 'h')}
                    {renderDeviationRow('Prev Semester', selectedRecord.inputs.previous_marks, classAverages.previous_marks, departmentAverages.previous_marks)}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/50 mt-6 text-[11px] text-slate-500 leading-relaxed font-sans font-medium">
              A positive value (<span className="text-emerald-400">+</span>) denotes the candidate is outperforming the benchmark cohort, while a negative score indicates a vital point for immediate study plan intervention.
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-10 text-center text-slate-500 text-xs space-y-3">
          <GitCompare className="h-10 w-10 mx-auto text-slate-600 mb-2 animate-pulse" />
          <h4 className="font-bold text-slate-300 font-display text-sm">No predictions found</h4>
          <p className="px-6 max-w-md mx-auto leading-relaxed">
            Please run at least one student prediction in the **Predictor Form** tab first. Once recorded, full side-by-side benchmark comparative analytics will launch here.
          </p>
        </div>
      )}
    </div>
  );
}
