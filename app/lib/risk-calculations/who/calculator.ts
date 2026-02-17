/**
 * WHO CVD 10-year risk: lab-based and non-lab models, 21 regions.
 * Lab: age, SBP, TC (mmol/L), smoking, diabetes. Non-lab: age, SBP, BMI, smoking.
 */

import type { NormalizedPatient } from "../../validation";
import type { RiskCandidate } from "../types";
import { mgdLToMmolL } from "../../unit-conversion";
import type { WhoRegion } from "./types";
import {
  WHO_REGION_CALIBRATION,
  WHO_BASELINE_CHD_M,
  WHO_BASELINE_CHD_F,
  WHO_BASELINE_STROKE_M,
  WHO_BASELINE_STROKE_F,
} from "./constants";

const LN = Math.log;

function labLinearPredictor(
  age: number,
  sbp: number,
  tcMmolL: number,
  smoking: boolean,
  diabetes: boolean,
  sex: "male" | "female"
): { lpChd: number; lpStroke: number } {
  const ageC = (age - 60) / 5;
  const sbpC = (sbp - 120) / 20;
  const tcC = tcMmolL - 6;

  if (sex === "male") {
    return {
      lpChd:
        LN(1.43) * ageC +
        LN(1.76) * (smoking ? 1 : 0) +
        LN(1.3) * sbpC +
        LN(1.9) * (diabetes ? 1 : 0) +
        LN(1.26) * tcC,
      lpStroke:
        LN(1.64) * ageC +
        LN(1.65) * (smoking ? 1 : 0) +
        LN(1.56) * sbpC +
        LN(1.87) * (diabetes ? 1 : 0) +
        LN(1.03) * tcC,
    };
  }
  return {
    lpChd:
      LN(1.67) * ageC +
      LN(2.87) * (smoking ? 1 : 0) +
      LN(1.37) * sbpC +
      LN(2.92) * (diabetes ? 1 : 0) +
      LN(1.23) * tcC,
    lpStroke:
      LN(1.7) * ageC +
      LN(2.11) * (smoking ? 1 : 0) +
      LN(1.51) * sbpC +
      LN(2.36) * (diabetes ? 1 : 0) +
      LN(1.03) * tcC,
  };
}

function nonLabLinearPredictor(
  age: number,
  sbp: number,
  bmi: number,
  smoking: boolean,
  sex: "male" | "female"
): { lpChd: number; lpStroke: number } {
  const ageC = (age - 60) / 5;
  const sbpC = (sbp - 120) / 20;
  const bmiC = bmi - 25;

  if (sex === "male") {
    return {
      lpChd:
        LN(1.44) * ageC +
        LN(1.81) * (smoking ? 1 : 0) +
        LN(1.31) * sbpC +
        LN(1.18) * bmiC,
      lpStroke:
        LN(1.63) * ageC +
        LN(1.65) * (smoking ? 1 : 0) +
        LN(1.58) * sbpC +
        LN(1.08) * bmiC,
    };
  }
  return {
    lpChd:
      LN(1.69) * ageC +
      LN(2.98) * (smoking ? 1 : 0) +
      LN(1.4) * sbpC +
      LN(1.14) * bmiC,
    lpStroke:
      LN(1.69) * ageC +
      LN(2.1) * (smoking ? 1 : 0) +
      LN(1.54) * sbpC +
      LN(1.02) * bmiC,
  };
}

function riskLevelFromPercent(riskPercent: number): RiskCandidate["level"] {
  if (riskPercent >= 20) return "High";
  if (riskPercent >= 10) return "Intermediate";
  if (riskPercent >= 5) return "Borderline";
  return "Low";
}

const DEFAULT_WHO_REGION: WhoRegion = "north_america_high_income";

export function calculateWhoCvdRisk(
  patient: NormalizedPatient,
  region: WhoRegion = DEFAULT_WHO_REGION
): RiskCandidate | null {
  if (patient.age < 40 || patient.age > 80) return null;

  const age = patient.age;
  const sex = patient.sexAtBirth;
  const sbp = Math.max(patient.systolicBp, 90);
  const smoking = patient.smokingStatus === "current";
  const diabetes = patient.hasDiabetes === "yes";
  const tcMgDl = patient.totalCholesterol;
  const tcMmolL = tcMgDl != null ? mgdLToMmolL(tcMgDl) : null;
  const bmi = patient.bmi ?? 25;
  const useLab =
    patient.hasLabResults &&
    tcMmolL != null &&
    tcMmolL >= 2.6 &&
    tcMmolL <= 10.3;

  let riskChd: number;
  let riskStroke: number;
  const s0Chd = sex === "male" ? WHO_BASELINE_CHD_M : WHO_BASELINE_CHD_F;
  const s0Stroke = sex === "male" ? WHO_BASELINE_STROKE_M : WHO_BASELINE_STROKE_F;

  if (useLab && tcMmolL != null) {
    const { lpChd, lpStroke } = labLinearPredictor(
      age,
      sbp,
      tcMmolL,
      smoking,
      diabetes,
      sex
    );
    riskChd = 1 - Math.pow(s0Chd, Math.exp(lpChd));
    riskStroke = 1 - Math.pow(s0Stroke, Math.exp(lpStroke));
  } else {
    const { lpChd, lpStroke } = nonLabLinearPredictor(age, sbp, bmi, smoking, sex);
    riskChd = 1 - Math.pow(s0Chd, Math.exp(lpChd));
    riskStroke = 1 - Math.pow(s0Stroke, Math.exp(lpStroke));
  }

  const risk10 = 1 - (1 - riskChd) * (1 - riskStroke);
  const calibrated = Math.min(
    Math.max(risk10 * WHO_REGION_CALIBRATION[region], 0),
    0.99
  );
  const riskPercent = calibrated * 100;
  const level = riskLevelFromPercent(riskPercent);

  const why: string[] = [];
  if (diabetes) why.push("Diabetes present");
  if (smoking) why.push("Current smoker");
  if (sbp >= 140) why.push(`Elevated BP (${sbp} mmHg)`);
  if (useLab && tcMmolL != null && tcMmolL > 5) why.push("Elevated total cholesterol");
  if (age >= 60) why.push("Age ≥60");

  return {
    id: "who_cvd_10yr",
    title: "10-Year WHO CVD Risk",
    level,
    score: Math.min(riskPercent / 30, 0.9),
    value: {
      riskPercent: Math.round(riskPercent * 10) / 10,
      age,
      sex,
      model: useLab ? "lab" : "non_lab",
      region,
      note: "WHO CVD risk charts (21 regions), lab and non-lab models",
    },
    why,
    actions:
      level === "High"
        ? [
            "Lifestyle and pharmacological intervention per WHO guidance",
            "BP and lipid management",
            "Regular monitoring",
          ]
        : level === "Intermediate"
          ? ["Lifestyle modifications", "Consider BP/lipid targets", "Reassess in 5-10 years"]
          : undefined,
  };
}
