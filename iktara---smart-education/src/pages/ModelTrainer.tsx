/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Brain, Cpu, CheckCircle, Info, Settings, Play, ShieldAlert, Award
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ModelTrainer() {
  const [algorithm, setAlgorithm] = useState('rf');
  const [modelHistory, setModelHistory] = useState<any[]>([]);
  const [trainingResult, setTrainingResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [trainingProgress, setTrainingProgress] = useState<number | null>(null);
  const [trainingStepText, setTrainingStepText] = useState<string>('');

  const fetchModelHistory = async () => {
    try {
      const res = await fetch('/api/model-accuracy');
      if (res.ok) {
        const data = await res.json();
        setModelHistory(data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchModelHistory();
  }, []);

  const handleTrainModel = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setTrainingResult(null);
    setTrainingProgress(0);
    setTrainingStepText("Partitioning raw datasets. Creating 75% training and 25% test samples...");

    // Start fetching from server concurrently
    const startFetch = fetch('/api/train-model', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ algorithm })
    });

    // Animate the progress bar smoothly independent of server response speed
    const progressPromise = new Promise<void>((resolve) => {
      let cur = 0;
      const interval = setInterval(() => {
        cur += Math.floor(Math.random() * 8) + 6;
        if (cur >= 95) {
          cur = 95;
          clearInterval(interval);
          resolve();
        }
        setTrainingProgress(cur);
        if (cur < 20) {
          setTrainingStepText("Slicing academic records (75% Train / 25% Test split)...");
        } else if (cur < 45) {
          setTrainingStepText("Imputing study session hours and missing values with cohort mean...");
        } else if (cur < 70) {
          setTrainingStepText("Applying MinMax scaling intervals to continuous features...");
        } else if (cur < 85) {
          setTrainingStepText(`Running fitting iterations on ${algorithm === 'rf' ? 'Random Forest trees' : algorithm === 'dt' ? 'Decision Tree' : algorithm === 'log_reg' ? 'Logistic weights' : algorithm === 'svm' ? 'Support Vectors' : algorithm === 'xgboost' ? 'Boosting parameters' : 'linear regression equations'}...`);
        } else {
          setTrainingStepText("Scoring True Positive vs False Positive metrics...");
        }
      }, 100);
    });

    try {
      // Wait for both the server model calculations and the visual simulation boundaries to complete nicely
      const [res] = await Promise.all([startFetch, progressPromise]);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }

      setTrainingProgress(100);
      setTrainingStepText("Classifier patterns registered and cached successfully!");
      await new Promise(resolve => setTimeout(resolve, 450));

      setSuccess(`Model trained successfully! Primary test accuracy reached: ${Math.round(data.model.accuracy * 100)}%`);
      setTrainingResult(data.model);
      fetchModelHistory();

      // Dispatch global refresh event for headers
      window.dispatchEvent(new Event('refreshHeader'));
    } catch (err: any) {
      setError(err.message);
      setTrainingProgress(null);
    } finally {
      setLoading(false);
      // Wait 1.5 seconds to fade out the progress bar
      setTimeout(() => {
        setTrainingProgress(null);
      }, 1500);
    }
  };

  const handleActivateModel = async (modelId: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/activate-model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess("Active ML predictive model modified successfully!");
      fetchModelHistory();
      window.dispatchEvent(new Event('refreshHeader'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Convert Feature Importance record into Recharts array form
  const getFeatureImportanceData = (weights: Record<string, number> | undefined) => {
    if (!weights) return [];
    return Object.keys(weights)
      .map(key => ({
        name: key.replace('_', ' ').toUpperCase(),
        weight: parseFloat((weights[key] * 100).toFixed(1))
      }))
      .sort((a, b) => b.weight - a.weight);
  };

  const activeModel = modelHistory.find(m => m.isActive) || modelHistory[0];
  const importanceChartData = getFeatureImportanceData(trainingResult?.featureImportance || activeModel?.featureImportance);

  const displayConfusionMatrix = (matrix: number[][] | undefined) => {
    if (!matrix || matrix.length < 2) return null;
    const tn = matrix[0][0];
    const fp = matrix[0][1];
    const fn = matrix[1][0];
    const tp = matrix[1][1];

    return (
      <div className="mt-4">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-3">Confusion Matrix Grid (Test Evaluation)</span>
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono max-w-xs mx-auto">
          {/* TN */}
          <div className="bg-slate-900 border border-slate-700/60 p-4 rounded-xl">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wide">True Negatives</span>
            <span className="text-xl font-bold text-slate-300 block mt-1">{tn}</span>
            <span className="text-[9px] text-slate-400 mt-0.5 block">Predicted Fail, Actual Fail</span>
          </div>
          {/* FP */}
          <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl">
            <span className="text-rose-400 block text-[9px] uppercase font-bold tracking-wide">False Positives</span>
            <span className="text-xl font-bold text-rose-300 block mt-1">{fp}</span>
            <span className="text-[9px] text-rose-400 mt-0.5 block">Predicted Pass, Actual Fail</span>
          </div>
          {/* FN */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl">
            <span className="text-amber-400 block text-[9px] uppercase font-bold tracking-wide">False Negatives</span>
            <span className="text-xl font-bold text-amber-300 block mt-1">{fn}</span>
            <span className="text-[9px] text-amber-400 mt-0.5 block">Predicted Fail, Actual Pass</span>
          </div>
          {/* TP */}
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-xl">
            <span className="text-emerald-300 block text-[9px] uppercase font-bold tracking-wide">True Positives</span>
            <span className="text-xl font-bold text-emerald-400 block mt-1">{tp}</span>
            <span className="text-[9px] text-emerald-400 mt-0.5 block">Predicted Pass, Actual Pass</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-400/10 border border-red-500/25 rounded-2xl text-red-200 text-sm flex items-start gap-2">
          <ShieldAlert className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl text-slate-200 text-sm flex items-start gap-2">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Control console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model selecter */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-base font-bold text-white font-display">Classifier Optimization suite</h3>
            <p className="text-slate-400 text-xs mt-0.5">Choose an algorithm and click train to fit parameters on your database</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <label className="flex items-center gap-3 bg-slate-900/40 border border-slate-700 hover:border-slate-600 p-4 rounded-xl cursor-pointer transition-all">
              <input
                type="radio"
                name="ml-algo"
                value="rf"
                checked={algorithm === 'rf'}
                onChange={() => setAlgorithm('rf')}
                className="accent-indigo-500 h-4 w-4 shrink-0"
              />
              <div>
                <span className="block text-xs font-bold text-slate-200">Random Forest Classifier</span>
                <span className="block text-[10px] text-slate-500 mt-0.5 leading-relaxed">Bagging ensemble of recursive decision trees, high robustness</span>
              </div>
            </label>

            <label className="flex items-center gap-3 bg-slate-900/40 border border-slate-700 hover:border-slate-600 p-4 rounded-xl cursor-pointer transition-all">
              <input
                type="radio"
                name="ml-algo"
                value="dt"
                checked={algorithm === 'dt'}
                onChange={() => setAlgorithm('dt')}
                className="accent-indigo-500 h-4 w-4 shrink-0"
              />
              <div>
                <span className="block text-xs font-bold text-slate-200">Decision Tree Classifier</span>
                <span className="block text-[10px] text-slate-500 mt-0.5 leading-relaxed">Splits recursively based on computed Gini Impurities</span>
              </div>
            </label>

            <label className="flex items-center gap-3 bg-slate-900/40 border border-slate-700 hover:border-slate-600 p-4 rounded-xl cursor-pointer transition-all">
              <input
                type="radio"
                name="ml-algo"
                value="log_reg"
                checked={algorithm === 'log_reg'}
                onChange={() => setAlgorithm('log_reg')}
                className="accent-indigo-500 h-4 w-4 shrink-0"
              />
              <div>
                <span className="block text-xs font-bold text-slate-200">Logistic Regression</span>
                <span className="block text-[10px] text-slate-500 mt-0.5 leading-relaxed">Fitted with gradient descent to output probability scores</span>
              </div>
            </label>

            <label className="flex items-center gap-3 bg-slate-900/40 border border-slate-700 hover:border-slate-600 p-4 rounded-xl cursor-pointer transition-all">
              <input
                type="radio"
                name="ml-algo"
                value="svm"
                checked={algorithm === 'svm'}
                onChange={() => setAlgorithm('svm')}
                className="accent-indigo-500 h-4 w-4 shrink-0"
              />
              <div>
                <span className="block text-xs font-bold text-slate-200">Support Vector Machine</span>
                <span className="block text-[10px] text-slate-500 mt-0.5 leading-relaxed">Fitted on Hinge Loss algorithms using regularized steps</span>
              </div>
            </label>

            <label className="flex items-center gap-3 bg-slate-900/40 border border-slate-700 hover:border-slate-600 p-4 rounded-xl cursor-pointer transition-all">
              <input
                type="radio"
                name="ml-algo"
                value="xgboost"
                checked={algorithm === 'xgboost'}
                onChange={() => setAlgorithm('xgboost')}
                className="accent-indigo-500 h-4 w-4 shrink-0"
              />
              <div>
                <span className="block text-xs font-bold text-slate-200">XGBoost (Boosted Trees)</span>
                <span className="block text-[10px] text-slate-500 mt-0.5 leading-relaxed">Iteratively fits shallow trees to minimize pseudo-residuals</span>
              </div>
            </label>

            <label className="flex items-center gap-3 bg-slate-900/40 border border-slate-700 hover:border-slate-600 p-4 rounded-xl cursor-pointer transition-all">
              <input
                type="radio"
                name="ml-algo"
                value="lr"
                checked={algorithm === 'lr'}
                onChange={() => setAlgorithm('lr')}
                className="accent-indigo-500 h-4 w-4 shrink-0"
              />
              <div>
                <span className="block text-xs font-bold text-slate-200">Linear Regression</span>
                <span className="block text-[10px] text-slate-500 mt-0.5 leading-relaxed">Calculates multi-variate parameter convergence formulas</span>
              </div>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch mt-6">
            <button
              onClick={handleTrainModel}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold uppercase tracking-wider py-3 px-6 rounded-xl shadow-lg shadow-indigo-550/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
              id="train-model-action-btn"
            >
              {loading ? (
                <span className="inline-block border-2 border-white/30 border-t-white rounded-full w-4 h-4 animate-spin"></span>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5" /> Initialize Model Training
                </>
              )}
            </button>
          </div>

          {trainingProgress !== null && (
            <div className="mt-5 p-4 bg-slate-900/50 border border-slate-700/60 rounded-xl space-y-3 animate-fade-in">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">{trainingStepText}</span>
                <span className="font-mono font-bold text-indigo-400 text-sm">{trainingProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/40">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2 rounded-full transition-all duration-150 ease-out" 
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="inline-block border border-indigo-400/40 border-t-indigo-400 rounded-full w-3 h-3 animate-spin shrink-0"></span>
                <span>Optimizing weights & hyperparameters against clean data dimensions...</span>
              </div>
            </div>
          )}
        </div>

        {/* Model evaluation statistics */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white font-display mb-4">Model Performance Summary</h3>
            
            {(trainingResult || activeModel) ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400 font-medium text-xs">Model Architecture</span>
                  <span className="text-slate-200 text-xs font-bold">{trainingResult?.name || activeModel?.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="p-3.5 bg-slate-950/25 rounded-xl border border-slate-700/50 text-center">
                    <span className="text-slate-500 font-bold uppercase block text-[9px] tracking-wide">Accuracy</span>
                    <span className="text-2xl font-bold text-indigo-400 mt-1 block font-mono">
                      {Math.round((trainingResult?.accuracy || activeModel?.accuracy) * 100)}%
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950/25 rounded-xl border border-slate-700/50 text-center">
                    <span className="text-slate-500 font-bold uppercase block text-[9px] tracking-wide">F1-Score</span>
                    <span className="text-2xl font-bold text-emerald-400 mt-1 block font-mono">
                      {Math.round((trainingResult?.f1Score || activeModel?.f1Score) * 100)}%
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950/25 rounded-xl border border-slate-700/50 text-center">
                    <span className="text-slate-500 font-bold uppercase block text-[9px] tracking-wide">Precision</span>
                    <span className="text-slate-300 font-mono font-medium block">
                      {Math.round((trainingResult?.precision || activeModel?.precision) * 100)}%
                    </span>
                  </div>

                  <div className="p-3.5 bg-slate-950/25 rounded-xl border border-slate-700/50 text-center">
                    <span className="text-slate-500 font-bold uppercase block text-[9px] tracking-wide">Recall</span>
                    <span className="text-slate-300 font-mono font-medium block">
                      {Math.round((trainingResult?.recall || activeModel?.recall) * 100)}%
                    </span>
                  </div>
                </div>

                {displayConfusionMatrix(trainingResult?.confusionMatrix || activeModel?.confusionMatrix)}
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs py-12">
                <Brain className="h-10 w-10 mx-auto text-slate-600 mb-3" />
                Select an algorithm and run calculations to see precision, recall metrics.
              </div>
            )}
          </div>
        </div>
      </div>

      {importanceChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feature Importance Recharts */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 lg:col-span-2">
            <h3 className="text-base font-bold text-white font-display mb-1">Feature Importance Weight Distribution</h3>
            <p className="text-slate-400 text-xs mb-5">Which socio-academic indicators carry the most predictive influence</p>

            <div className="h-68">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={importanceChartData} layout="vertical" margin={{ top: 0, right: 10, left: 30, bottom: 0 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" tickLine={false} style={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" tickLine={false} style={{ fontSize: 9 }} />
                  <Tooltip cursor={{ fill: 'rgba(51, 65, 85, 0.15)' }} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="weight" fill="#6366f1" radius={[0, 4, 4, 0]} name="Importance Factor (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Model Registry Log list */}
          <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white font-display mb-4">Classifier Registry Log</h3>
            <div className="space-y-3 max-h-76 overflow-y-auto">
              {modelHistory.map((mod) => (
                <div
                  key={mod.id}
                  className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                    mod.isActive
                      ? 'bg-indigo-500/10 border-indigo-500'
                      : 'bg-slate-900/35 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="block text-xs font-bold text-slate-200 truncate">{mod.name}</span>
                    <span className="block text-[10px] font-mono text-indigo-400 mt-0.5">Acc: {Math.round(mod.accuracy * 100)}%</span>
                  </div>
                  <div>
                    {mod.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    ) : (
                      <button
                        onClick={() => handleActivateModel(mod.id)}
                        className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-550/30 hover:border-indigo-400/40 px-2 py-1 bg-slate-900 rounded-lg cursor-pointer transition-all"
                      >
                        Activate
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
