import type { FormData } from "@/app/types/assessment";

/**
 * Human-friendly validation messages with contextual guidance
 */
export function getHumanValidationMessage(
  field: string,
  value: string,
  data: FormData
): string | null {
  if (!value || value.trim() === "") return null;

  switch (field) {
    case "systolicBp": {
      const sbp = parseInt(value, 10);
      if (isNaN(sbp)) return null;
      
      if (sbp < 90) {
        return `${sbp} mmHg is unusually low—double-check this measurement. If you're on BP medication, this may indicate over-treatment.`;
      }
      if (sbp < 70) {
        return `${sbp} mmHg is extremely low—please verify this is correct.`;
      }
      if (sbp > 180) {
        return `${sbp} mmHg is very high—consider immediate medical evaluation.`;
      }
      if (sbp > 160 && data.onBpMeds === "yes") {
        return `${sbp} mmHg is elevated despite medication—your doctor may need to adjust your treatment.`;
      }
      return null;
    }

    case "diastolicBp": {
      const dbp = parseInt(value, 10);
      if (isNaN(dbp)) return null;
      
      if (dbp > 120) {
        return `${dbp} mmHg is very high—consider immediate medical evaluation.`;
      }
      if (dbp < 50) {
        return `${dbp} mmHg is unusually low—double-check this measurement.`;
      }
      return null;
    }

    case "age": {
      const age = parseInt(value, 10);
      if (isNaN(age)) return null;
      
      if (age < 40) {
        return "Note: 10-year ASCVD risk equations are validated for ages 40-79. For younger patients, we'll show risk factor summaries instead.";
      }
      if (age >= 75) {
        return "Note: Risk calculations may be less reliable for ages 75+. Consider clinical judgment.";
      }
      return null;
    }

    case "totalCholesterol": {
      if (!data.hasLabResults) return null;
      const unit = data.cholesterolUnit || "mgdL";
      const chol = parseFloat(value);
      if (isNaN(chol)) return null;
      
      if (unit === "mgdL") {
        if (chol > 240) {
          return `${chol} mg/dL is elevated—this increases cardiovascular risk.`;
        }
        if (chol < 120) {
          return `${chol} mg/dL is unusually low—double-check this value.`;
        }
      } else {
        if (chol > 6.2) {
          return `${chol} mmol/L is elevated—this increases cardiovascular risk.`;
        }
        if (chol < 3.1) {
          return `${chol} mmol/L is unusually low—double-check this value.`;
        }
      }
      return null;
    }

    case "hdlCholesterol": {
      if (!data.hasLabResults) return null;
      const unit = data.cholesterolUnit || "mgdL";
      const hdl = parseFloat(value);
      if (isNaN(hdl)) return null;
      
      if (unit === "mgdL") {
        if (hdl < 40) {
          return `${hdl} mg/dL is low—aim for ≥40 mg/dL (men) or ≥50 mg/dL (women) to reduce risk.`;
        }
      } else {
        if (hdl < 1.0) {
          return `${hdl} mmol/L is low—aim for ≥1.0 mmol/L (men) or ≥1.3 mmol/L (women) to reduce risk.`;
        }
      }
      return null;
    }

    case "weightKg": {
      const weight = parseFloat(value);
      const height = parseFloat(data.heightCm || "");
      if (isNaN(weight) || isNaN(height) || height === 0) return null;
      
      const heightM = height / 100;
      const bmi = weight / (heightM * heightM);
      
      if (bmi > 40) {
        return `BMI ${bmi.toFixed(1)} indicates severe obesity (Class III)—this significantly increases cardiovascular risk.`;
      }
      if (bmi > 35) {
        return `BMI ${bmi.toFixed(1)} indicates severe obesity—weight management is important for reducing risk.`;
      }
      if (bmi > 30) {
        return `BMI ${bmi.toFixed(1)} indicates obesity—consider weight management strategies.`;
      }
      return null;
    }

    default:
      return null;
  }
}
