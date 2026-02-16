export const TOTAL_STEPS = 8;

export const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:border-sky-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200";

export const STEP_LABELS = [
  "Demographics",
  "Vitals",
  "Lipids",
  "Metabolic",
  "Smoking",
  "Body",
  "Family",
  "Lifestyle",
];

import type { FormData } from "@/app/types/assessment";

export const initialFormState: FormData = {
  age: "",
  sexAtBirth: "",
  raceEthnicity: "",
  systolicBp: "",
  diastolicBp: "",
  onBpMeds: "",
  hasLabResults: true,
  cholesterolUnit: "mgdL", // Default to mg/dL
  totalCholesterol: "",
  hdlCholesterol: "",
  ldlCholesterol: "",
  triglycerides: "",
  hasDiabetes: "",
  glucoseOrA1c: "",
  smokingStatus: "",
  heightCm: "",
  weightKg: "",
  bmi: null,
  familyHistoryPrematureCvd: "",
  physicalActivity: "",
  alcoholIntake: "",
};
