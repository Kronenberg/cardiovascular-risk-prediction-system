"use client";

/**
 * Presentational component for Assessment Results.
 * Pure UI rendering; receives props from container.
 */

import { ResultsLayout } from "@/app/components/layouts/ResultsLayout";
import { Slider } from "@/app/components/ui/Slider";
import { Toggle } from "@/app/components/ui/Toggle";
import { PrintButton } from "@/app/components/ui/PrintButton";
import {
  IconHeart,
  IconActivity,
  IconDroplet,
  IconScale,
  IconShieldCheck,
  IconAlertTriangle,
  IconAlertCircle,
  IconXCircle,
  IconClipboardList,
  IconTrendingDown,
  IconInfo,
  IconFileText,
  IconCigarette,
} from "@/app/components/ui/MedicalIcons";
import type { FormData } from "@/app/types/assessment";
import type { RiskResult, ResultsData } from "../types";

export interface AssessmentResultsViewProps {
  results: ResultsData;
  onReset: () => void;
  hasWhatIfData: boolean;
  isRecomputing: boolean;
  whatIfBmi?: number | null;
  currentSbp: string;
  currentWeight: string;
  currentHeight: string;
  currentSmoking: "never" | "former" | "current";
  onWhatIfChange: (key: keyof FormData, value: string | number) => void;
}

const levelConfig = {
  Low: {
    label: "Low Risk",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    Icon: IconShieldCheck,
  },
  Borderline: {
    label: "Borderline",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    Icon: IconAlertTriangle,
  },
  Intermediate: {
    label: "Intermediate Risk",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    Icon: IconAlertTriangle,
  },
  High: {
    label: "High Risk",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-600",
    Icon: IconAlertCircle,
  },
  Critical: {
    label: "Critical",
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-600",
    Icon: IconXCircle,
  },
};

const riskTypeIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  ascvd_10yr: IconHeart,
  framingham_10yr_chd: IconHeart,
  who_cvd_10yr: IconHeart,
  bp_category: IconActivity,
  diabetes: IconDroplet,
  diabetes_risk: IconDroplet,
  obesity: IconScale,
  severe_obesity: IconScale,
  relative_risk: IconHeart,
};

const riskTypeLabels: Record<string, string> = {
  diabetes: "Diabetes",
  bp_category: "Blood Pressure",
  ascvd_10yr: "ASCVD Risk",
  framingham_10yr_chd: "Framingham CHD Risk",
  who_cvd_10yr: "WHO CVD Risk",
  severe_obesity: "Obesity",
  obesity: "Obesity",
  relative_risk: "Risk Factors",
  diabetes_risk: "Diabetes Risk",
};

