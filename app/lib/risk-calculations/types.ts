/**
 * Shared types for cardiovascular risk calculation models.
 * All risk calculators produce RiskCandidate; evaluation consumes NormalizedPatient.
 */

export type RiskLevel =
  | "Low"
  | "Borderline"
  | "Intermediate"
  | "High"
  | "Critical";

export interface RiskCandidate {
  id: string;
  title: string;
  level: RiskLevel;
  score: number;
  /** Model-specific payload (e.g. riskPercent, age, sex, region, note) */
  value?: Record<string, unknown>;
  why: string[];
  warnings?: string[];
  actions?: string[];
}

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}
