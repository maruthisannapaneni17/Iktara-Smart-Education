/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Binary, FileText, Printer, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, BookOpen, Clock, Activity, Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion } from 'motion/react';

export default function PredictorForm() {
  // Form input states
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Female');
  const [age, setAge] = useState(19);
  const [attendance, setAttendance] = useState(85);
  const [studyHours, setStudyHours] = useState(14);
  const [assignmentScore, setAssignmentScore] = useState(80);
  const [internalMarks, setInternalMarks] = useState(75);
  const [participation, setParticipation] = useState(75);
  const [internetUsage, setInternetUsage] = useState<'Yes' | 'No'>('Yes');
  const [sleepHours, setSleepHours] = useState(7);
  const [familySupport, setFamilySupport] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [extracurricular, setExtracurricular] = useState<'Yes' | 'No'>('Yes');
  const [previousMarks, setPreviousMarks] = useState(75);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setPredictionResult(null);
    setLoading(true);

    const payload = {
      name: name || "Anonymous Student",
      gender,
      age: Number(age),
      attendance: Number(attendance),
      study_hours: Number(studyHours),
      assignment_score: Number(assignmentScore),
      internal_marks: Number(internalMarks),
      participation: Number(participation),
      internet_usage: internetUsage,
      sleep_hours: Number(sleepHours),
      family_support: familySupport,
      extracurricular: extracurricular,
      previous_marks: Number(previousMarks)
    };

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPredictionResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!predictionResult) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const { prediction, studyPlan, recommendations } = predictionResult;

    // Set document metadata
    doc.setDocumentProperties({
      title: `Academic_Report_${prediction.studentName.replace(/\s+/g, '_')}`,
      subject: 'Academic Prediction and Intervention Diagnosis',
      author: 'AI Academic Diagnosis System'
    });

    // Colors
    const primaryColor = [30, 41, 59]; // Slate 800
    const accentColorDark = [79, 70, 229]; // Indigo 600
    const textColor = [51, 65, 85]; // Slate 700
    const darkTextColor = [15, 23, 42]; // Slate 900
    const lightBg = [248, 250, 252]; // Slate 50
    const borderCol = [226, 232, 240]; // Slate 200

    let categoryColor = [16, 185, 129]; // Emerald (Excellent)
    if (prediction.category === 'Good') categoryColor = [79, 70, 229]; // Indigo
    if (prediction.category === 'Average') categoryColor = [245, 158, 11]; // Amber
    if (prediction.category === 'Poor') categoryColor = [239, 68, 68]; // Red

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 15;

    // 1. Draw a Header Banner Accent
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 42, 'F');

    // Accent line
    doc.setFillColor(accentColorDark[0], accentColorDark[1], accentColorDark[2]);
    doc.rect(0, 42, pageWidth, 2.5, 'F');

    // Title & Info
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('ACADEMIC DIAGNOSIS REPORT', margin, 24);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.text(`Reference ID: ${prediction.id}   |   Issued: ${new Date().toLocaleDateString()}`, margin, 32);

    y = 57;

    // 2. Candidate Info Section
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('1. Student Information & Context', margin, y);
    y += 4;

    doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;

    // Two-column layout for student info
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139); // Slate 500
    doc.text('Candidate Name:', margin + 4, y);
    doc.text('Performance Category:', margin + 100, y);
    y += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(prediction.studentName || 'Anonymous Student', margin + 4, y);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(categoryColor[0], categoryColor[1], categoryColor[2]);
    doc.text(`${prediction.category} Category`, margin + 100, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('Passing Probability:', margin + 4, y);
    doc.text('Academic Risk Profile:', margin + 100, y);
    y += 5.5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.text(`${Math.round(prediction.probability * 100)}% Pass Probability`, margin + 4, y);
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(categoryColor[0], categoryColor[1], categoryColor[2]);
    doc.text(`${prediction.riskLevel} Risk Level`, margin + 100, y);
    y += 11;

    // 3. Routine Parameters Values Table
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('2. Academic Routines & Input Parameters', margin, y);
    y += 4;

    doc.line(margin, y, pageWidth - margin, y);
    y += 5;

    // Draw parameters grid
    const paramRows = [
      { key: 'Attendance Rate', val: `${prediction.inputs.attendance}%` },
      { key: 'Study Hours / Week', val: `${prediction.inputs.study_hours} hrs` },
      { key: 'Internal Assessment Marks', val: `${prediction.inputs.internal_marks}%` },
      { key: 'School Participation Engagement', val: `${prediction.inputs.participation}%` },
      { key: 'Previous Semester Score', val: `${prediction.inputs.previous_marks}%` },
      { key: 'Assignment Completion Rating', val: `${prediction.inputs.assignment_score}%` },
      { key: 'Sleep Hours Per Night', val: `${prediction.inputs.sleep_hours} hrs` },
      { key: 'Family Study Support Indicator', val: prediction.inputs.family_support },
      { key: 'High-Speed Internet Access', val: prediction.inputs.internet_usage }
    ];

    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    // Zebra table
    paramRows.forEach((row, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
        doc.rect(margin, y, pageWidth - 2 * margin, 6.5, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(row.key, margin + 4, y + 4.5);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      doc.text(row.val, margin + 110, y + 4.5);
      y += 6.5;
    });

    y += 8;

    // 4. Recommendations & Interventions (Checks for overflow)
    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('3. Structured Study Blueprint & Actions', margin, y);
    y += 4;

    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    studyPlan.forEach((item: string) => {
      const textLine = `•  ${item}`;
      const splitText = doc.splitTextToSize(textLine, pageWidth - 2 * margin);
      splitText.forEach((pText: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'normal');
        doc.text(pText, margin + 3, y);
        y += 5.5;
      });
    });

    y += 3;

    // 5. High Priority Actions
    if (y > 230) { // Keep actions with their title on a fresh page if low space
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('4. Core Pedagogical Recommendations', margin, y);
    y += 4;

    doc.line(margin, y, pageWidth - margin, y);
    y += 6;

    recommendations.forEach((rec: string) => {
      const textLine = `[✓]  ${rec}`;
      const splitText = doc.splitTextToSize(textLine, pageWidth - 2 * margin);
      splitText.forEach((pText: string) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'normal');
        doc.text(pText, margin + 3, y);
        y += 5.2;
      });
    });

    // 6. Footer stamp
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    y += 12;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text('This diagnosis certificate is generated automatically using active random-forest pattern predictors.', margin, y);
    doc.text('Consultation strictly restricted to educational advisory and authorized university administrative staff.', margin, y + 3.8);

    doc.save(`Academic_Diagnosis_Report_${prediction.studentName.replace(/\s+/g, '_')}.pdf`);
  };

  // Utility to map color of categories
  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'Excellent': return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30';
      case 'Good': return 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30';
      case 'Average': return 'bg-amber-500/15 text-amber-300 border border-amber-500/30';
      case 'Poor': return 'bg-red-500/15 text-red-300 border border-red-500/30';
      default: return 'bg-slate-500/15 text-slate-300';
    }
  };

  const getRiskBadgeClass = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      case 'High': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'Critical': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-400';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in print:p-0">
      {/* 1. Header of Prediction Page (hide during print) */}
      <div className="print:hidden">
        {error && (
          <div className="p-4 bg-red-400/10 border border-red-500/25 rounded-2xl text-red-100 text-sm flex items-start gap-2 mb-6">
            <ShieldAlert className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Form panel (hide during print if predicting, or let user review) */}
        <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 xl:col-span-2 print:hidden">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white font-display">Student Diagnostic Predictor Form</h3>
            <p className="text-slate-400 text-xs mt-0.5">Enter direct attendance, home studies, and grades metrics to generate analysis</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sec 1: Demographics */}
            <div className="space-y-4">
              <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider block border-b border-slate-750 pb-1">1. Demographics & Context</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Candidate Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Grayson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-name"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-gender"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Age</label>
                  <input
                    type="number"
                    required
                    min={15}
                    max={60}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-age"
                  />
                </div>
              </div>
            </div>

            {/* Sec 2: Physical/Attendance */}
            <div className="space-y-4">
              <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider block border-b border-slate-750 pb-1">2. Direct School & Home routines</span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Attendance (%)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={attendance}
                    onChange={(e) => setAttendance(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-attendance"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Study Hrs / Wk</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={80}
                    value={studyHours}
                    onChange={(e) => setStudyHours(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-study-hours"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Sleep Hours / Nt</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={24}
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-sleep"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Internet usage</label>
                  <select
                    value={internetUsage}
                    onChange={(e) => setInternetUsage(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-internet"
                  >
                    <option value="Yes">Yes (WiFi High speed)</option>
                    <option value="No">No boundaries</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sec 3: Family context */}
            <div className="space-y-4">
              <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider block border-b border-slate-750 pb-1">3. Co-Curricular & Support Context</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Family Support indicators</label>
                  <select
                    value={familySupport}
                    onChange={(e) => setFamilySupport(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-support"
                  >
                    <option value="High">High Involvement Support</option>
                    <option value="Medium">Medium Supportive</option>
                    <option value="Low">Low / Independent studies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Extracurricular Engagement</label>
                  <select
                    value={extracurricular}
                    onChange={(e) => setExtracurricular(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-extra"
                  >
                    <option value="Yes">Participating regularly</option>
                    <option value="No">No Extracurriculars</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sec 4: Core Grades */}
            <div className="space-y-4">
              <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider block border-b border-slate-750 pb-1">4. Exam Assessments Details (0-100)</span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Previous semester Marks</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={previousMarks}
                    onChange={(e) => setPreviousMarks(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-prev-marks"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Assignment Completion</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={assignmentScore}
                    onChange={(e) => setAssignmentScore(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-assignment"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Internal Exam Marks</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={internalMarks}
                    onChange={(e) => setInternalMarks(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-internal-marks"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1.5 uppercase tracking-wide">Participation rate</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={participation}
                    onChange={(e) => setParticipation(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-550/30 transition-all text-xs"
                    id="predict-participation"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white text-xs font-semibold uppercase tracking-wider py-3 rounded-xl shadow-lg shadow-indigo-550/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="predict-submit-btn"
            >
              {loading ? (
                <span className="inline-block border-2 border-white/30 border-t-white rounded-full w-4 h-4 animate-spin"></span>
              ) : (
                <>
                  <Binary className="h-4 w-4" /> Compute diagnostic predictions
                </>
              )}
            </button>
          </form>
        </div>

        {/* Prediction report results display */}
        <div className="xl:col-span-1">
          {predictionResult ? (
            <motion.div
              key={predictionResult.prediction.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-slate-800 border border-slate-700/60 rounded-2xl p-6 space-y-6 print:bg-white print:border-none print:text-slate-950 print:p-0"
              id="printable-report"
            >
              {/* Report Header */}
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-4 print:border-slate-300">
                <div>
                  <h3 className="text-base font-bold text-white font-display print:text-slate-900">Academic Diagnosis Report</h3>
                  <span className="text-[10px] text-indigo-400 font-mono font-medium print:text-indigo-600">ID: {predictionResult.prediction.id}</span>
                </div>
                <div className="flex items-center gap-2 print:hidden">
                  <button
                    onClick={handleDownloadPDF}
                    className="p-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 hover:border-indigo-500/45 text-indigo-300 rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0"
                    title="Download PDF Report"
                    id="download-report-btn"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="p-2 border border-slate-700 hover:border-slate-500 hover:bg-slate-700/30 text-slate-400 hover:text-white rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0"
                    title="Print PDF Certificate"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Basic Candidate details */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="grid grid-cols-2 gap-4 text-xs font-mono bg-slate-900/30 p-3.5 rounded-xl border border-slate-750/50 print:bg-slate-100 print:text-slate-900 print:border-slate-300"
              >
                <div>
                  <span className="text-slate-500 text-[10px] font-bold block uppercase">Candidate</span>
                  <span className="text-slate-200 block font-semibold print:text-slate-950">{predictionResult.prediction.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold block uppercase">Assesment avg</span>
                  <span className="text-slate-200 block font-semibold print:text-slate-950">{predictionResult.prediction.inputs.internal_marks}%</span>
                </div>
              </motion.div>

              {/* Indicator Risk dial */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-center bg-slate-900/40 border border-slate-700/40 p-5 rounded-xl print:bg-transparent print:border-none"
              >
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Predicted performance category</span>
                
                <div className="mt-4 flex flex-col items-center">
                  <span className={`px-4 py-1.5 rounded-full font-bold text-sm tracking-tight font-display mb-2 inline-block ${
                    getCategoryBadgeClass(predictionResult.prediction.category)
                  }`}>
                    {predictionResult.prediction.category} Tier
                  </span>

                  <span className="text-4xl font-mono font-bold text-white block print:text-slate-900">
                    {Math.round(predictionResult.prediction.probability * 100)}%
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold font-mono mt-0.5">Passing Probability Score</span>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-750/60 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Risk Assessment</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-tight mt-1.5 inline-block ${
                      getRiskBadgeClass(predictionResult.prediction.riskLevel)
                    }`}>
                      {predictionResult.prediction.riskLevel} Risk
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] uppercase font-bold block">Engagement</span>
                    <span className="text-xs text-slate-300 font-bold block mt-1.5 print:text-slate-900">{predictionResult.prediction.inputs.participation}% Rating</span>
                  </div>
                </div>
              </motion.div>

              {/* Recommendations list */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="space-y-3.5 leading-relaxed"
              >
                <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block border-b border-sidebar-border/30 pb-1.5 flex items-center gap-1.5 print:text-slate-900 print:border-slate-300">
                  <Clock className="h-4 w-4 text-indigo-400 shrink-0" />
                  Structured Study Blueprint Plan
                </span>
                <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4.5 print:text-slate-700 print:pl-4">
                  {predictionResult.studyPlan.map((plan: string, idx: number) => (
                    <li key={idx}>
                      <span className="text-slate-300 font-medium print:text-slate-850">{plan}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Action priority items */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="space-y-3.5 leading-relaxed pt-2"
              >
                <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block border-b border-sidebar-border/30 pb-1.5 flex items-center gap-1.5 print:text-slate-900 print:border-slate-300">
                  <BookOpen className="h-4 w-4 text-emerald-400 shrink-0" />
                  Priority Improvement Actions
                </span>
                <ul className="text-xs text-slate-400 space-y-2.5 print:text-slate-700">
                  {predictionResult.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ) : (
            <div className="bg-slate-800 border border-slate-700/60 rounded-2xl p-8 text-center text-slate-500 text-xs space-y-3 xl:sticky xl:top-24">
              <Binary className="h-10 w-10 mx-auto text-slate-600 mb-2 animate-bounce" />
              <h4 className="font-bold text-slate-300 font-display text-sm">Waiting for Parameters inputs</h4>
              <p className="leading-relaxed px-4">Fill out the student demographic, attendance logs, and internal assessment grades on the left, then click submit to run predictive classification.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
