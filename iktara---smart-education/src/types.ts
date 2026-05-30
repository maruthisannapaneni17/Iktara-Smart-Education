/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'student';
  name: string;
}

export interface StudentDataInput {
  gender: 'Male' | 'Female';
  age: number;
  attendance: number;       // 0-100
  study_hours: number;      // hours per week
  assignment_score: number; // 0-100
  internal_marks: number;   // 0-100
  participation: number;    // 0-100
  internet_usage: 'Yes' | 'No';
  sleep_hours: number;      // 0-24
  family_support: 'High' | 'Medium' | 'Low';
  extracurricular: 'Yes' | 'No';
  previous_marks: number;   // 0-100
  final_result?: 'Pass' | 'Fail';
}

export interface StudentRecord extends StudentDataInput {
  id: string;
}

export interface DatasetStats {
  mean: number;
  min: number;
  max: number;
}

export interface DatasetSummary {
  rowCount: number;
  colCount: number;
  columns: string[];
  missingValues: Record<string, number>;
  dataTypes: Record<string, string>;
  stats: Record<string, DatasetStats>;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][]; // [ [TN, FP], [FN, TP] ]
}

export interface TrainingResult {
  modelId: string;
  modelName: string;
  metrics: ModelMetrics;
  featureImportance: Record<string, number>;
}

export interface PredictionResult {
  category: 'Excellent' | 'Good' | 'Average' | 'Poor';
  probability: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendations: string[];
  studyPlan: string[];
}

export interface ComparativeMetric {
  label: string;
  individual: number;
  classAverage: number;
  departmentAverage: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
