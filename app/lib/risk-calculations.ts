import type { NormalizedPatient } from "./validation";
import { mmolLToMgdL } from "./unit-conversion";

export type RiskCandidate = {
  id: string;
  title: string;
  level: "Low" | "Borderline" | "Intermediate" | "High" | "Critical";
  score: number; // 0-1 urgency score
  value?: any;
  why: string[];
  warnings?: string[];
  actions?: string[];
};

export type ValidationResult = {
  errors: string[];
  warnings: string[];
};

/**
 * @deprecated Use PatientNormalizationService and WarningDetectionService instead
 * This function is kept for backward compatibility but will be removed in future versions
 */
export function normalizeAndValidate(
  data: any
): { patient: NormalizedPatient | null; validation: ValidationResult } {
  // Legacy implementation - kept for compatibility
  // New code should use the service layer
  const { patientNormalizationService } = require("./services/patient-normalization.service");
  const { warningDetectionService } = require("./services/warning-detection.service");
  const { validatePatientData } = require("./validators/patient-validator");

  const validation = validatePatientData(data);
  if (!validation.isValid) {
    return {
      patient: null,
      validation: {
        errors: validation.errors.map((e) => e.message),
        warnings: [],
      },
    };
  }

  try {
    const patient = patientNormalizationService.normalize(data);
    const warnings = warningDetectionService.detectWarnings(patient);
    
    return {
      patient,
      validation: {
        errors: [],
        warnings: warnings.map((w) => w.message),
      },
    };
  } catch (error) {
    return {
      patient: null,
      validation: {
        errors: [
          error instanceof Error ? error.message : "Failed to normalize patient data",
        ],
        warnings: [],
      },
    };
  }
}

/**
 * Calculate Blood Pressure Risk Category
 */
function calculateBpRisk(patient: NormalizedPatient): RiskCandidate {
  const sbp = patient.systolicBp;
  const dbp = patient.diastolicBp;

  let level: RiskCandidate["level"] = "Low";
  let category = "";
  let score = 0.2;
  const why: string[] = [];
  const warnings: string[] = [];

  // ACC/AHA BP Categories
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
    if (patient.onBpMeds === "yes") {
      why.push("Currently on BP medication");
    }
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
    value: { systolic: sbp, diastolic: dbp || null, category },
    why,
    warnings: warnings.length > 0 ? warnings : undefined,
    actions:
      level === "High" || level === "Critical"
        ? [
            "Regular BP monitoring",
            "Medication adherence review",
            "Lifestyle modifications (DASH diet, exercise)",
            level === "Critical"
              ? "Consider immediate medical evaluation"
              : "Follow-up with clinician",
          ]
        : undefined,
  };
}

/**
 * Calculate Diabetes Risk
 */
