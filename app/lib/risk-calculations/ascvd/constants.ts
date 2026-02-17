/**
 * Pooled Cohort Equations (2013 ACC/AHA) coefficients.
 * Formula: 1 - S₁₀^exp(ΣβᵢXᵢ - B̄). Race/sex-specific.
 * Source: 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk.
 */

export type PceGroup = "white_male" | "white_female" | "black_male" | "black_female";

export interface PceCoefficients {
  lnAge: number;
  lnAgeSq: number;
  lnTc: number;
  lnAgeLnTc: number;
  lnHdl: number;
  lnAgeLnHdl: number;
  lnSbpNoTx: number;
  lnSbpTx: number;
  lnAgeLnSbpNoTx?: number;
  lnAgeLnSbpTx?: number;
  smoke: number;
  diabetes: number;
  meanLinearPredictor: number;
  baselineSurvival10: number;
}

export const PCE_COEFFICIENTS: Record<PceGroup, PceCoefficients> = {
  white_male: {
    lnAge: 12.344,
    lnAgeSq: 0,
    lnTc: 11.853,
    lnAgeLnTc: -2.664,
    lnHdl: -7.990,
    lnAgeLnHdl: 1.769,
    lnSbpNoTx: 1.797,
    lnSbpTx: 1.764,
    smoke: 0.659,
    diabetes: 0.573,
    meanLinearPredictor: 61.18,
    baselineSurvival10: 0.9144,
  },
  white_female: {
    lnAge: -29.799,
    lnAgeSq: 4.884,
    lnTc: 13.540,
    lnAgeLnTc: -3.114,
    lnHdl: -13.578,
    lnAgeLnHdl: 2.019,
    lnSbpNoTx: 2.020,
    lnSbpTx: 1.981,
    smoke: 0.654,
    diabetes: 0.575,
    meanLinearPredictor: 70.35,
    baselineSurvival10: 0.9665,
  },
  black_male: {
    lnAge: 2.469,
    lnAgeSq: 0,
    lnTc: 0.302,
    lnAgeLnTc: 0,
    lnHdl: -0.307,
    lnAgeLnHdl: 0,
    lnSbpNoTx: 1.916,
    lnSbpTx: 1.809,
    smoke: 0.549,
    diabetes: 0.645,
    meanLinearPredictor: 19.54,
    baselineSurvival10: 0.8954,
  },
  black_female: {
    lnAge: 17.114,
    lnAgeSq: 0,
    lnTc: 0.940,
    lnAgeLnTc: 0,
    lnHdl: -18.920,
    lnAgeLnHdl: 4.475,
    lnSbpNoTx: 29.291,
    lnSbpTx: 27.820,
    lnAgeLnSbpNoTx: -4.475,
    lnAgeLnSbpTx: -4.256,
    smoke: 0.691,
    diabetes: 0.874,
    meanLinearPredictor: 86.61,
    baselineSurvival10: 0.9533,
  },
};
