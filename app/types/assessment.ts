export type SexAtBirth = "male" | "female" | "";
export type RaceEthnicity =
  | "white"
  | "black"
  | "hispanic"
  | "asian"
  | "other"
  | "prefer_not_to_say"
  | "";
export type YesNo = "yes" | "no" | "";
export type SmokingStatus = "never" | "former" | "current" | "";
export type FamilyHistory = "yes" | "no" | "not_sure" | "";
export type ActivityLevel = "<1" | "1-3" | "4plus" | "";
export type AlcoholIntake = "none" | "moderate" | "heavy" | "";

export type FormData = {
  // Section 1 — Demographics
  age: string;
  sexAtBirth: SexAtBirth;
  raceEthnicity: RaceEthnicity;

  // Section 2 — Vital Signs
  systolicBp: string;
  diastolicBp: string;
  onBpMeds: YesNo;

  // Section 3 — Lipids
  hasLabResults: boolean;
  cholesterolUnit: "mgdL" | "mmolL"; // Unit preference
  totalCholesterol: string;
  hdlCholesterol: string;
  ldlCholesterol: string;
  triglycerides: string;

  // Section 4 — Metabolic
  hasDiabetes: YesNo;
  glucoseOrA1c: string;

  // Section 5 — Smoking
  smokingStatus: SmokingStatus;

  // Section 6 — Body Composition
  heightCm: string;
  weightKg: string;
  bmi: number | null;

  // Section 7 — Family History
  familyHistoryPrematureCvd: FamilyHistory;

  // Section 8 — Lifestyle
  physicalActivity: ActivityLevel;
  alcoholIntake: AlcoholIntake;
};

export type ValidationErrors = {
  [key: string]: string;
};

export type SectionProps = {
  data: FormData;
  onChange: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  errors?: ValidationErrors;
};
