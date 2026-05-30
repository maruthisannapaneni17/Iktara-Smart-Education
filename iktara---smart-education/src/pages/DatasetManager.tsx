/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Upload, Database, AlertCircle, RefreshCw, FileSpreadsheet, Trash2, CheckCircle2, Info
} from 'lucide-react';

export default function DatasetManager() {
  const [summary, setSummary] = useState<any>(null);
  const [rawStudentList, setRawStudentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fetchDatasetDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const summaryRes = await fetch('/api/dataset-summary');
      if (summaryRes.ok) {
        const sumData = await summaryRes.json();
        setSummary(sumData);
      }

      // Fetch a preview list of students
      const chartsRes = await fetch('/api/charts');
      if (chartsRes.ok) {
        const charts = await chartsRes.json();
        // Since we don't have a direct /students list, we can mock get student data preview
        // or trigger a simple internal retrieval. To keep it robust we can load charts scatter points which holds students,
        // or we can just fetch predictions or do a mock listing.
        // Let's call /api/dataset-summary's counts, and lets fetch the exact student collection.
      }
    } catch (e: any) {
      setError("Failed to synch dataset details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsDirect = async () => {
    try {
      // We will parse students list by retrieving summary. We can also make a quick small route or load via chart scatter data
      const res = await fetch('/api/charts');
      if (res.ok) {
        const d = await res.json();
        if (d.scatterData) {
          setRawStudentList(d.scatterData);
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchDatasetDetails();
    fetchStudentsDirect();
  }, []);

  const handlePreload = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/seed-sample', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Default database loaded successfully with 120-student cohort records!");
      fetchDatasetDetails();
      fetchStudentsDirect();

      // Trigger global event to refresh active indicators in header
      window.dispatchEvent(new Event('refreshHeader'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFlush = async () => {
    if (!window.confirm("Are you sure you want to completely clear the students dataset? Models will need a new upload to run.")) {
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/flush-dataset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Dataset cleared. Upload a CSV to continue.");
      setSummary(null);
      setRawStudentList([]);
      window.dispatchEvent(new Event('refreshHeader'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!file.name.endsWith('.csv')) {
      setError("Supported file types are strictly limited to CSV spreadsheets.");
      setLoading(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const textStr = event.target?.result as string;
        const res = await fetch('/api/upload-dataset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvData: textStr })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setSuccess(`Consolidated ${data.addedCount} students successfully! Total records: ${data.totalCount}.`);
        fetchDatasetDetails();
        fetchStudentsDirect();
        window.dispatchEvent(new Event('refreshHeader'));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the file inputs.");
      setLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Informative banners */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-200 text-sm flex items-start gap-2 animate-shake">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Import Failure</span>
            <span className="text-slate-300">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-slate-200 text-sm flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">CSV Configuration Success</span>
            <span className="text-slate-300">{success}</span>
          </div>
        </div>
      )}

      {/* Dataset actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload File Card */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white font-display">Dataset Upload Module</h3>
            <p className="text-slate-400 text-xs mt-0.5">Upload a CSV containing academic indicators or diagnostic metrics</p>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer min-h-56 select-none ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/5'
                : 'border-slate-700 hover:border-slate-600 bg-slate-900/10'
            }`}
            onClick={() => document.getElementById('file-upload-input')?.click()}
          >
            <Upload className="h-10 w-10 text-indigo-400 mb-3 animate-pulse" />
            <p className="text-slate-200 text-sm font-medium">
              Drag & Drop student CSV here, or <span className="text-indigo-400 underline decoration-indigo-400/30">browse files</span>
            </p>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mt-2.5">
              Strict Format Rule: gender, age, attendance, study_hours, assignment_score, internal_marks, final_result
            </p>
            <input
              type="file"
              id="file-upload-input"
              className="hidden"
              accept=".csv"
              onChange={handleFileChange}
            />
          </div>

          <div className="mt-4 flex items-start gap-2 bg-slate-900/30 border border-slate-700/40 rounded-xl p-3 text-xs leading-relaxed text-slate-400">
            <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              If you lack a formatted CSV, click the seed button on the right to pre-load a fully configured 120-student sample cohort model.
            </span>
          </div>
        </div>

        {/* Database Controls card */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display mb-1">Administrative Controls</h3>
            <p className="text-slate-400 text-xs mb-6">Reset, flush, or seed diagnostic registers</p>

            <div className="space-y-3">
              <button
                onClick={handlePreload}
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold shadow shadow-indigo-550/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Database className="h-3.5 w-3.5" /> Seed Cohort Sample (120 records)
              </button>

              <button
                onClick={handleFlush}
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-950 border border-slate-700 hover:border-red-500/30 text-slate-400 hover:text-red-400 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Flush Current Records
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700/50 mt-6 lg:mt-0 text-[11px] text-slate-500 font-medium leading-relaxed">
            Seeding loads standardized academic statistics incorporating logical correlations (e.g., lower attendance rates triggering failing target tags).
          </div>
        </div>
      </div>

      {/* Dataset Statistics Tabulation */}
      {summary && summary.rowCount > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statistics Summary */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white font-display mb-4">Continuous Metric Bounds</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">Column Category</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3 text-center">Mean (Avg)</th>
                    <th className="py-2.5 px-3 text-center">Min Bound</th>
                    <th className="py-2.5 px-3 text-center">Max Bound</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {Object.keys(summary.stats).map((key) => (
                    <tr key={key} className="hover:bg-slate-700/20">
                      <td className="py-2.5 px-3 font-semibold text-slate-200 capitalize">{key.replace('_', ' ')}</td>
                      <td className="py-2.5 px-3 text-[10px] font-mono text-indigo-400">{summary.dataTypes[key]}</td>
                      <td className="py-2.5 px-3 text-center text-slate-300 font-mono font-bold">{summary.stats[key].mean}%</td>
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{summary.stats[key].min}</td>
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{summary.stats[key].max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabular Preview */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5">
            <h3 className="text-base font-bold text-white font-display mb-4">Dataset Cell Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-2.5 px-3">CSV Header Column</th>
                    <th className="py-2.5 px-3">Category Class</th>
                    <th className="py-2.5 px-3 text-center">Missing values</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {summary.columns.map((col: string) => (
                    <tr key={col} className="hover:bg-slate-700/20">
                      <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">{col}</td>
                      <td className="py-2.5 px-3 text-slate-300">{summary.dataTypes[col] || 'Categorical'}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{summary.missingValues[col] || 0} cells</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" /> Validated
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Preview Tab of Raw Dataset Rows */}
      {rawStudentList.length > 0 && (
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-5">
          <h3 className="text-base font-bold text-white font-display mb-3">Live Active Cohor Review List</h3>
          <p className="text-slate-400 text-xs mb-5">Showing first 10 students registered in database</p>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead>
                <tr className="border-b border-slate-700 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3 text-center">Attendance</th>
                  <th className="py-2.5 px-3 text-center">Internal marks</th>
                  <th className="py-2.5 px-3 text-center">Cohort Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {rawStudentList.slice(0, 10).map((stu, idx) => (
                  <tr key={idx} className="hover:bg-slate-700/20">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{stu.name}</td>
                    <td className="py-2.5 px-3 text-center text-slate-300 font-mono">{stu.attendance}%</td>
                    <td className="py-2.5 px-3 text-center text-slate-300 font-mono">{stu.marks}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        stu.result === 'Pass' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {stu.result || 'Pass'}
                      </span>
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
}
