import type { FormData, ValidationErrors } from "@/app/types/assessment";

export function validateStep(step: number, data: FormData): ValidationErrors {
  const errors: ValidationErrors = {};

  switch (step) {
    case 1: // Demographics
      // Age: required, 20-79 (ASCVD validated 40-79)
      if (!data.age || data.age.trim() === "") {
        errors.age = "Age is required";
      } else {
        const age = parseInt(data.age, 10);
        if (isNaN(age) || age < 20 || age > 79) {
          errors.age = "Age must be between 20 and 79 years";
        }
      }

      // Sex: required selection
      if (!data.sexAtBirth || data.sexAtBirth === "") {
        errors.sexAtBirth = "Sex assigned at birth is required";
      }
      break;

    case 2: // Vital Signs
      // Systolic BP: required, 50-300 mmHg (wider range, red flags detected in backend)
      if (!data.systolicBp || data.systolicBp.trim() === "") {
        errors.systolicBp = "Systolic blood pressure is required";
      } else {
        const sbp = parseInt(data.systolicBp, 10);
        if (isNaN(sbp) || sbp < 50 || sbp > 300) {
          errors.systolicBp = "Systolic BP must be between 50 and 300 mmHg";
        }
      }

      // Diastolic BP: optional but validate if provided
      if (data.diastolicBp && data.diastolicBp.trim() !== "") {
        const dbp = parseInt(data.diastolicBp, 10);
        if (isNaN(dbp) || dbp < 30 || dbp > 200) {
          errors.diastolicBp = "Diastolic BP must be between 30 and 200 mmHg";
        }
      }

      // On BP Medication: required
      if (!data.onBpMeds || data.onBpMeds === "") {
        errors.onBpMeds = "Please indicate if you are taking BP medication";
      }
      break;

    case 3: // Lipids
      // Only validate if lab results are available
      if (data.hasLabResults) {
        const unit = data.cholesterolUnit || "mgdL";
        const isMmolL = unit === "mmolL";
        
        // Total Cholesterol: required
        if (!data.totalCholesterol || data.totalCholesterol.trim() === "") {
          errors.totalCholesterol = "Total cholesterol is required";
        } else {
          const totalChol = parseFloat(data.totalCholesterol);
          if (isNaN(totalChol)) {
            errors.totalCholesterol = "Total cholesterol must be a valid number";
          } else {
            if (isMmolL) {
              // mmol/L range: 2.6-10.3
              if (totalChol < 2.6 || totalChol > 10.3) {
                errors.totalCholesterol =
                  "Total cholesterol must be between 2.6 and 10.3 mmol/L";
              }
            } else {
              // mg/dL range: 100-400
              if (totalChol < 100 || totalChol > 400) {
                errors.totalCholesterol =
                  "Total cholesterol must be between 100 and 400 mg/dL";
              }
            }
          }
        }

        // HDL Cholesterol: required
        if (!data.hdlCholesterol || data.hdlCholesterol.trim() === "") {
          errors.hdlCholesterol = "HDL cholesterol is required";
        } else {
          const hdlChol = parseFloat(data.hdlCholesterol);
          if (isNaN(hdlChol)) {
            errors.hdlCholesterol = "HDL cholesterol must be a valid number";
          } else {
            if (isMmolL) {
              // mmol/L range: 0.26-2.6
              if (hdlChol < 0.26 || hdlChol > 2.6) {
                errors.hdlCholesterol =
                  "HDL cholesterol must be between 0.26 and 2.6 mmol/L";
              }
            } else {
              // mg/dL range: 10-100
              if (hdlChol < 10 || hdlChol > 100) {
                errors.hdlCholesterol =
                  "HDL cholesterol must be between 10 and 100 mg/dL";
              }
            }
          }
        }
      }
      break;

    case 4: // Metabolic
      // Diabetes: required
      if (!data.hasDiabetes || data.hasDiabetes === "") {
        errors.hasDiabetes = "Please indicate if you have diabetes";
      }
      break;

    case 5: // Smoking
      // Smoking Status: required, need to check if current smoker
      if (!data.smokingStatus || data.smokingStatus === "") {
        errors.smokingStatus = "Smoking status is required";
      }
      break;
  }

  return errors;
}

export function isStepValid(step: number, data: FormData): boolean {
  const errors = validateStep(step, data);
  return Object.keys(errors).length === 0;
}