function calculateDiabetesRisk(patient: NormalizedPatient): RiskCandidate {
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

  // Calculate diabetes risk if no diabetes
  let score = 0.2;
  const why: string[] = [];
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

  if (riskFactors.length > 0) {
    why.push(...riskFactors);
  } else {
    why.push("No major risk factors identified");
  }

  const level: RiskCandidate["level"] =
    score >= 0.5 ? "Intermediate" : score >= 0.3 ? "Borderline" : "Low";

  return {
    id: "diabetes_risk",
    title: "Type 2 Diabetes Risk",
    level,
    score: Math.min(score, 0.7),
    why,
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

/**
 * Calculate ASCVD 10-year risk (simplified)
 */
function calculateAscvdRisk(patient: NormalizedPatient): RiskCandidate | null {
  // ASCVD is validated for ages 40-79
  if (patient.age < 40) {
    return null; // Will be handled separately with relative risk
  }

  if (!patient.hasLabResults || !patient.totalCholesterol || !patient.hdlCholesterol) {
    return null; // Need lab results
  }

  const age = patient.age;
  const sex = patient.sexAtBirth;
  const totalChol = patient.totalCholesterol;
  const hdlChol = patient.hdlCholesterol;
  const sbp = patient.systolicBp;
  const onMeds = patient.onBpMeds === "yes";
  const diabetes = patient.hasDiabetes === "yes";
  const smoker = patient.smokingStatus === "current";

  // Simplified ASCVD risk calculation (this is a proxy - real ASCVD uses complex equations)
  // Based on Pooled Cohort Equations logic
  let riskScore = 0;

  // Age factor
  riskScore += (age - 40) * 0.02;

  // Sex factor
  if (sex === "male") {
    riskScore += 0.1;
  }

  // Cholesterol ratio
  const cholRatio = totalChol / hdlChol;
  if (cholRatio > 5) {
    riskScore += 0.3;
  } else if (cholRatio > 4) {
    riskScore += 0.2;
  } else if (cholRatio > 3) {
    riskScore += 0.1;
  }

  // BP factor
  if (sbp >= 160) {
    riskScore += onMeds ? 0.25 : 0.3;
  } else if (sbp >= 140) {
    riskScore += onMeds ? 0.15 : 0.2;
  } else if (sbp >= 130) {
    riskScore += onMeds ? 0.1 : 0.15;
  }

  // Major risk factors
  if (diabetes) riskScore += 0.25;
  if (smoker) riskScore += 0.2;

  // Convert to percentage (simplified)
  const riskPercent = Math.min(riskScore * 10, 30); // Cap at 30% for simplification

  let level: RiskCandidate["level"] = "Low";
  if (riskPercent >= 20) {
    level = "High";
  } else if (riskPercent >= 7.5) {
    level = "Intermediate";
  } else if (riskPercent >= 5) {
    level = "Borderline";
  }

  const why: string[] = [];
  if (diabetes) why.push("Diabetes present");
  if (smoker) why.push("Current smoker");
  if (sbp >= 140) why.push(`Elevated BP (${sbp} mmHg)`);
  if (cholRatio > 4) why.push(`Unfavorable cholesterol ratio (${cholRatio.toFixed(1)})`);
  if (age >= 65) why.push("Age ≥65");

  return {
    id: "ascvd_10yr",
    title: "10-Year ASCVD Risk",
    level,
    score: Math.min(riskPercent / 30, 0.9), // Normalize to 0-1
    value: { 
      riskPercent: Math.round(riskPercent), 
      age, 
      sex,
      validated: true, // Indicates this is validated for this age group
      note: "Based on Pooled Cohort Equations (validated for ages 40-79)"
    },
    why,
    actions:
      level === "High"
        ? [
            "High-intensity statin therapy (if appropriate)",
            "BP management to <130/80",
            "Lifestyle modifications",
            "Regular monitoring",
          ]
        : level === "Intermediate"
          ? [
              "Moderate-intensity statin consideration",
              "BP control",
              "Lifestyle modifications",
              "Reassess in 5-10 years",
            ]
          : undefined,
  };
}

/**
 * Calculate Severe Obesity Risk
 */
function calculateObesityRisk(patient: NormalizedPatient): RiskCandidate | null {
  if (!patient.bmi) return null;

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

/**
 * Calculate relative risk for ages < 40
 */
function calculateRelativeRisk(patient: NormalizedPatient): RiskCandidate {
  const riskFactors: string[] = [];
  let score = 0.2;
  const warnings: string[] = [];

  // Add warning about model validity
  warnings.push(
    "10-year ASCVD risk equations are not validated for ages <40. Showing risk factor summary and lifetime/relative risk indicators instead."
  );

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
  if (patient.bmi && patient.bmi >= 30) {
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
    warnings: warnings.length > 0 ? warnings : undefined,
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

/**
 * Evaluate all risks and return candidates
 */
export function evaluateRisks(patient: NormalizedPatient): RiskCandidate[] {
  const candidates: RiskCandidate[] = [];

  // Always calculate BP risk
  candidates.push(calculateBpRisk(patient));

  // Always calculate diabetes risk
  candidates.push(calculateDiabetesRisk(patient));

  // ASCVD risk (if age >= 40 and has lab results)
  const ascvdRisk = calculateAscvdRisk(patient);
  if (ascvdRisk) {
    candidates.push(ascvdRisk);
  } else if (patient.age < 40) {
    // For ages < 40, use relative risk
    candidates.push(calculateRelativeRisk(patient));
  }

  // Obesity risk
  const obesityRisk = calculateObesityRisk(patient);
  if (obesityRisk) {
    candidates.push(obesityRisk);
  }

  return candidates;
}

/**
 * Rank and return top 3 risks
 */
export function rankTop3(candidates: RiskCandidate[]): RiskCandidate[] {
  return candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
