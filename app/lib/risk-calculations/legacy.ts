/**
 * @deprecated Use PatientNormalizationService and WarningDetectionService instead.
 * Kept for backward compatibility; will be removed in a future version.
 */

import type { NormalizedPatient } from "../validation";
import type { ValidationResult } from "./types";

export function normalizeAndValidate(data: unknown): {
  patient: NormalizedPatient | null;
  validation: ValidationResult;
} {
  const { patientNormalizationService } = require("../services/patient-normalization.service");
  const { warningDetectionService } = require("../services/warning-detection.service");
  const { validatePatientData } = require("../validators/patient-validator");

  const validation = validatePatientData(data);
  if (!validation.isValid) {
    return {
      patient: null,
      validation: {
        errors: validation.errors.map((e: { message: string }) => e.message),
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
        warnings: warnings.map((w: { message: string }) => w.message),
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
