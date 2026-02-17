/**
 * Relative / lifetime risk indicator for ages &lt; 40.
 * Used when 10-year ASCVD is not validated; summarizes risk factors instead.
 */

import type { NormalizedPatient } from "../../validation";
import type { RiskCandidate } from "../types";

const RELATIVE_RISK_WARNING =
  "10-year ASCVD risk equations are not validated for ages <40. Showing risk factor summary and lifetime/relative risk indicators instead.";

export function calculateRelativeRisk(patient: NormalizedPatient): RiskCandidate {
  const riskFactors: string[] = [];
  let score = 0.2;

  if (patient.hasDiabetes === "yes") {
    riskFactors.push("Diabetes");
    score += 0.3;
  }
  if (patient.smokingStatus === "current") {
    riskFactors.push("Current smoker");
    score += 0.25;
  }
  if (patient.systolicBp >= 140) {
    riskFactors.push(`Elevated BP (${patient.systolicBp} mmHg)`);
    score += 0.2;
  }
  if (patient.bmi != null && patient.bmi >= 30) {
    riskFactors.push(`Obesity (BMI ${patient.bmi})`);
    score += 0.15;
  }
  if (patient.familyHistoryPrematureCvd === "yes") {
    riskFactors.push("Family history of premature CVD");
    score += 0.1;
  }

  const level: RiskCandidate["level"] =
    score >= 0.6 ? "High" : score >= 0.4 ? "Intermediate" : "Low";

  return {
    id: "relative_risk",
    title: "Cardiovascular Risk Factors Summary",
    level,
    score: Math.min(score, 0.8),
    value: { age: patient.age, note: "Lifetime/relative risk indicator (proxy)" },
    why: riskFactors.length > 0 ? riskFactors : ["No major risk factors identified"],
    warnings: [RELATIVE_RISK_WARNING],
    actions:
      level !== "Low"
        ? [
            "Focus on modifiable risk factors",
            "Regular health screenings",
            "Lifestyle modifications",
            "Consider 10-year ASCVD risk assessment at age 40+",
          ]
        : undefined,
  };
}
