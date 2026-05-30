/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Basic helper functions for vector math
function dotProduct(v1: number[], v2: number[]): number {
  return v1.reduce((sum, val, idx) => sum + val * v2[idx], 0);
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-Math.max(-20, Math.min(20, x))));
}

// Interfaces for our model structures
export interface MachineLearningModel {
  fit(X: number[][], y: number[]): void;
  predict(X: number[][]): number[];
  predictProba?(X: number[][]): number[];
  getFeatureImportance?(featureNames: string[]): Record<string, number>;
}

// -------------------------------------------------------------
// 1. Linear Regression (using Gradient Descent)
// -------------------------------------------------------------
export class LinearRegressionModel implements MachineLearningModel {
  weights: number[] = [];
  bias: number = 0;
  learningRate: number = 0.05;
  epochs: number = 100;

  fit(X: number[][], y: number[]): void {
    if (X.length === 0) return;
    const numFeatures = X[0].length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      for (let i = 0; i < X.length; i++) {
        const xi = X[i];
        const error = dotProduct(xi, this.weights) + this.bias - y[i];

        // Update weights and bias
        for (let j = 0; j < numFeatures; j++) {
          this.weights[j] -= this.learningRate * error * xi[j] / X.length;
        }
        this.bias -= this.learningRate * error / X.length;
      }
    }
  }

  predict(X: number[][]): number[] {
    return X.map(xi => dotProduct(xi, this.weights) + this.bias);
  }

  // Treat regression prediction above 0.5 as passing
  predictProba(X: number[][]): number[] {
    const rawPredictions = this.predict(X);
    return rawPredictions.map(pred => Math.max(0, Math.min(1, pred)));
  }

  getFeatureImportance(featureNames: string[]): Record<string, number> {
    const totalWeight = this.weights.reduce((sum, w) => sum + Math.abs(w), 0) || 1;
    const importance: Record<string, number> = {};
    featureNames.forEach((name, idx) => {
      importance[name] = Math.abs(this.weights[idx]) / totalWeight;
    });
    return importance;
  }
}

// -------------------------------------------------------------
// 2. Logistic Regression (using SGD and Sigmoid)
// -------------------------------------------------------------
export class LogisticRegressionModel implements MachineLearningModel {
  weights: number[] = [];
  bias: number = 0;
  learningRate: number = 0.1;
  epochs: number = 150;

  fit(X: number[][], y: number[]): void {
    if (X.length === 0) return;
    const numFeatures = X[0].length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      for (let i = 0; i < X.length; i++) {
        const xi = X[i];
        const raw = dotProduct(xi, this.weights) + this.bias;
        const prob = sigmoid(raw);
        const error = prob - y[i];

        // Gradient update step
        for (let j = 0; j < numFeatures; j++) {
          this.weights[j] -= this.learningRate * error * xi[j];
        }
        this.bias -= this.learningRate * error;
      }
    }
  }

  predictProba(X: number[][]): number[] {
    return X.map(xi => sigmoid(dotProduct(xi, this.weights) + this.bias));
  }

  predict(X: number[][]): number[] {
    return this.predictProba(X).map(p => (p >= 0.5 ? 1 : 0));
  }

  getFeatureImportance(featureNames: string[]): Record<string, number> {
    const totalWeight = this.weights.reduce((sum, w) => sum + Math.abs(w), 0) || 1;
    const importance: Record<string, number> = {};
    featureNames.forEach((name, idx) => {
      importance[name] = Math.abs(this.weights[idx]) / totalWeight;
    });
    return importance;
  }
}

// -------------------------------------------------------------
// 3. Decision Tree Classifier (Gini Impurity Splits)
// -------------------------------------------------------------
class DecisionNode {
  featureIdx: number = -1;
  threshold: number = 0;
  left: DecisionNode | null = null;
  right: DecisionNode | null = null;
  value: number = -1; // leaf category
  isLeaf: boolean = false;
  giniGain: number = 0;
}

export class DecisionTreeClassifierModel implements MachineLearningModel {
  root: DecisionNode | null = null;
  maxDepth: number = 5;
  minSamplesSplit: number = 2;
  featureImportances: Record<number, number> = {};

