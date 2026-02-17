/**
 * Blood pressure risk category (ACC/AHA).
 * Single responsibility: map SBP/DBP and medication status to BP risk level.
 */

import type { NormalizedPatient } from "../../validation";
import type { RiskCandidate } from "../types";

export function calculateBpRisk(patient: NormalizedPatient): RiskCandidate {
  const sbp = patient.systolicBp;
  const dbp = patient.diastolicBp;

  let level: RiskCandidate["level"] = "Low";
  let category = "";
  let score = 0.2;
  const why: string[] = [];
  const warnings: string[] = [];

  if (sbp < 90 || (dbp && dbp < 60)) {
    category = "Hypotension";
    level = "Low";
    score = 0.15;
    why.push(`SBP ${sbp} mmHg (very low)`);
    warnings.push("Very low BP may indicate measurement error or underlying condition");
  } else if (sbp < 120 && (!dbp || dbp < 80)) {
    category = "Normal";
    level = "Low";
    score = 0.2;
    why.push(`SBP ${sbp} mmHg (normal range)`);
  } else if (sbp < 130 && (!dbp || dbp < 80)) {
    category = "Elevated";
    level = "Borderline";
    score = 0.35;
    why.push(`SBP ${sbp} mmHg (elevated)`);
  } else if (sbp < 140 || (dbp && dbp < 90)) {
    category = "Stage 1 Hypertension";
    level = "Intermediate";
    score = 0.55;
    why.push(`SBP ${sbp} mmHg (Stage 1)`);
    if (patient.onBpMeds === "yes") why.push("Currently on BP medication");
  } else if (sbp < 180 || (dbp && dbp < 120)) {
    category = "Stage 2 Hypertension";
    level = "High";
    score = 0.75;
    why.push(`SBP ${sbp} mmHg (Stage 2)`);
    if (patient.onBpMeds === "yes") {
      warnings.push("BP remains elevated despite medication - may need adjustment");
    }
  } else {
    category = "Hypertensive Crisis";
    level = "Critical";
    score = 0.95;
    why.push(`SBP ${sbp} mmHg (crisis level)`);
    warnings.push("Immediate medical evaluation recommended");
  }

  return {
    id: "bp_category",
    title: "Blood Pressure Status",
    level,
    score,
    value: { systolic: sbp, diastolic: dbp ?? null, category },
    why,
    warnings: warnings.length > 0 ? warnings : undefined,
    actions:
      level === "High" || level === "Critical"
        ? [
            "Regular BP monitoring",
            "Medication adherence review",
            "Lifestyle modifications (DASH diet, exercise)",
            level === "Critical" ? "Consider immediate medical evaluation" : "Follow-up with clinician",
          ]
        : undefined,
  };
}
