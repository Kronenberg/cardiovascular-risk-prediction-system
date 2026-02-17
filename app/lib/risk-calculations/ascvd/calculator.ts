/**
 * ASCVD 10-year risk: Pooled Cohort Equations (2013 ACC/AHA).
 * Valid for age 40–79 with lab results (TC, HDL in mg/dL).
 */

import type { NormalizedPatient } from "../../validation";
import type { RiskCandidate } from "../types";
import { PCE_COEFFICIENTS } from "./constants";
import type { PceGroup } from "./constants";

function getPceGroup(sex: "male" | "female", raceEthnicity?: string): PceGroup {
  const isBlack = raceEthnicity === "black";
  if (sex === "male") return isBlack ? "black_male" : "white_male";
  return isBlack ? "black_female" : "white_female";
}

function riskLevelFromPercent(riskPercent: number): RiskCandidate["level"] {
  if (riskPercent >= 20) return "High";
  if (riskPercent >= 7.5) return "Intermediate";
  if (riskPercent >= 5) return "Borderline";
  return "Low";
}

export function calculateAscvdRisk(patient: NormalizedPatient): RiskCandidate | null {
  if (patient.age < 40 || patient.age > 79) return null;
  if (
    !patient.hasLabResults ||
    patient.totalCholesterol == null ||
    patient.hdlCholesterol == null
  ) {
    return null;
  }

  const age = patient.age;
  const sex = patient.sexAtBirth;
  const totalChol = Math.max(patient.totalCholesterol, 1);
  const hdlChol = Math.max(patient.hdlCholesterol, 1);
  const sbp = Math.max(patient.systolicBp, 90);
  const onMeds = patient.onBpMeds === "yes";
  const diabetes = patient.hasDiabetes === "yes";
  const smoker = patient.smokingStatus === "current";

  const group = getPceGroup(sex, patient.raceEthnicity);
  const c = PCE_COEFFICIENTS[group];

  const lnAge = Math.log(age);
  const lnTc = Math.log(totalChol);
  const lnHdl = Math.log(hdlChol);
  const lnSbp = Math.log(sbp);

  let linearPredictor =
    c.lnAge * lnAge +
    c.lnAgeSq * lnAge * lnAge +
    c.lnTc * lnTc +
    c.lnAgeLnTc * lnAge * lnTc +
    c.lnHdl * lnHdl +
    c.lnAgeLnHdl * lnAge * lnHdl +
    (onMeds ? c.lnSbpTx : c.lnSbpNoTx) * lnSbp +
    (smoker ? c.smoke : 0) +
    (diabetes ? c.diabetes : 0);

  if (c.lnAgeLnSbpNoTx != null && c.lnAgeLnSbpTx != null) {
    linearPredictor += onMeds
      ? c.lnAgeLnSbpTx * lnAge * lnSbp
      : c.lnAgeLnSbpNoTx * lnAge * lnSbp;
  }

  const risk10 =
    1 -
    Math.pow(c.baselineSurvival10, Math.exp(linearPredictor - c.meanLinearPredictor));
  const riskPercent = Math.min(Math.max(risk10 * 100, 0), 99);
  const level = riskLevelFromPercent(riskPercent);

  const why: string[] = [];
  if (diabetes) why.push("Diabetes present");
  if (smoker) why.push("Current smoker");
  if (sbp >= 140) why.push(`Elevated BP (${sbp} mmHg)`);
  const cholRatio = totalChol / hdlChol;
  if (cholRatio > 4) why.push(`Unfavorable cholesterol ratio (${cholRatio.toFixed(1)})`);
  if (age >= 65) why.push("Age ≥65");

  return {
    id: "ascvd_10yr",
    title: "10-Year ASCVD Risk",
    level,
    score: Math.min(riskPercent / 30, 0.9),
    value: {
      riskPercent: Math.round(riskPercent * 10) / 10,
      age,
      sex,
      raceEthnicity: patient.raceEthnicity,
      validated: true,
      note: "Pooled Cohort Equations (ACC/AHA 2013), formula 1 - S₁₀^exp(ΣβᵢXᵢ - B̄)",
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
