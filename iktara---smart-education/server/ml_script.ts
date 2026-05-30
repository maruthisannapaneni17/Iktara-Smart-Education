/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import { MLPreprocessor } from './ml/preprocessor.ts';
import {
  RandomForestClassifierModel,
  LogisticRegressionModel,
  evaluateClassifier
} from './ml/algorithms.ts';

// Autonomous offline training controller script
function runOfflineMLFit() {
  console.log("=================================================");
  console.log("   OFFLINE MACHINE LEARNING TRAINING BLUEPRINT");
  console.log("=================================================");

  const dbPath = './data/db.json';
  if (!fs.existsSync(dbPath)) {
    console.error("Error: Local database path './data/db.json' not found. Boot app first to seed files.");
    process.exit(1);
  }

  try {
    const rawData = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(rawData);
    const students = db.students || [];

    if (students.length === 0) {
      console.warn("Database seeded, but students collection is empty. Run seeds before compiling scripts.");
      return;
    }

    console.log(`Successfully loaded ${students.length} raw student cohorts logs.`);

    // Fit Preprocessor calculations
    const preprocessor = new MLPreprocessor();
    preprocessor.fit(students);
    const { X, y } = preprocessor.transform(students);

    // Split validation metrics
    const { X_train, y_train, X_test, y_test } = preprocessor.split(X, y, 0.25);
    console.log(`Matrix dimensions configured:`);
    console.log(`- Training inputs X: [${X_train.length} x ${X_train[0]?.length}]`);
    console.log(`- Validation inputs X: [${X_test.length} x ${X_test[0]?.length}]`);

    // Fit Random Forest Ensemble Parameters
    console.log("\nFitting Random Forest Model (Number of Trees: 10, maxDepth: 6)...");
    const classifier = new RandomForestClassifierModel();
    classifier.fit(X_train, y_train);

    // Run evaluations
    const metrics = evaluateClassifier(classifier, X_test, y_test);
    console.log(`Random Forest Evaluation Results:`);
    console.log(`- Accuracy  : ${(metrics.accuracy * 100).toFixed(1)}%`);
    console.log(`- Precision : ${(metrics.precision * 100).toFixed(1)}%`);
    console.log(`- Recall    : ${(metrics.recall * 100).toFixed(1)}%`);
    console.log(`- F1-Score  : ${(metrics.f1Score * 100).toFixed(1)}%`);

    console.log("\nFitting Logistic Regression (Linear gradient bounds)...");
    const logModel = new LogisticRegressionModel();
    logModel.fit(X_train, y_train);
    const logMetrics = evaluateClassifier(logModel, X_test, y_test);
    console.log(`Logistic Regression Evaluation:`);
    console.log(`- Accuracy  : ${(logMetrics.accuracy * 100).toFixed(1)}%`);

    console.log("\n=================================================");
    console.log("   TRAINING WORKFLOW COMPILED SUCCESSFULLY");
    console.log("=================================================");
  } catch (err: any) {
    console.error("ML model fit execution error:", err.message);
  }
}

runOfflineMLFit();
