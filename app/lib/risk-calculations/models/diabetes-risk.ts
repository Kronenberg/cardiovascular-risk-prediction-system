/**
 * Diabetes as CV risk factor and type 2 diabetes risk (no diabetes).
 * Single responsibility: diabetes present vs risk factors for future diabetes.
 */

import type { NormalizedPatient } from "../../validation";
import type { RiskCandidate } from "../types";

export function calculateDiabetesRisk(patient: NormalizedPatient): RiskCandidate {
  if (patient.hasDiabetes === "yes") {
    return {
      id: "diabetes",
      title: "Diabetes as Cardiovascular Risk Factor",
      level: "High",
      score: 0.8,
      why: ["Diabetes = Yes"],
      actions: [
        "Diabetes is a major CV risk factor",
        "A1c monitoring and glycemic control",
        "Regular cardiovascular screening",
        "Lifestyle + medication adherence",
        "Annual lipid panel and kidney function tests",
      ],
    };
  }

  let score = 0.2;
  const riskFactors: string[] = [];

  if (patient.bmi && patient.bmi >= 30) {
    score += 0.2;
    riskFactors.push(`BMI ${patient.bmi} (obese)`);
  } else if (patient.bmi && patient.bmi >= 25) {
    score += 0.1;
    riskFactors.push(`BMI ${patient.bmi} (overweight)`);
  }
  if (patient.age >= 45) {
    score += 0.15;
    riskFactors.push("Age ≥45");
  }
  if (patient.familyHistoryPrematureCvd === "yes") {
    score += 0.1;
    riskFactors.push("Family history of CVD");
  }
  if (patient.physicalActivity === "<1") {
    score += 0.1;
    riskFactors.push("Low physical activity");
  }

  const level: RiskCandidate["level"] =
    score >= 0.5 ? "Intermediate" : score >= 0.3 ? "Borderline" : "Low";

  return {
    id: "diabetes_risk",
    title: "Type 2 Diabetes Risk",
    level,
    score: Math.min(score, 0.7),
    why: riskFactors.length > 0 ? riskFactors : ["No major risk factors identified"],
    actions:
      level !== "Low"
        ? [
            "Regular glucose screening",
            "Weight management if overweight",
            "Increase physical activity",
            "Healthy diet (Mediterranean or DASH)",
          ]
        : undefined,
  };
}
