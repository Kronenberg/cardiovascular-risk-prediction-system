/**
 * Service for risk assessment calculations
 */

import {
  evaluateRisks,
  rankTop3,
  type RiskCandidate,
} from "../risk-calculations";
import { RiskCalculationError } from "../errors/api-errors";
import type { NormalizedPatient } from "../validation";

export interface RiskAssessmentResult {
  top3: RiskCandidate[];
  allRisks: RiskCandidate[];
  warnings: string[];
}

export class RiskAssessmentService {
  /**
   * Perform comprehensive risk assessment
   */
  assess(patient: NormalizedPatient): RiskAssessmentResult {
    try {
      // Evaluate all risks
      const allRisks = evaluateRisks(patient);

      if (allRisks.length === 0) {
        throw new RiskCalculationError(
          "No risk factors could be calculated"
        );
      }

      // Rank and get top 3
      const top3 = rankTop3(allRisks);

      // Extract warnings from risk candidates
      const warnings = allRisks
        .flatMap((risk) => risk.warnings || [])
        .filter((w): w is string => typeof w === "string");

      return {
        top3,
        allRisks,
        warnings,
      };
    } catch (error) {
      if (error instanceof RiskCalculationError) {
        throw error;
      }
      throw new RiskCalculationError(
        `Risk assessment failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get risk assessment for specific risk type
   */
  getRiskById(patient: NormalizedPatient, riskId: string): RiskCandidate | null {
    const allRisks = evaluateRisks(patient);
    return allRisks.find((risk) => risk.id === riskId) || null;
  }
}

export const riskAssessmentService = new RiskAssessmentService();
