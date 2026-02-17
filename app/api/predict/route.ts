import { NextRequest } from "next/server";
import { createApiHandler, validateRequestBody } from "@/app/lib/middleware/api-handler";
import { validatePatientData } from "@/app/lib/validators/patient-validator";
import { patientNormalizationService } from "@/app/lib/services/patient-normalization.service";
import { riskAssessmentService } from "@/app/lib/services/risk-assessment.service";
import { warningDetectionService } from "@/app/lib/services/warning-detection.service";
import type { FormData } from "@/app/types/assessment";
import type { RiskCandidate } from "@/app/lib/risk-calculations";

export interface PredictionResponse {
  top3: RiskCandidate[];
  allRisks: RiskCandidate[];
  errors: string[];
  warnings: string[];
}

/**
 * POST /api/predict
 * 
 * Predicts cardiovascular risk based on patient data
 * 
 * Request body: FormData (patient assessment form data)
 * Response: PredictionResponse (top 3 risks, errors, warnings)
 */
async function handlePrediction(request: NextRequest): Promise<PredictionResponse> {
  // Step 1: Parse and validate request body
  const body = await request.json();
  validateRequestBody(body);

  const formData = body as FormData;

  // Step 2: Validate patient data
  const validation = validatePatientData(formData);
  if (!validation.isValid) {
    return {
      top3: [],
      allRisks: [],
      errors: validation.errors.map((e) => e.message),
      warnings: [],
    };
  }

  // Step 3: Normalize patient data
  const patient = patientNormalizationService.normalize(formData);

  // Step 4: Detect clinical warnings
  const clinicalWarnings = warningDetectionService.detectWarnings(patient);
  const warningMessages = clinicalWarnings.map((w) => w.message);

  // Step 5: Perform risk assessment
  const assessment = riskAssessmentService.assess(patient);

  // Step 6: Combine warnings from risk assessment and clinical detection
  const allWarnings = [...assessment.warnings, ...warningMessages];

  // Step 7: Return structured response
  return {
    top3: assessment.top3,
    allRisks: assessment.allRisks,
    errors: [],
    warnings: allWarnings,
  };
}

// Export handler with error handling wrapper
export const POST = createApiHandler(handlePrediction);
