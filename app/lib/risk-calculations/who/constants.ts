/**
 * WHO CVD: region calibration and baseline survivals.
 * Centering: age 60, SBP 120 mmHg, TC 6 mmol/L, BMI 25.
 */

import type { WhoRegion } from "./types";

export const WHO_REGION_CALIBRATION: Record<WhoRegion, number> = {
  andean_latin_america: 0.7,
  australasia: 0.9,
  caribbean: 1.0,
  central_asia: 1.35,
  central_europe: 1.1,
  central_latin_america: 0.85,
  east_asia: 0.75,
  eastern_europe: 1.2,
  north_africa_middle_east: 1.15,
  north_america_high_income: 1.0,
  oceania: 1.05,
  south_asia: 1.1,
  southeast_asia: 0.9,
  southern_latin_america: 0.85,
  subsaharan_africa_central: 0.8,
  subsaharan_africa_east: 0.75,
  subsaharan_africa_southern: 0.9,
  subsaharan_africa_west: 0.8,
  tropical_latin_america: 0.85,
  western_europe: 0.95,
  high_income_asia_pacific: 0.85,
};

export const WHO_BASELINE_CHD_M = 0.954;
export const WHO_BASELINE_CHD_F = 0.989;
export const WHO_BASELINE_STROKE_M = 0.985;
export const WHO_BASELINE_STROKE_F = 0.989;