  fit(X: number[][], y: number[]): void {
    const numFeatures = X[0]?.length || 0;
    this.featureImportances = {};
    for (let j = 0; j < numFeatures; j++) {
      this.featureImportances[j] = 0;
    }
    this.root = this.buildTree(X, y, 0);
  }

  private calculateGini(y: number[]): number {
    if (y.length === 0) return 0;
    const counts: Record<number, number> = {};
    y.forEach(val => {
      counts[val] = (counts[val] || 0) + 1;
    });
    let sumSquares = 0;
    for (const key in counts) {
      const p = counts[key] / y.length;
      sumSquares += p * p;
    }
    return 1 - sumSquares;
  }

  private buildTree(X: number[][], y: number[], depth: number): DecisionNode {
    const node = new DecisionNode();
    const numSamples = X.length;
    const numFeatures = X[0]?.length || 0;

    // Check stop criteria
    const uniqueY = Array.from(new Set(y));
    const isPure = uniqueY.length <= 1;
    const tooShallow = depth >= this.maxDepth;
    const tooFewSamples = numSamples < this.minSamplesSplit;

    if (isPure || tooShallow || tooFewSamples) {
      node.isLeaf = true;
      // Assign the mode class
      const counts: Record<number, number> = {};
      y.forEach(val => { counts[val] = (counts[val] || 0) + 1; });
      let maxCount = -1;
      let leafVal = 0;
      for (const k in counts) {
        if (counts[k] > maxCount) {
          maxCount = counts[k];
          leafVal = parseFloat(k);
        }
      }
      node.value = leafVal;
      return node;
    }

    // Find best split
    let bestGiniGain = -1;
    let bestFeature = -1;
    let bestThreshold = 0;
    let bestLeftIndices: number[] = [];
    let bestRightIndices: number[] = [];

    const parentGini = this.calculateGini(y);

    // Try a subset of features or all
    for (let f = 0; f < numFeatures; f++) {
      const colValues = X.map(row => row[f]);
      const thresholds = Array.from(new Set(colValues)).sort((a,b) => a-b);

      thresholds.forEach(thresh => {
        const left: number[] = [];
        const right: number[] = [];
        for (let idx = 0; idx < numSamples; idx++) {
          if (X[idx][f] <= thresh) {
            left.push(idx);
          } else {
            right.push(idx);
          }
        }

        if (left.length === 0 || right.length === 0) return;

        const leftY = left.map(i => y[i]);
        const rightY = right.map(i => y[i]);
        const leftGini = this.calculateGini(leftY);
        const rightGini = this.calculateGini(rightY);

        const splitGini = (left.length / numSamples) * leftGini + (right.length / numSamples) * rightGini;
        const gain = parentGini - splitGini;

        if (gain > bestGiniGain) {
          bestGiniGain = gain;
          bestFeature = f;
          bestThreshold = thresh;
          bestLeftIndices = left;
          bestRightIndices = right;
        }
      });
    }

    if (bestGiniGain <= 0 || bestFeature === -1) {
      node.isLeaf = true;
      const counts: Record<number, number> = {};
      y.forEach(val => { counts[val] = (counts[val] || 0) + 1; });
      let maxCount = -1;
      let leafVal = 0;
      for (const k in counts) {
        if (counts[k] > maxCount) {
          maxCount = counts[k];
          leafVal = parseFloat(k);
        }
      }
      node.value = leafVal;
      return node;
    }

    // Accumulate feature importance
    this.featureImportances[bestFeature] = (this.featureImportances[bestFeature] || 0) + bestGiniGain * numSamples;

    node.featureIdx = bestFeature;
    node.threshold = bestThreshold;

    const leftX = bestLeftIndices.map(i => X[i]);
    const leftY = bestLeftIndices.map(i => y[i]);
    const rightX = bestRightIndices.map(i => X[i]);
    const rightY = bestRightIndices.map(i => y[i]);

    node.left = this.buildTree(leftX, leftY, depth + 1);
    node.right = this.buildTree(rightX, rightY, depth + 1);

    return node;
  }

  predictSingle(x: number[]): number {
    let curr = this.root;
    while (curr && !curr.isLeaf) {
      if (x[curr.featureIdx] <= curr.threshold) {
        curr = curr.left;
      } else {
        curr = curr.right;
      }
    }
    return curr ? curr.value : 0;
  }

  predict(X: number[][]): number[] {
    return X.map(x => this.predictSingle(x));
  }

