/**
 * Risk evaluation orchestrator: runs all calculators and ranks top N.
 * Single entry point for "evaluate all risks" and "top 3".
 */

import type { NormalizedPatient } from "../validation";
import type { RiskCandidate } from "./types";
import { calculateBpRisk } from "./models/bp-risk";
import { calculateDiabetesRisk } from "./models/diabetes-risk";
import { calculateObesityRisk } from "./models/obesity-risk";
import { calculateRelativeRisk } from "./models/relative-risk";
import { calculateAscvdRisk } from "./ascvd";
import { calculateFraminghamRisk } from "./framingham";
import { calculateWhoCvdRisk } from "./who";

export function evaluateRisks(patient: NormalizedPatient): RiskCandidate[] {
  const candidates: RiskCandidate[] = [];

  candidates.push(calculateBpRisk(patient));
  candidates.push(calculateDiabetesRisk(patient));

  const ascvdRisk = calculateAscvdRisk(patient);
  if (ascvdRisk) {
    candidates.push(ascvdRisk);
  } else if (patient.age < 40) {
    candidates.push(calculateRelativeRisk(patient));
  }

  const framinghamRisk = calculateFraminghamRisk(patient);
  if (framinghamRisk) candidates.push(framinghamRisk);

  const whoRisk = calculateWhoCvdRisk(patient);
  if (whoRisk) candidates.push(whoRisk);

  const obesityRisk = calculateObesityRisk(patient);
  if (obesityRisk) candidates.push(obesityRisk);

  return candidates;
}

export function rankTop3(candidates: RiskCandidate[]): RiskCandidate[] {
  return [...candidates].sort((a, b) => b.score - a.score).slice(0, 3);
}
