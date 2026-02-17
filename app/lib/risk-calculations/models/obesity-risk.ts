/**
 * Obesity and severe obesity risk from BMI.
 * Single responsibility: BMI-based cardiometabolic risk categories.
 */

import type { NormalizedPatient } from "../../validation";
import type { RiskCandidate } from "../types";

export function calculateObesityRisk(patient: NormalizedPatient): RiskCandidate | null {
  if (patient.bmi == null) return null;

  if (patient.bmi >= 35) {
    return {
      id: "severe_obesity",
      title: "Severe Obesity / Cardiometabolic Risk",
      level: "High",
      score: 0.75,
      value: { bmi: patient.bmi },
      why: [`BMI ${patient.bmi} (≥35 - severe obesity)`],
      actions: [
        "Weight management plan with healthcare provider",
        "Nutrition counseling",
        "Physical activity program",
        "Consider bariatric evaluation if BMI ≥40",
        "Metabolic screening",
      ],
    };
  }

  if (patient.bmi >= 30) {
    return {
      id: "obesity",
      title: "Obesity Risk",
      level: "Intermediate",
      score: 0.5,
      value: { bmi: patient.bmi },
      why: [`BMI ${patient.bmi} (obese)`],
      actions: [
        "Weight management",
        "Calorie reduction",
        "Regular physical activity",
        "Metabolic monitoring",
      ],
    };
  }

  return null;
}
