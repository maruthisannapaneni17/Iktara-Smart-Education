/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function generateStudentReport(student: {
  name: string;
  attendance: number;
  study_hours: number;
  assignment_score: number;
  internal_marks: number;
  participation: number;
  sleep_hours: number;
  previous_marks: number;
  extracurricular: string;
  family_support: string;
  internet_usage: string;
}, predictedPerformance: 'Excellent' | 'Good' | 'Average' | 'Poor', probability: number) {
  
  const recommendations: string[] = [];
  const studyPlan: string[] = [];
  const riskFactors: string[] = [];

  // 1. Evaluate Attendance
  if (student.attendance < 75) {
    recommendations.push("CRITICAL: Attendance is below the mandatory 75% threshold. Setup a daily log and immediately meet with the academic counselor.");
    studyPlan.push("Attendance Boost: Attend all registered active lecture hours this week (Target: 90%+).");
    riskFactors.push("Low attendance is severely limiting direct concept absorption.");
  } else if (student.attendance < 85) {
    recommendations.push("Attendance Warning: Attendance is average. Try to minimize absences to avoid slipping below guidelines.");
    studyPlan.push("Attendance Consistency: Ensure no unexcused class misses next month.");
  }

  // 2. Evaluate Assignment Completion
  if (student.assignment_score < 70) {
    recommendations.push("Urgent: Focus heavily on assignment deadlines. Missing assignments have a direct compound negative impact on internal grades.");
    studyPlan.push("Assignment Remediation: Schedule 2 hours every Tuesday and Thursday exclusively for completing forthcoming homework sets.");
    riskFactors.push("Incomplete assignments represent a severe risk to cumulative practical score.");
  } else if (student.assignment_score < 85) {
    recommendations.push("Increase assignment review cycles. Proofread solutions with study groups before final submissions.");
  }

  // 3. Evaluate Study Hours
  if (student.study_hours < 8) {
    recommendations.push("Involvement Gap: Weekly non-classroom study hours are low. Boost self-study to a minimum of 10-15 hours for safety.");
    studyPlan.push("Incremental Study blocks: Implement three 1.5-hour sessions on weekends for revision.");
    riskFactors.push("Very low self-study hours might trigger retention struggles during tests.");
  } else {
    studyPlan.push("Study Continuity: Maintain the strong current revision cadence (currently " + student.study_hours + " hours/week).");
  }

  // 4. Evaluate Sleep hours
  if (student.sleep_hours < 6.5) {
    recommendations.push("Lifestyle Adjustment: Average nightly sleep is below 6.5 hours. Cognitive performance is strongly correlated with adequate rest.");
    studyPlan.push("Rejuvenation Rule: Maintain a strict screen-off bedtime at least 7.5 hours prior to morning classes.");
    riskFactors.push("Sleep deprivation lowers focus, memory recall, and stress tolerance during exams.");
  }

  // 5. Evaluate Internal Marks
  if (student.internal_marks < 60) {
    recommendations.push("Classroom Alert: Internal exams marks indicate high difficulty grasping primary curriculum. Ask for personal mentoring.");
    studyPlan.push("Mentorship Intake: Join twice-weekly official tutoring groups or office hours with teaching assistants.");
    riskFactors.push("Low internal assessment scores require rapid intervention before final exams.");
  }

  // 6. Evaluate Participation
  if (student.participation < 60) {
    recommendations.push("Classroom engagement is low. Active participation (asking questions, sharing during boards) improves confidence and grade scoring.");
  }

  // General recommendation based on Performance category
  switch (predictedPerformance) {
    case 'Excellent':
      recommendations.unshift("Peer Leadership: Consider registering as a peer tutor or peer mentor in core subjects to strengthen expertise.");
      studyPlan.unshift("Advanced Pursuit: Dedicate 3 hours weekly to supplementary reading, high-level research questions, or technical projects.");
      break;
    case 'Good':
      recommendations.unshift("Consolidate Performance: Target consistent performance across secondary subjects to push towards 'Excellent' tier.");
      studyPlan.unshift("Optimization block: Set a monthly review session to identify micro-gaps in previous exams.");
      break;
    case 'Average':
      recommendations.unshift("Foundational Support: Dedicate 45 minutes daily to reviewing conceptual summaries of earlier modules.");
      studyPlan.unshift("Active Learning: Leverage flashcards or practice test questions twice a week.");
      break;
    case 'Poor':
      recommendations.unshift("EMERGENCY PREVENTATIVE ACTION: Immediately form a dedicated academic recovery plan with course lead.");
      studyPlan.unshift("Daily Remediation: Complete a mandatory daily 1-hour recap of that day's lecture notes in the library.");
      break;
  }

  // Populate Default Plans if list is lightweight
  if (studyPlan.length < 3) {
    studyPlan.push("Weekly Target: Complete 100% of reading materials ahead of actual classes.");
    studyPlan.push("Exam Readiness: Take a full practice mock-exam 10 days before primary midterm tests.");
  }

  return {
    name: student.name,
    predictedPerformance,
    probability,
    riskLevel: probability > 0.75 ? 'Low' : probability > 0.5 ? 'Medium' : probability > 0.3 ? 'High' : 'Critical',
    recommendations,
    studyPlan,
    riskFactors: riskFactors.length > 0 ? riskFactors : ["None detected - keep running standard protocol."]
  };
}
