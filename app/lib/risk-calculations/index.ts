/**
 * Cardiovascular risk calculations – public API.
 *
 * Structure:
 * - types.ts         Shared types (RiskCandidate, ValidationResult)
 * - models/          BP, diabetes, obesity, relative-risk (non–10-year)
 * - ascvd/           Pooled Cohort Equations (2013 ACC/AHA)
 * - framingham/      10-year CHD (D'Agostino 2008)
 * - who/             10-year CVD, lab/non-lab, 21 regions
 * - evaluate.ts      evaluateRisks(), rankTop3()
 * - legacy.ts        normalizeAndValidate() [deprecated]
 */

export type { RiskCandidate, ValidationResult, RiskLevel } from "./types";
export { evaluateRisks, rankTop3 } from "./evaluate";
export { normalizeAndValidate } from "./legacy";
export type { WhoRegion } from "./who";
