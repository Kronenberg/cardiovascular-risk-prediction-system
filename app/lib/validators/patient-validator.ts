/**
 * Patient data validation schemas and validators
 */

import { ValidationError } from "../errors/api-errors";
import type { FormData } from "@/app/types/assessment";

export interface ValidationRule {
  field: string;
  validate: (value: any, data: FormData) => string | null;
  required?: boolean;
}

/**
 * Validates required fields
 */
export function validateRequiredFields(data: FormData): ValidationError[] {
  const errors: ValidationError[] = [];

  const requiredFields: Array<{ key: keyof FormData; name: string }> = [
    { key: "age", name: "Age" },
    { key: "sexAtBirth", name: "Sex assigned at birth" },
    { key: "systolicBp", name: "Systolic blood pressure" },
    { key: "onBpMeds", name: "BP medication status" },
    { key: "hasDiabetes", name: "Diabetes status" },
    { key: "smokingStatus", name: "Smoking status" },
  ];

  for (const { key, name } of requiredFields) {
    const value = data[key];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      errors.push(new ValidationError(`${name} is required`, key as string));
    }
  }

  // Conditional required fields
  if (data.hasLabResults) {
    if (!data.totalCholesterol || data.totalCholesterol.trim() === "") {
      errors.push(
        new ValidationError(
          "Total cholesterol is required when lab results are available",
          "totalCholesterol"
        )
      );
    }
    if (!data.hdlCholesterol || data.hdlCholesterol.trim() === "") {
      errors.push(
        new ValidationError(
          "HDL cholesterol is required when lab results are available",
          "hdlCholesterol"
        )
      );
    }
  }

  return errors;
}

/**
 * Validates numeric ranges
 */
export function validateNumericRanges(data: FormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Age validation
  if (data.age) {
    const age = parseInt(data.age, 10);
    if (isNaN(age) || age < 20 || age > 79) {
      errors.push(
        new ValidationError(
          "Age must be between 20 and 79 years",
          "age"
        )
      );
    }
  }

  // SBP validation
  if (data.systolicBp) {
    const sbp = parseInt(data.systolicBp, 10);
    if (isNaN(sbp) || sbp < 50 || sbp > 300) {
      errors.push(
        new ValidationError(
          "Systolic BP must be between 50 and 300 mmHg",
          "systolicBp"
        )
      );
    }
  }

  // DBP validation
  if (data.diastolicBp && data.diastolicBp.trim() !== "") {
    const dbp = parseInt(data.diastolicBp, 10);
    if (isNaN(dbp) || dbp < 30 || dbp > 200) {
      errors.push(
        new ValidationError(
          "Diastolic BP must be between 30 and 200 mmHg",
          "diastolicBp"
        )
      );
    }
  }

  // Cholesterol validation
  if (data.hasLabResults) {
    const unit = data.cholesterolUnit || "mgdL";
    const isMmolL = unit === "mmolL";

    if (data.totalCholesterol) {
      const chol = parseFloat(data.totalCholesterol);
      if (!isNaN(chol)) {
        if (isMmolL && (chol < 2.6 || chol > 10.3)) {
          errors.push(
            new ValidationError(
              "Total cholesterol must be between 2.6 and 10.3 mmol/L",
              "totalCholesterol"
            )
          );
        } else if (!isMmolL && (chol < 100 || chol > 400)) {
          errors.push(
            new ValidationError(
              "Total cholesterol must be between 100 and 400 mg/dL",
              "totalCholesterol"
            )
          );
        }
      }
    }

    if (data.hdlCholesterol) {
      const hdl = parseFloat(data.hdlCholesterol);
      if (!isNaN(hdl)) {
        if (isMmolL && (hdl < 0.26 || hdl > 2.6)) {
          errors.push(
            new ValidationError(
              "HDL cholesterol must be between 0.26 and 2.6 mmol/L",
              "hdlCholesterol"
            )
          );
        } else if (!isMmolL && (hdl < 10 || hdl > 100)) {
          errors.push(
            new ValidationError(
              "HDL cholesterol must be between 10 and 100 mg/dL",
              "hdlCholesterol"
            )
          );
        }
      }
    }
  }

  return errors;
}

/**
 * Comprehensive validation of patient data
 */
export function validatePatientData(data: FormData): {
  errors: ValidationError[];
  isValid: boolean;
} {
  const errors = [
    ...validateRequiredFields(data),
    ...validateNumericRanges(data),
  ];

  return {
    errors,
    isValid: errors.length === 0,
  };
}
