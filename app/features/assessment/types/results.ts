/**
 * Shared types for Assessment Results feature.
 * Used by both container and presentational components.
 */

export type RiskResult = {
  id: string;
  title: string;
  level: "Low" | "Borderline" | "Intermediate" | "High" | "Critical";
  score: number;
  value?: Record<string, unknown>;
  why: string[];
  warnings?: string[];
  actions?: string[];
};

export type ResultsData = {
  top3: RiskResult[];
  allRisks?: RiskResult[];
  errors: string[];
  warnings: string[];
};
