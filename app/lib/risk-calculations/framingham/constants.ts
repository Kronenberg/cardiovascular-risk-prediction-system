/**
 * Framingham 10-year CHD risk (Cox model).
 * Formula: 1 - S₀^exp(ΣβX - B̄).
 * D'Agostino et al. Circulation 2008.
 */

export const FRAMINGHAM_BASELINE_MEN = 0.88936;
export const FRAMINGHAM_BASELINE_WOMEN = 0.95012;
export const FRAMINGHAM_MEAN_MEN = 23.9802;
export const FRAMINGHAM_MEAN_WOMEN = 26.1931;

/** Male coefficients: ln(age), ln(TC), ln(HDL), ln(SBP) treated/untreated, smoke, diabetes */
export const FRAMINGHAM_BETA_MEN = {
  lnAge: 3.06117,
  lnTc: 1.1237,
  lnHdl: -0.93263,
  lnSbpNoTx: 1.93303,
  lnSbpTx: 1.99881,
  smoke: 0.65451,
  diabetes: 0.57367,
} as const;

/** Female coefficients */
export const FRAMINGHAM_BETA_WOMEN = {
  lnAge: 2.32888,
  lnTc: 1.20904,
  lnHdl: -0.70833,
  lnSbpNoTx: 2.76157,
  lnSbpTx: 2.82263,
  smoke: 0.52873,
  diabetes: 0.69154,
} as const;
