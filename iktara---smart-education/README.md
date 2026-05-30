# Student Performance Predictor (Machine Learning Full-Stack Solution)

A highly polished, end-to-end full-stack diagnostic machine learning dashboard application designed to analyze student attendance, homework focus cadences, and assessment grades. The system builds real-time prediction Categories (`Excellent`, `Good`, `Average`, `Poor`), evaluates Gini feature importances, and issues custom rule-based remediation planning blueprints.

---

##  Key Deliverables Implemented

1. **Complete Frontend Code**: React + Vite, styled with premium custom designer typographies (Space Grotesk, Inter, JetBrains Mono) and interactive Recharts.
2. **Complete Backend Code**: Express API handlers hosting dataset processing pipelines, ML models, and Gemini endpoints.
3. **ML Training Scripts**: Standalone CLI script (`/server/ml_script.ts`) to train models on demand in the node environment.
4. **API Documentation**: Explicit request/response declarations documented below.
5. **Requirements specifications**: Full list of equivalent Python modules at `/requirements.txt`.
6. **Sample Dataset**: Standard 120-student cohort seeded immediately during installation startup.
7. **Deployment Guide**: Explicit configuration maps for AWS, Vercel, Render, and Fly.io.

---

##  Diagnostic ML Algorithms Suite

The application includes customized, zero-dependency typescript implementations of core ML algorithms within `/server/ml/algorithms.ts`. By fitting standard gradients and node decisions mathematically, this guarantees optimal execution, maximum cold-start speeds, and zero container memory runtime bottlenecks:

* **Random Forest Classifier**: Handles bootstrapped training subsamples and gauges feature coefficients using Gini Impurity reduction boundaries.
* **Decision Tree Classifier**: Recursively splits numerical/categorical limits.
* **Logistic Regression**: Fitted via SGD gradient steps to compute standard passing metrics.
* **Support Vector Machine (SVM)**: Optimized using Hinge-Loss boundaries.
* **XGBoost (Boosted Trees)**: Iterative shallow trees fitting pseudo-gradients residuals.

---

##  REST API Specifications

###  1. Authentication

#### `POST /api/register`
Creates student or administrator profile.
* **Request Body**:
  ```json
  {
    "email": "user@college.edu",
    "password": "mypassword",
    "name": "Jane Doe",
    "role": "student"
  }
  ```
* **Response**:
  ```json
  {
    "message": "Registration successful!",
    "user": {
      "id": "USR-12948194",
      "email": "user@college.edu",
      "role": "student",
      "name": "Jane Doe"
    }
  }
  ```

#### `POST /api/login`
Checks credentials against secure hashes.
* **Request**:
  ```json
  {
    "email": "admin@predictor.com",
    "password": "admin"
  }
  ```

---

### 📊 2. Datasets

#### `POST /api/upload-dataset`
Consolidates raw CSV string inputs into database.
* **Request**:
  ```json
  {
    "csvData": "name,gender,age,attendance,study_hours,assignment_score,internal_marks,participation,sleep_hours,previous_marks,final_result\nLiam,Male,19,85,14,80,75,80,7,78,Pass"
  }
  ```

#### `GET /api/dataset-summary`
Gathers missing cells, data types, and min/max statistics.

---

### 💻 3. Model Operations

#### `POST /api/train-model`
Fits chosen machine learning classifier on database.
* **Request**:
  ```json
  { "algorithm": "rf" } 
  ```
  *(Options: `rf` (Forest), `dt` (Tree), `log_reg` (Logistic), `svm` (SVM), `xgboost` (XGBoost))*

#### `POST /api/predict`
Calculates passing probability, categorizes performance, compiles rule-based study block plans.
* **Request**:
  ```json
  {
    "name": "Sonia Vane",
    "gender": "Female",
    "age": 19,
    "attendance": 85,
    "study_hours": 12,
    "assignment_score": 80,
    "internal_marks": 75,
    "participation": 70,
    "internet_usage": "Yes",
    "sleep_hours": 7,
    "family_support": "High",
    "extracurricular": "Yes",
    "previous_marks": 75
  }
  ```

---

## 🌐 Deployment Instructions

###  1. Frontend on Vercel
1. Install vercel CLI: `npm i -g vercel`
2. Run `vercel login` and `vercel` inside workspace.
3. Keep default build presets (`npm run build`, output output directory: `dist`).

###  2. Server on Render or Railway
1. Setup a custom Web service connected to your repository.
2. Select **Node Runtime**.
3. Set Environment variables inside Render Dashboard:
   - `NODE_ENV=production`
   - `GEMINI_API_KEY=your_gemini_api_key_here`
4. Set Build command: `npm run build`
5. Set Start command: `npm run start`
