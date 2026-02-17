/**
 * Framingham 10-year CHD risk calculator.
 * Valid for age 30–74 with lab results (TC, HDL in mg/dL).
 */

import type { NormalizedPatient } from "../../validation";
import type { RiskCandidate } from "../types";
import {
  FRAMINGHAM_BASELINE_MEN,
  FRAMINGHAM_BASELINE_WOMEN,
  FRAMINGHAM_MEAN_MEN,
  FRAMINGHAM_MEAN_WOMEN,
  FRAMINGHAM_BETA_MEN,
  FRAMINGHAM_BETA_WOMEN,
} from "./constants";

function riskLevelFromPercent(riskPercent: number): RiskCandidate["level"] {
  if (riskPercent >= 20) return "High";
  if (riskPercent >= 10) return "Intermediate";
  if (riskPercent >= 5) return "Borderline";
  return "Low";
}

function buildFraminghamCandidate(
  patient: NormalizedPatient,
  risk10: number,
  sex: "male" | "female"
): RiskCandidate {
  const riskPercent = Math.min(Math.max(risk10 * 100, 0), 99);
  const level = riskLevelFromPercent(riskPercent);

  const why: string[] = [];
  if (patient.hasDiabetes === "yes") why.push("Diabetes present");
  if (patient.smokingStatus === "current") why.push("Current smoker");
  if (patient.systolicBp >= 140) why.push(`Elevated BP (${patient.systolicBp} mmHg)`);
  if (
    patient.totalCholesterol != null &&
    patient.hdlCholesterol != null &&
    patient.totalCholesterol / patient.hdlCholesterol > 4
  ) {
    why.push(
      `Unfavorable cholesterol ratio (${(patient.totalCholesterol / patient.hdlCholesterol).toFixed(1)})`
    );
  }
  if (patient.age >= 60) why.push("Age ≥60");

  return {
    id: "framingham_10yr_chd",
    title: "10-Year Framingham CHD Risk",
    level,
    score: Math.min(riskPercent / 30, 0.9),
    value: {
      riskPercent: Math.round(riskPercent * 10) / 10,
      age: patient.age,
      sex,
      note: "Framingham Heart Study 10-year CHD (D'Agostino 2008), 1 - S₀^exp(ΣβX - B̄)",
    },
    why,
    actions:
      level === "High"
        ? [
            "Statin and BP therapy per guidelines",
            "Lifestyle modifications",
            "Regular monitoring",
          ]
        : level === "Intermediate"
          ? ["Moderate-intensity statin consideration", "BP control", "Reassess in 5-10 years"]
          : undefined,
  };
}

export function calculateFraminghamRisk(patient: NormalizedPatient): RiskCandidate | null {
  if (patient.age < 30 || patient.age > 74) return null;
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

  const lnAge = Math.log(age);
  const lnTc = Math.log(totalChol);
  const lnHdl = Math.log(hdlChol);
  const lnSbp = Math.log(sbp);

  if (sex === "male") {
    const sumBx =
      FRAMINGHAM_BETA_MEN.lnAge * lnAge +
      FRAMINGHAM_BETA_MEN.lnTc * lnTc +
      FRAMINGHAM_BETA_MEN.lnHdl * lnHdl +
      (onMeds ? FRAMINGHAM_BETA_MEN.lnSbpTx : FRAMINGHAM_BETA_MEN.lnSbpNoTx) * lnSbp +
      (smoker ? FRAMINGHAM_BETA_MEN.smoke : 0) +
      (diabetes ? FRAMINGHAM_BETA_MEN.diabetes : 0);
    const risk10 = 1 - Math.pow(FRAMINGHAM_BASELINE_MEN, Math.exp(sumBx - FRAMINGHAM_MEAN_MEN));
    return buildFraminghamCandidate(patient, risk10, "male");
  }

  const sumBx =
    FRAMINGHAM_BETA_WOMEN.lnAge * lnAge +
    FRAMINGHAM_BETA_WOMEN.lnTc * lnTc +
    FRAMINGHAM_BETA_WOMEN.lnHdl * lnHdl +
    (onMeds ? FRAMINGHAM_BETA_WOMEN.lnSbpTx : FRAMINGHAM_BETA_WOMEN.lnSbpNoTx) * lnSbp +
    (smoker ? FRAMINGHAM_BETA_WOMEN.smoke : 0) +
    (diabetes ? FRAMINGHAM_BETA_WOMEN.diabetes : 0);
  const risk10 = 1 - Math.pow(FRAMINGHAM_BASELINE_WOMEN, Math.exp(sumBx - FRAMINGHAM_MEAN_WOMEN));
  return buildFraminghamCandidate(patient, risk10, "female");
}