  predictProba(X: number[][]): number[] {
    return X.map(x => {
      let curr = this.root;
      while (curr && !curr.isLeaf) {
        if (x[curr.featureIdx] <= curr.threshold) {
          curr = curr.left;
        } else {
          curr = curr.right;
        }
      }
      return curr ? curr.value : 0.5; // Probabilities simplified as hard values
    });
  }

  getFeatureImportance(featureNames: string[]): Record<string, number> {
    const totalImportance = Object.values(this.featureImportances).reduce((sum, v) => sum + v, 0) || 1;
    const importance: Record<string, number> = {};
    featureNames.forEach((name, idx) => {
      importance[name] = (this.featureImportances[idx] || 0) / totalImportance;
    });
    return importance;
  }
}

// -------------------------------------------------------------
// 4. Random Forest Classifier (Bagging Ensemble of Decision Trees)
// -------------------------------------------------------------
export class RandomForestClassifierModel implements MachineLearningModel {
  trees: DecisionTreeClassifierModel[] = [];
  numTrees: number = 10;
  maxDepth: number = 6;
  minSamplesSplit: number = 2;

  fit(X: number[][], y: number[]): void {
    this.trees = [];
    const size = X.length;
    if (size === 0) return;

    for (let i = 0; i < this.numTrees; i++) {
      // Bootstrap sampling with replacement
      const bootX: number[][] = [];
      const bootY: number[] = [];
      for (let j = 0; j < size; j++) {
        const randIdx = Math.floor(Math.random() * size);
        bootX.push(X[randIdx]);
        bootY.push(y[randIdx]);
      }

      const tree = new DecisionTreeClassifierModel();
      tree.maxDepth = this.maxDepth;
      tree.minSamplesSplit = this.minSamplesSplit;
      tree.fit(bootX, bootY);
      this.trees.push(tree);
    }
  }

  predictProba(X: number[][]): number[] {
    return X.map(x => {
      let sum = 0;
      this.trees.forEach(tree => {
        sum += tree.predictSingle(x);
      });
      return sum / this.trees.length;
    });
  }

  predict(X: number[][]): number[] {
    return this.predictProba(X).map(p => (p >= 0.5 ? 1 : 0));
  }

  getFeatureImportance(featureNames: string[]): Record<string, number> {
    const accumulated: Record<string, number> = {};
    featureNames.forEach(name => { accumulated[name] = 0; });

    this.trees.forEach(tree => {
      const singleImp = tree.getFeatureImportance(featureNames);
      for (const key in singleImp) {
        accumulated[key] += singleImp[key];
      }
    });

    const total = Object.values(accumulated).reduce((sum, val) => sum + val, 0) || 1;
    const sortedImp: Record<string, number> = {};
    featureNames.forEach(name => {
      sortedImp[name] = accumulated[name] / total;
    });
    return sortedImp;
  }
}

// -------------------------------------------------------------
// 5. Support Vector Machine (using SGD Hinge Loss)
// -------------------------------------------------------------
export class SVMModel implements MachineLearningModel {
  weights: number[] = [];
  bias: number = 0;
  learningRate: number = 0.01;
  lambdaParam: number = 0.01; // Regularization setting
  epochs: number = 120;

  fit(X: number[][], y: number[]): void {
    if (X.length === 0) return;
    const numFeatures = X[0].length;
    this.weights = new Array(numFeatures).fill(0);
    this.bias = 0;

    // Convert target 0 -> -1 for original SVM hinge formulation
    const svmY = y.map(yi => (yi === 0 ? -1 : 1));

    for (let epoch = 0; epoch < this.epochs; epoch++) {
      for (let i = 0; i < X.length; i++) {
        const xi = X[i];
        const val = svmY[i] * (dotProduct(xi, this.weights) + this.bias);

        if (val >= 1) {
          for (let j = 0; j < numFeatures; j++) {
            this.weights[j] -= this.learningRate * (2 * this.lambdaParam * this.weights[j]);
          }
        } else {
          for (let j = 0; j < numFeatures; j++) {
            this.weights[j] -= this.learningRate * (2 * this.lambdaParam * this.weights[j] - xi[j] * svmY[i]);
          }
          this.bias -= this.learningRate * (-svmY[i]);
        }
      }
    }
  }

