/**
 * Service for normalizing and transforming patient data
 */

import { DataNormalizationError } from "../errors/api-errors";
import { mmolLToMgdL } from "../unit-conversion";
import type { NormalizedPatient } from "../validation";
import type { FormData } from "@/app/types/assessment";

export class PatientNormalizationService {
  /**
   * Normalize cholesterol values to mg/dL
   */
  private normalizeCholesterol(
    value: string | undefined,
    unit: "mgdL" | "mmolL"
  ): number | undefined {
    if (!value || value.trim() === "") return undefined;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return undefined;
    // Convert to mg/dL if needed
    return unit === "mmolL" ? mmolLToMgdL(numValue) : Math.round(numValue);
  }

  /**
   * Calculate BMI from height and weight
   */
  private calculateBMI(heightCm?: number, weightKg?: number): number | null {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
      return null;
    }
    const heightM = heightCm / 100;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
  }

  /**
   * Parse and validate numeric values
   */
  private parseNumber(
    value: string | undefined,
    fieldName: string
  ): number | undefined {
    if (!value || value.trim() === "") return undefined;
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      throw new DataNormalizationError(
        `Invalid numeric value for ${fieldName}`,
        fieldName
      );
    }
    return parsed;
  }

  /**
   * Normalize patient data from form input to internal format
   */
  normalize(data: FormData): NormalizedPatient {
    try {
      const age = parseInt(data.age, 10);
      if (isNaN(age)) {
        throw new DataNormalizationError("Age must be a valid number", "age");
      }

      const systolicBp = parseInt(data.systolicBp, 10);
      if (isNaN(systolicBp)) {
        throw new DataNormalizationError(
          "Systolic BP must be a valid number",
          "systolicBp"
        );
      }

      const cholesterolUnit = data.cholesterolUnit || "mgdL";

      const normalized: NormalizedPatient = {
        age,
        sexAtBirth: data.sexAtBirth as "male" | "female",
        raceEthnicity: data.raceEthnicity || undefined,
        systolicBp,
        diastolicBp: data.diastolicBp
          ? parseInt(data.diastolicBp, 10)
          : undefined,
        onBpMeds: data.onBpMeds as "yes" | "no",
        hasLabResults: data.hasLabResults === true,
        totalCholesterol: this.normalizeCholesterol(
          data.totalCholesterol,
          cholesterolUnit
        ),
        hdlCholesterol: this.normalizeCholesterol(
          data.hdlCholesterol,
          cholesterolUnit
        ),
        ldlCholesterol: this.normalizeCholesterol(
          data.ldlCholesterol,
          cholesterolUnit
        ),
        triglycerides: this.normalizeCholesterol(
          data.triglycerides,
          cholesterolUnit
        ),
        hasDiabetes: data.hasDiabetes as "yes" | "no",
        glucoseOrA1c: data.glucoseOrA1c || undefined,
        smokingStatus: data.smokingStatus as "never" | "former" | "current",
        heightCm: this.parseNumber(data.heightCm, "heightCm"),
        weightKg: this.parseNumber(data.weightKg, "weightKg"),
        bmi: data.bmi || this.calculateBMI(
          this.parseNumber(data.heightCm, "heightCm"),
          this.parseNumber(data.weightKg, "weightKg")
        ),
        familyHistoryPrematureCvd: data.familyHistoryPrematureCvd || undefined,
        physicalActivity: data.physicalActivity || undefined,
        alcoholIntake: data.alcoholIntake || undefined,
      };

      return normalized;
    } catch (error) {
      if (error instanceof DataNormalizationError) {
        throw error;
      }
      throw new DataNormalizationError(
        `Failed to normalize patient data: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}

export const patientNormalizationService = new PatientNormalizationService();
