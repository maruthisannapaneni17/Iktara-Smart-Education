/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PreprocessorConfig {
  genderMap: Record<string, number>;
  internetMap: Record<string, number>;
  supportMap: Record<string, number>;
  extracurricularMap: Record<string, number>;
  resultMap: Record<string, number>;
  
  // Feature bounds for MinMax scaling: [min, max]
  bounds: Record<string, [number, number]>;
  
  // Imputation values (means)
  imputationVals: Record<string, number>;
  
  featureColumns: string[];
}

export class MLPreprocessor {
  config: PreprocessorConfig = {
    genderMap: { 'male': 0, 'female': 1, 'm': 0, 'f': 1, '0': 0, '1': 1 },
    internetMap: { 'no': 0, 'yes': 1, 'n': 0, 'y': 1, '0': 0, '1': 1 },
    supportMap: { 'low': 0, 'medium': 1, 'high': 2, '0': 0, '1': 1, '2': 2 },
    extracurricularMap: { 'no': 0, 'yes': 1, 'n': 0, 'y': 1, '0': 0, '1': 1 },
    resultMap: { 'fail': 0, 'pass': 1, '0': 0, '1': 1 },
    bounds: {},
    imputationVals: {},
    featureColumns: [
      'gender', 'age', 'attendance', 'study_hours', 'assignment_score', 
      'internal_marks', 'participation', 'internet_usage', 'sleep_hours', 
      'family_support', 'extracurricular', 'previous_marks'
    ]
  };

  /**
   * Fit preprocessor on raw records to calculate means and MinMax boundaries.
   */
  fit(rawRows: any[]) {
    // 1. Imputation values (means)
    const numericCols = ['age', 'attendance', 'study_hours', 'assignment_score', 'internal_marks', 'participation', 'sleep_hours', 'previous_marks'];
    
    numericCols.forEach(col => {
      let sum = 0;
      let count = 0;
      rawRows.forEach(row => {
        const val = parseFloat(row[col]);
        if (!isNaN(val)) {
          sum += val;
          count++;
        }
      });
      const mean = count > 0 ? sum / count : 50.0; // default midpoint fallback
      this.config.imputationVals[col] = mean;
    });

    // Handle categorical means/modes
    this.config.imputationVals['gender'] = 0;
    this.config.imputationVals['internet_usage'] = 1;
    this.config.imputationVals['family_support'] = 1;
    this.config.imputationVals['extracurricular'] = 0;

    // 2. Bounds calculation for MinMax Scaling
    numericCols.forEach(col => {
      let min = Infinity;
      let max = -Infinity;
      rawRows.forEach(row => {
        const parsed = parseFloat(row[col]);
        const val = isNaN(parsed) ? this.config.imputationVals[col] : parsed;
        if (val < min) min = val;
        if (val > max) max = val;
      });
      // Prevent division by zero
      if (min === max) {
        min = 0;
        max = 100;
      }
      this.config.bounds[col] = [min, max];
    });
  }

  /**
   * Encode a single value for cell entry
   */
  encodeVal(col: string, val: any): number {
    if (val === undefined || val === null || val === '') {
      return this.config.imputationVals[col] ?? 0;
    }

    const strVal = String(val).trim().toLowerCase();

    switch (col) {
      case 'gender':
        return this.config.genderMap[strVal] ?? 0;
      case 'internet_usage':
        return this.config.internetMap[strVal] ?? 1;
      case 'family_support':
        return this.config.supportMap[strVal] ?? 1;
      case 'extracurricular':
        return this.config.extracurricularMap[strVal] ?? 0;
      case 'final_result':
        return this.config.resultMap[strVal] ?? 0;
      default:
        // Numeric attributes
        const parsed = parseFloat(val);
        const filled = isNaN(parsed) ? (this.config.imputationVals[col] ?? 50) : parsed;
        // Apply MinMax scaling to numeric
        if (this.config.bounds[col]) {
          const [min, max] = this.config.bounds[col];
          return (filled - min) / (max - min);
        }
        return filled;
    }
  }

  /**
   * Transform an array of objects into standard X (features) and y (targets) matrices.
   */
  transform(rawRows: any[]): { X: number[][], y: number[] } {
    const X: number[][] = [];
    const y: number[] = [];

    rawRows.forEach(row => {
      const featureVec = this.config.featureColumns.map(col => this.encodeVal(col, row[col]));
      X.push(featureVec);

      // Target label 'final_result'
      const targetVal = this.encodeVal('final_result', row['final_result']);
      y.push(targetVal);
    });

    return { X, y };
  }

  /**
   * Transforms a single student input for runtime predictions.
   */
  transformSingle(student: any): number[] {
    return this.config.featureColumns.map(col => this.encodeVal(col, student[col]));
  }

  /**
   * Standard library style train-test splitter.
   */
  split(X: number[][], y: number[], testSize: number = 0.25): {
    X_train: number[][];
    y_train: number[];
    X_test: number[][];
    y_test: number[];
  } {
    const dataSize = X.length;
    const indices = Array.from({ length: dataSize }, (_, i) => i);
    
    // Shuffle indices deterministically for reproducible modeling
    let seed = 42;
    const random = () => {
      const x = Math.sin(seed++) * 10000;
      return x - Math.floor(x);
    };

    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const testCount = Math.floor(dataSize * testSize);
    const testIndices = new Set(indices.slice(0, testCount));

    const X_train: number[][] = [];
    const y_train: number[] = [];
    const X_test: number[][] = [];
    const y_test: number[] = [];

    for (let i = 0; i < dataSize; i++) {
      if (testIndices.has(i)) {
        X_test.push(X[i]);
        y_test.push(y[i]);
      } else {
        X_train.push(X[i]);
        y_train.push(y[i]);
      }
    }

    return { X_train, y_train, X_test, y_test };
  }
}