function whoRegionLabel(region: string | undefined): string {
  if (!region) return "";
  return region
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function AssessmentResultsView({
  results,
  onReset,
  hasWhatIfData,
  isRecomputing,
  whatIfBmi,
  currentSbp,
  currentWeight,
  currentHeight,
  currentSmoking,
  onWhatIfChange,
}: AssessmentResultsViewProps) {
  const safeResults = {
    ...results,
    top3: results.top3 || [],
    allRisks: results.allRisks ?? results.top3 ?? [],
    errors: results.errors || [],
    warnings: results.warnings || [],
  };

  const risk10YrIds = ["ascvd_10yr", "framingham_10yr_chd", "who_cvd_10yr"] as const;
  const risk10YrSummary = risk10YrIds
    .map((id) => safeResults.allRisks.find((r) => r.id === id))
    .filter((r): r is RiskResult => r != null && r.value?.riskPercent != null)
    .map((r) => ({
      id: r.id,
      label: riskTypeLabels[r.id] || r.title,
      percent: r.value.riskPercent as number,
      value: r.value,
    }));

  const has10YrSummary = risk10YrSummary.length > 0;

  return (
    <ResultsLayout
      footer={
        <footer className="flex items-center justify-center px-8 py-6 lg:px-12 lg:py-8 no-print">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-10 py-3.5 text-[length:var(--text-input)] font-semibold text-white shadow-md shadow-sky-200/50 transition hover:bg-sky-700 hover:shadow-sky-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
          >
            Start New Assessment
          </button>
        </footer>
      }
    >
      <div className="space-y-10">
        {/* Header */}
        <div className="border-b border-slate-200 pb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 ring-1 ring-sky-100">
                <IconFileText size={28} />
              </div>
              <div>
                <h1 className="text-[length:var(--text-page-title)] font-semibold text-[#1a1a1a] lg:text-[length:var(--text-page-title-lg)]">
                  Assessment Results
                </h1>
                <p className="mt-2 text-base text-slate-600 max-w-[680px] leading-relaxed">
                  Your cardiovascular risk analysis based on validated clinical models (ASCVD, Framingham, WHO)
                </p>
              </div>
            </div>
            <div className="flex gap-3 no-print shrink-0">
              <PrintButton />
            </div>
          </div>
        </div>

        {/* 10-year risk summary */}
        {has10YrSummary && (
          <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-sky-50/50 p-6 ring-1 ring-slate-100">
            <h2 className="text-[length:var(--text-section)] font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
              <IconHeart size={22} className="text-sky-600" />
              10-year risk at a glance
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {risk10YrSummary.map(({ id, label, percent, value }) => (
                <div
                  key={id}
                  className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm"
                >
                  <p className="text-[length:var(--text-helper)] text-slate-500 mb-1">{label}</p>
                  <p className="text-2xl font-bold tabular-nums text-[#1a1a1a]">{percent}%</p>
                  {(value.model || value.region) && (
                    <p className="mt-1.5 text-sm text-slate-500">
                      {value.model === "lab" && "Lab model"}
                      {value.model === "non_lab" && "Non-lab model"}
                      {value.region && ` • ${whoRegionLabel(value.region as string)}`}
                    </p>
                  )}
                  {value.raceEthnicity && value.sex && (
                    <p className="mt-1 text-sm text-slate-500 capitalize">
                      {value.raceEthnicity as string} {value.sex as string}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {safeResults.warnings && safeResults.warnings.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-5">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <IconAlertTriangle size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[length:var(--text-section)] font-semibold text-amber-900 mb-2">
                  Important Notes
                </h3>
                <ul className="space-y-2 text-base text-amber-800 leading-relaxed">
                  {safeResults.warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 mt-1.5 shrink-0">•</span>
                      <span>{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* What-If Scenarios */}
        {hasWhatIfData && (
          <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50/80 to-blue-50/80 p-8 no-print ring-1 ring-sky-100">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                <IconTrendingDown size={22} className="text-sky-600" />
              </div>
              <div>
                <h2 className="text-[length:var(--text-page-title)] font-semibold text-[#1a1a1a] lg:text-[length:var(--text-page-title-lg)]">
                  What-If Scenarios
                </h2>
                <p className="text-[length:var(--text-helper)] text-slate-500 mt-0.5">
                  Adjust factors to see how they impact your cardiovascular risk in real-time.
                </p>
              </div>
            </div>

            {isRecomputing && (
              <div className="mb-4 flex items-center gap-2 text-sm text-sky-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent"></div>
                <span>Recalculating risks...</span>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {/* Smoking Toggle */}
              <div className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                    <IconCigarette size={18} />
                  </div>
                  <label className="text-[length:var(--text-label)] font-medium text-[#1a1a1a]">
                    Smoking Status
                  </label>
                </div>
                <Toggle
                  labelOn="Current Smoker"
                  labelOff="Non-Smoker"
                  value={currentSmoking === "current"}
                  onChange={(isSmoker) =>
                    onWhatIfChange("smokingStatus", isSmoker ? "current" : "never")
                  }
                />
                <p className="mt-3 text-[length:var(--text-helper)] text-slate-500">
                  Smoking significantly increases cardiovascular risk
                </p>
              </div>

              {/* SBP Slider */}
              <div className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                    <IconActivity size={18} />
                  </div>
                  <label className="text-[length:var(--text-label)] font-medium text-[#1a1a1a]">
                    Systolic BP
                  </label>
                </div>
                <Slider
                  label=""
                  value={parseFloat(currentSbp)}
                  min={80}
                  max={200}
                  step={1}
                  onChange={(value) => onWhatIfChange("systolicBp", value.toString())}
                  unit="mmHg"
                />
              </div>

              {/* Weight Slider */}
              <div className="rounded-xl border border-sky-200 bg-white p-5 shadow-sm ring-1 ring-slate-100">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <IconScale size={18} />
                  </div>
                  <label className="text-[length:var(--text-label)] font-medium text-[#1a1a1a]">
                    Weight
                  </label>
                </div>
                <Slider
                  label=""
                  value={parseFloat(currentWeight)}
                  min={40}
                  max={150}
                  step={1}
                  onChange={(value) => onWhatIfChange("weightKg", value.toString())}
                  unit="kg"
                />
                {whatIfBmi != null && (
                  <p className="mt-2 text-[length:var(--text-helper)] text-slate-500 tabular-nums">
                    BMI: {whatIfBmi.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Risks */}
        <div>
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <IconClipboardList size={22} />
            </div>
            <div>
              <h2 className="text-[length:var(--text-page-title)] font-semibold text-[#1a1a1a] lg:text-[length:var(--text-page-title-lg)]">
                Top 3 Risk Factors
              </h2>
              <p className="text-[length:var(--text-helper)] text-slate-500 mt-0.5">
                Ranked by clinical significance
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {safeResults.top3 && safeResults.top3.length > 0 ? (
              safeResults.top3.map((risk, index) => {
                const config = levelConfig[risk.level];
                const riskLabel = riskTypeLabels[risk.id] || risk.title;
                const RiskTypeIcon = riskTypeIcons[risk.id] || IconHeart;
                const LevelIcon = config.Icon;

                return (
                  <div
                    key={risk.id}
                    className={`rounded-xl border-2 ${config.border} ${config.bg} overflow-hidden print-break-inside-avoid shadow-sm`}
                  >
                    <div className="p-6 lg:p-8">
                      {/* Header */}
                      <div className="flex items-start gap-5 mb-6">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm">
                          <RiskTypeIcon size={28} className="text-sky-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs font-bold tabular-nums">
                              {index + 1}
                            </span>
                            <h3 className="text-[length:var(--text-section)] font-semibold text-[#1a1a1a] lg:text-[length:var(--text-section-lg)]">
                              {risk.title}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[length:var(--text-label)] font-semibold ${config.badge}`}
                            >
                              <LevelIcon size={16} />
                              {config.label}
                            </span>
                          </div>
                          {risk.value && (
                            <div className="space-y-1">
                              {risk.value.riskPercent !== undefined &&
                                risk.value.validated !== false && (
                                  <p className="text-[length:var(--text-risk-number)] font-bold text-[#1a1a1a] tabular-nums lg:text-[length:var(--text-risk-number-lg)]">
                                    10-year risk: {risk.value.riskPercent}%
                                  </p>
                                )}
                              {(risk.value.systolic || risk.value.bmi) && (
                                <p className="text-base text-slate-600 tabular-nums">
                                  {risk.value.systolic && (
                                    <>SBP: {risk.value.systolic} mmHg</>
                                  )}
                                  {risk.value.systolic && risk.value.bmi && " • "}
                                  {risk.value.bmi && <>BMI: {risk.value.bmi}</>}
                                </p>
                              )}
                              {(risk.value.model ||
                                risk.value.region ||
                                (risk.value.raceEthnicity && risk.value.sex)) && (
                                <p className="text-[length:var(--text-helper)] text-slate-500">
                                  {risk.value.model === "lab" && "Lab-based model"}
                                  {risk.value.model === "non_lab" && "Non-lab model"}
                                  {risk.value.region &&
                                    ` • ${whoRegionLabel(risk.value.region as string)}`}
                                  {risk.value.raceEthnicity && risk.value.sex && (
                                    <span className="capitalize">
                                      {" "}
                                      • {risk.value.raceEthnicity as string}{" "}
                                      {risk.value.sex as string}
                                    </span>
                                  )}
                                </p>
                              )}
                              {risk.value.riskPercent === undefined &&
                                !risk.value.systolic &&
                                !risk.value.bmi &&
                                riskLabel && (
                                  <p className="text-base text-slate-600">{riskLabel}</p>
                                )}
                              {risk.value.riskPercent !== undefined &&
                                risk.value.validated === false && (
                                  <span className="text-amber-700 font-medium">
                                    10-year risk not validated for this age group
                                  </span>
                                )}
                              {risk.value.note && (
                                <p className="text-[length:var(--text-helper)] text-slate-500 italic mt-1">
                                  {risk.value.note as string}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Warnings */}
                      {risk.warnings && risk.warnings.length > 0 && (
                        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 p-5">
                          <h4 className="text-[length:var(--text-input)] font-semibold text-amber-900 mb-3 flex items-center gap-2">
                            <IconAlertTriangle size={18} className="text-amber-600 shrink-0" />
                            Important Note
                          </h4>
                          <ul className="space-y-2">
                            {risk.warnings.map((warning, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-3 text-base text-orange-800"
                              >
                                <span className="text-orange-500 mt-1.5 text-lg">•</span>
                                <span className="leading-relaxed">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Why we think this */}
                      <div className="mb-8">
                        <h4 className="text-[length:var(--text-section)] font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
                          <IconClipboardList size={20} className="text-slate-500" />
                          Why we think this
                        </h4>
                        <p className="text-[length:var(--text-helper)] text-slate-600 mb-4">
                          Top {Math.min(risk.why.length, 3)} contributing factors:
                        </p>
                        <ul className="space-y-3">
                          {risk.why.slice(0, 3).map((reason, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-base text-slate-700"
                            >
                              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed">{reason}</span>
                            </li>
                          ))}
                          {risk.why.length > 3 && (
                            <li className="text-[length:var(--text-helper)] text-slate-500 italic">
                              + {risk.why.length - 3} more factor
                              {risk.why.length - 3 > 1 ? "s" : ""}
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* What would reduce it */}
                      {risk.actions && risk.actions.length > 0 && (
                        <div className="rounded-xl border border-slate-200 bg-white p-6 ring-1 ring-slate-100">
                          <h4 className="text-[length:var(--text-section)] font-semibold text-[#1a1a1a] mb-4 flex items-center gap-2">
                            <IconTrendingDown size={20} className="text-emerald-600" />
                            What would reduce it
                          </h4>
                          <p className="text-[length:var(--text-helper)] text-slate-600 mb-4">
                            {risk.actions.length <= 3
                              ? "Recommended actions:"
                              : `Top ${Math.min(risk.actions.length, 3)} recommended actions:`}
                          </p>
                          <ul className="space-y-3">
                            {risk.actions.slice(0, 3).map((action, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-3 text-base text-slate-700"
                              >
                                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                  <IconShieldCheck size={14} />
                                </span>
                                <span className="leading-relaxed">{action}</span>
                              </li>
                            ))}
                            {risk.actions.length > 3 && (
                              <li className="text-[length:var(--text-helper)] text-slate-500 italic pl-10">
                                + {risk.actions.length - 3} more action
                                {risk.actions.length - 3 > 1 ? "s" : ""}
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-base text-slate-600">
                  No risk factors calculated. Please check your input data.
                </p>
                {safeResults.errors && safeResults.errors.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[length:var(--text-helper)] font-semibold text-rose-600 mb-2">
                      Errors:
                    </p>
                    <ul className="text-[length:var(--text-helper)] text-rose-600 space-y-1">
                      {safeResults.errors.map((error, idx) => (
                        <li key={idx}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* All risk factors */}
        {safeResults.allRisks.length > 3 && (
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <IconClipboardList size={22} />
              </div>
              <div>
                <h2 className="text-[length:var(--text-page-title)] font-semibold text-[#1a1a1a] lg:text-[length:var(--text-page-title-lg)]">
                  All risk factors
                </h2>
                <p className="text-[length:var(--text-helper)] text-slate-500 mt-0.5">
                  Full set of risks from ASCVD, Framingham, WHO, and other models
                </p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {safeResults.allRisks.map((risk) => {
                const config = levelConfig[risk.level];
                const LevelIcon = config.Icon;
                const label = riskTypeLabels[risk.id] || risk.title;
                const pct = risk.value?.riskPercent as number | undefined;
                return (
                  <div
                    key={risk.id}
                    className={`rounded-lg border ${config.border} ${config.bg} px-4 py-3 flex items-center justify-between gap-3`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-[#1a1a1a] truncate">{label}</p>
                      {pct != null && (
                        <p className="text-sm tabular-nums text-slate-600">{pct}% 10-year</p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${config.badge}`}
                    >
                      <LevelIcon size={12} />
                      {config.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-5 print-break-inside-avoid">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <IconInfo size={22} />
            </div>
            <div>
              <p className="text-[length:var(--text-input)] font-semibold text-[#1a1a1a] mb-2">
                Disclaimer
              </p>
              <p className="text-base text-slate-600 leading-relaxed max-w-[680px]">
                This assessment is for informational purposes only and should not replace
                professional medical advice. Please consult with a healthcare provider for
                personalized risk assessment and treatment recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Print footer */}
        <div className="hidden print-footer mt-8 pt-4 border-t border-slate-300 text-xs text-slate-500">
          <p>Generated on {new Date().toLocaleString()}</p>
          <p className="mt-1">CardioRisk - Cardiovascular Risk Prediction System</p>
        </div>
      </div>
    </ResultsLayout>
  );
}