  predictProba(X: number[][]): number[] {
    return X.map(xi => {
      const rawDistance = dotProduct(xi, this.weights) + this.bias;
      // Map [-2, 2] smoothly to probability using sigmoid
      return sigmoid(rawDistance * 1.5);
    });
  }

  predict(X: number[][]): number[] {
    return this.predictProba(X).map(p => (p >= 0.5 ? 1 : 0));
  }

  getFeatureImportance(featureNames: string[]): Record<string, number> {
    const totalWeight = this.weights.reduce((sum, w) => sum + Math.abs(w), 0) || 1;
    const importance: Record<string, number> = {};
    featureNames.forEach((name, idx) => {
      importance[name] = Math.abs(this.weights[idx]) / totalWeight;
    });
    return importance;
  }
}

// -------------------------------------------------------------
// 6. XGBoost Model (Simplified Gradient Boosted Decision Trees)
// -------------------------------------------------------------
export class XGBoostModel implements MachineLearningModel {
  basePrediction: number = 0.5;
  trees: DecisionTreeClassifierModel[] = [];
  learningRate: number = 0.1;
  numStages: number = 8;

  fit(X: number[][], y: number[]): void {
    this.trees = [];
    const size = X.length;
    if (size === 0) return;

    // Start with base value
    const pred = new Array(size).fill(this.basePrediction);

    for (let stage = 0; stage < this.numStages; stage++) {
      // Calculate residual pseudo-gradients: residual = y - prediction
      const residuals = new Array(size);
      for (let i = 0; i < size; i++) {
        residuals[i] = y[i] - pred[i];
      }

      // Train a shallow tree to fit residual
      const tree = new DecisionTreeClassifierModel();
      tree.maxDepth = 3;
      tree.fit(X, residuals.map(r => (r >= 0 ? 1 : 0))); // simplified binary residual splits

      X.forEach((xi, i) => {
        const treePred = tree.predictSingle(xi);
        pred[i] += this.learningRate * (treePred - 0.5);
      });

      this.trees.push(tree);
    }
  }

  predictProba(X: number[][]): number[] {
    return X.map(xi => {
      let pred = this.basePrediction;
      this.trees.forEach(tree => {
        pred += this.learningRate * (tree.predictSingle(xi) - 0.5);
      });
      return Math.max(0, Math.min(1, pred));
    });
  }

  predict(X: number[][]): number[] {
    return this.predictProba(X).map(p => (p >= 0.5 ? 1 : 0));
  }

  getFeatureImportance(featureNames: string[]): Record<string, number> {
    const accumulated: Record<string, number> = {};
    featureNames.forEach(name => { accumulated[name] = 0; });

    this.trees.forEach(tree => {
      const singleImp = tree.getFeatureImportance(featureNames);
      for (const key in singleImp) {
        accumulated[key] += singleImp[key];
      }
    });

    const total = Object.values(accumulated).reduce((sum, val) => sum + val, 0) || 1;
    const sortedImp: Record<string, number> = {};
    featureNames.forEach(name => {
      sortedImp[name] = accumulated[name] / total;
    });
    return sortedImp;
  }
}

// -------------------------------------------------------------
// Model Evaluator Utility
// -------------------------------------------------------------
export function evaluateClassifier(
  model: MachineLearningModel,
  X_test: number[][],
  y_test: number[]
): {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
} {
  const predictions = model.predict(X_test);
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;

  for (let i = 0; i < y_test.length; i++) {
    const act = y_test[i];
    const pred = predictions[i];

    if (act === 1 && pred === 1) truePositives++;
    else if (act === 0 && pred === 1) falsePositives++;
    else if (act === 0 && pred === 0) trueNegatives++;
    else if (act === 1 && pred === 0) falseNegatives++;
  }

  const denominatorPrecision = truePositives + falsePositives;
  const denominatorRecall = truePositives + falseNegatives;

  const precision = denominatorPrecision > 0 ? truePositives / denominatorPrecision : 0;
  const recall = denominatorRecall > 0 ? truePositives / denominatorRecall : 0;
  const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  const accuracy = y_test.length > 0 ? (truePositives + trueNegatives) / y_test.length : 0;

  return {
    accuracy,
    precision,
    recall,
    f1Score,
    confusionMatrix: [
      [trueNegatives, falsePositives],
      [falseNegatives, truePositives]
    ]
  };
}
