// Type definitions for normalized patient data
export type NormalizedPatient = {
  age: number;
  sexAtBirth: "male" | "female";
  raceEthnicity?: "white" | "black" | "hispanic" | "asian" | "other" | "prefer_not_to_say";
  systolicBp: number;
  diastolicBp?: number;
  onBpMeds: "yes" | "no";
  hasLabResults: boolean;
  totalCholesterol?: number;
  hdlCholesterol?: number;
  ldlCholesterol?: number;
  triglycerides?: number;
  hasDiabetes: "yes" | "no";
  glucoseOrA1c?: string;
  smokingStatus: "never" | "former" | "current";
  heightCm?: number;
  weightKg?: number;
  bmi?: number | null;
  familyHistoryPrematureCvd?: "yes" | "no" | "not_sure";
  physicalActivity?: "<1" | "1-3" | "4plus";
  alcoholIntake?: "none" | "moderate" | "heavy";
};
