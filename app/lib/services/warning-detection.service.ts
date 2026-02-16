/**
 * Service for detecting clinical warnings and red flags
 */

import type { NormalizedPatient } from "../validation";

export interface ClinicalWarning {
  severity: "info" | "warning" | "critical";
  message: string;
  category: string;
}

export class WarningDetectionService {
  /**
   * Detect all clinical warnings for a patient
   */
  detectWarnings(patient: NormalizedPatient): ClinicalWarning[] {
    const warnings: ClinicalWarning[] = [];

    // Age warnings
    if (patient.age < 20) {
      warnings.push({
        severity: "warning",
        message: "Age is below validated range (20-79). ASCVD equations are not validated for this age.",
        category: "age",
      });
    } else if (patient.age >= 75) {
      warnings.push({
        severity: "info",
        message: "Age exceeds validated range (20-79). Results may be less reliable.",
        category: "age",
      });
    }

    // Blood pressure warnings
    if (patient.systolicBp < 90) {
      warnings.push({
        severity: "critical",
        message: `Systolic BP of ${patient.systolicBp} mmHg is very low (<90 mmHg). Please verify measurement accuracy.`,
        category: "blood_pressure",
      });
      if (patient.onBpMeds === "yes") {
        warnings.push({
          severity: "critical",
          message: "Possible data entry error: Low BP with BP medications marked 'yes'. Please re-check measurements.",
          category: "blood_pressure",
        });
      }
    } else if (patient.systolicBp < 70) {
      warnings.push({
        severity: "critical",
        message: `Systolic BP of ${patient.systolicBp} mmHg is extremely low. Please verify measurement accuracy.`,
        category: "blood_pressure",
      });
    }

    if (patient.systolicBp > 180) {
      warnings.push({
        severity: "critical",
        message: `Systolic BP of ${patient.systolicBp} mmHg is very high (>180 mmHg). Consider immediate medical evaluation.`,
        category: "blood_pressure",
      });
    }

    if (patient.diastolicBp && patient.diastolicBp > 120) {
      warnings.push({
        severity: "critical",
        message: `Diastolic BP of ${patient.diastolicBp} mmHg is very high (>120 mmHg). Consider immediate medical evaluation.`,
        category: "blood_pressure",
      });
    }

    // BMI warnings
    if (patient.bmi) {
      if (patient.bmi > 40) {
        warnings.push({
          severity: "critical",
          message: "BMI >40 indicates severe obesity (Class III), a major cardiometabolic risk factor requiring immediate attention.",
          category: "body_composition",
        });
      } else if (patient.bmi > 35) {
        warnings.push({
          severity: "warning",
          message: "BMI ≥35 indicates severe obesity, a major cardiometabolic risk factor.",
          category: "body_composition",
        });
      }
    }

    // Lab results warnings
    if (patient.hasLabResults) {
      if (patient.totalCholesterol && patient.totalCholesterol > 240) {
        warnings.push({
          severity: "warning",
          message: `Total cholesterol of ${patient.totalCholesterol} mg/dL is elevated—this increases cardiovascular risk.`,
          category: "lipids",
        });
      }

      if (patient.hdlCholesterol && patient.hdlCholesterol < 40) {
        warnings.push({
          severity: "warning",
          message: `HDL cholesterol of ${patient.hdlCholesterol} mg/dL is low—aim for ≥40 mg/dL (men) or ≥50 mg/dL (women) to reduce risk.`,
          category: "lipids",
        });
      }
    }

    return warnings;
  }

  /**
   * Get critical warnings only
   */
  getCriticalWarnings(patient: NormalizedPatient): ClinicalWarning[] {
    return this.detectWarnings(patient).filter(
      (w) => w.severity === "critical"
    );
  }
}

export const warningDetectionService = new WarningDetectionService();
