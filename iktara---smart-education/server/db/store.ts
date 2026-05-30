/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Interface definition for DB JSON
export interface DatabaseSchema {
  users: Array<{
    id: string;
    email: string;
    passwordHash: string;
    role: 'admin' | 'student';
    name: string;
  }>;
  students: Array<{
    id: string;
    name: string;
    gender: 'Male' | 'Female';
    age: number;
    attendance: number;
    study_hours: number;
    assignment_score: number;
    internal_marks: number;
    participation: number;
    internet_usage: 'Yes' | 'No';
    sleep_hours: number;
    family_support: 'High' | 'Medium' | 'Low';
    extracurricular: 'Yes' | 'No';
    previous_marks: number;
    final_result: 'Pass' | 'Fail';
    department: string;
    cls: string;
    semester: number;
  }>;
  trainedModels: Array<{
    id: string;
    name: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: number[][];
    featureImportance: Record<string, number>;
    trainedAt: string;
    isActive: boolean;
  }>;
  savedPredictions: Array<{
    id: string;
    studentName: string;
    category: string;
    probability: number;
    riskLevel: string;
    predictedBy: string;
    predictedAt: string;
    inputs: any;
  }>;
}

export class DBStore {
  private data: DatabaseSchema = {
    users: [],
    students: [],
    trainedModels: [],
    savedPredictions: []
  };

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
      } catch (err) {
        console.error("Error reading db file, regenerating:", err);
        this.generateDefaultData();
      }
    } else {
      this.generateDefaultData();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error("Failed to write DB file:", err);
    }
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  public generateDefaultData() {
    console.log("Generating default database seeding setup...");
    
    // Auth profiles
    this.data.users = [
      {
        id: "admin-1",
        email: "admin@predictor.com",
        passwordHash: this.hashPassword("admin"),
        role: "admin",
        name: "Director Academics"
      },
      {
        id: "student-1",
        email: "student@predictor.com",
        passwordHash: this.hashPassword("student"),
        role: "student",
        name: "Alex Mercer"
      }
    ];

    // Seed 120 realistic stud records
    const firstNames = ["James", "Emma", "Liam", "Olivia", "Noah", "Sophia", "Jackson", "Isabella", "Lucas", "Mia", "Oliver", "Amelia", "Harper", "Evelyn", "Aria", "Aidan", "Mia", "Zoe", "Caleb", "Maya"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Miller", "Davis", "Garcia", "Rodriguez", "Wilson", "Martinez", "Anderson", "Taylor", "Thomas", "Hernandez", "Moore", "Martin", "Jackson"];
    const departments = ["Computer Science", "Information Technology", "Electronics Eng", "Data Science"];
    const classes = ["A", "B", "C"];
    
    this.data.students = [];

    for (let i = 0; i < 120; i++) {
      const fName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const name = `${fName} ${lName}`;
      
      const gender: 'Male' | 'Female' = Math.random() > 0.45 ? 'Male' : 'Female';
      const age = Math.floor(Math.random() * 5) + 18; // 18-22
      
      // Correlate metrics realistically
      // Good attendance/study usually triggers high internal/previous
      const baseChance = Math.random(); // 0 to 1
      let attendance = Math.floor(Math.random() * 20) + 79; // 79 - 98 standard
      let study_hours = Math.floor(Math.random() * 15) + 8; // 8 - 22 standard
      let internet_usage: 'Yes' | 'No' = Math.random() > 0.15 ? 'Yes' : 'No';

      if (baseChance < 0.15) {
        // Struggling profile
        attendance = Math.floor(Math.random() * 20) + 55; // 55 - 75
        study_hours = Math.floor(Math.random() * 6) + 2;   // 2 - 8
        internet_usage = Math.random() > 0.5 ? 'Yes' : 'No';
      } else if (baseChance > 0.85) {
        // High achiever profile
        attendance = Math.floor(Math.random() * 8) + 92;  // 92 - 100
        study_hours = Math.floor(Math.random() * 12) + 18; // 18 - 30
      }

      const sleep_hours = Math.floor(Math.random() * 4) + 5; // 5-8
      const participation = Math.max(20, Math.min(100, Math.floor(attendance * 0.95 + (Math.random() * 15 - 10))));
      const assignment_score = Math.max(30, Math.min(100, Math.floor(study_hours * 2.5 + 40 + (Math.random() * 16 - 8))));
      
      const previous_marks = Math.max(40, Math.min(100, Math.floor(study_hours * 2.1 + 45 + (Math.random() * 16 - 8))));
      const internal_marks = Math.max(30, Math.min(100, Math.floor((previous_marks * 0.5) + (assignment_score * 0.4) + (Math.random() * 12 - 4))));

      const family_supports: Array<'High' | 'Medium' | 'Low'> = ['High', 'Medium', 'Low'];
      const family_support = family_supports[Math.floor(Math.random() * (baseChance > 0.5 ? 2 : 3))];
      const extracurricular: 'Yes' | 'No' = Math.random() > 0.6 ? 'Yes' : 'No';

      // Pass/Fail prediction targets (Pass: internal >= 60 and attendance >= 75 and previous_marks >= 55)
      let final_result: 'Pass' | 'Fail' = 'Pass';
      if (internal_marks < 55 || attendance < 72 || (previous_marks < 55 && study_hours < 6)) {
        final_result = 'Fail';
      }

      this.data.students.push({
        id: `STU-${1000 + i}`,
        name,
        gender,
        age,
        attendance,
        study_hours,
        assignment_score,
        internal_marks,
        participation,
        internet_usage,
        sleep_hours,
        family_support,
        extracurricular,
        previous_marks,
        final_result,
        department: departments[Math.floor(Math.random() * departments.length)],
        cls: classes[Math.floor(Math.random() * classes.length)],
        semester: Math.floor(Math.random() * 6) + 1
      });
    }

    // Seed default models
    this.data.trainedModels = [
      {
        id: "model-rf-1",
        name: "Random Forest Classifier",
        accuracy: 0.91,
        precision: 0.89,
        recall: 0.93,
        f1Score: 0.91,
        confusionMatrix: [[18, 2], [1, 19]],
        featureImportance: {
          "attendance": 0.32,
          "internal_marks": 0.23,
          "study_hours": 0.16,
          "assignment_score": 0.11,
          "previous_marks": 0.08,
          "participation": 0.04,
          "age": 0.02,
          "sleep_hours": 0.01,
          "gender": 0.01,
          "internet_usage": 0.01,
          "family_support": 0.005,
          "extracurricular": 0.005
        },
        trainedAt: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        isActive: true
      },
      {
        id: "model-lr-1",
        name: "Logistic Regression",
        accuracy: 0.86,
        precision: 0.84,
        recall: 0.88,
        f1Score: 0.86,
        confusionMatrix: [[16, 4], [2, 18]],
        featureImportance: {
          "attendance": 0.28,
          "internal_marks": 0.22,
          "study_hours": 0.18,
          "assignment_score": 0.12,
          "previous_marks": 0.10,
          "participation": 0.05,
          "age": 0.01,
          "sleep_hours": 0.01,
          "gender": 0.01,
          "internet_usage": 0.01,
          "family_support": 0.005,
          "extracurricular": 0.005
        },
        trainedAt: new Date().toISOString(),
        isActive: false
      }
    ];

    // Seed default prediction history
    this.data.savedPredictions = [
      {
        id: "pred-1",
        studentName: "Amelia Thomas",
        category: "Good",
        probability: 0.84,
        riskLevel: "Low",
        predictedBy: "admin@predictor.com",
        predictedAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        inputs: {
          gender: "Female", age: 19, attendance: 88, study_hours: 14,
          assignment_score: 85, internal_marks: 82, participation: 80,
          internet_usage: "Yes", sleep_hours: 7, family_support: "High",
          extracurricular: "Yes", previous_marks: 80
        }
      },
      {
        id: "pred-2",
        studentName: "Caden Brown",
        category: "Poor",
        probability: 0.22,
        riskLevel: "Critical",
        predictedBy: "admin@predictor.com",
        predictedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        inputs: {
          gender: "Male", age: 20, attendance: 62, study_hours: 3,
          assignment_score: 50, internal_marks: 48, participation: 45,
          internet_usage: "Yes", sleep_hours: 5, family_support: "Low",
          extracurricular: "No", previous_marks: 52
        }
      }
    ];

    this.save();
  }

  // API operations
  getUsers() {
    return this.data.users;
  }

  addUser(user: DatabaseSchema['users'][number]) {
    this.data.users.push(user);
    this.save();
  }

  getStudents() {
    return this.data.students;
  }

  overwriteStudents(newStudents: DatabaseSchema['students']) {
    this.data.students = newStudents;
    this.save();
  }

  clearStudents() {
    this.data.students = [];
    this.save();
  }

  addStudent(student: DatabaseSchema['students'][number]) {
    this.data.students.push(student);
    this.save();
  }

  getTrainedModels() {
    return this.data.trainedModels;
  }

  addTrainedModel(model: DatabaseSchema['trainedModels'][number]) {
    // Disable previous models if setting active
    if (model.isActive) {
      this.data.trainedModels.forEach(m => m.isActive = false);
    }
    this.data.trainedModels.push(model);
    this.save();
  }

  setActiveModel(modelId: string) {
    this.data.trainedModels.forEach(m => {
      m.isActive = m.id === modelId;
    });
    this.save();
  }

  getSavedPredictions() {
    return this.data.savedPredictions;
  }

  addSavedPrediction(pred: DatabaseSchema['savedPredictions'][number]) {
    this.data.savedPredictions.unshift(pred);
    this.save();
  }
}

export const dbInstance = new DBStore();
export default dbInstance;
