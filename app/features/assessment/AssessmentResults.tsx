"use client";

import { useState, useEffect } from "react";
import { ResultsLayout } from "@/app/components/layouts/ResultsLayout";
import { Slider } from "@/app/components/ui/Slider";
import { Toggle } from "@/app/components/ui/Toggle";
import { PrintButton } from "@/app/components/ui/PrintButton";
import type { FormData } from "@/app/types/assessment";

export type RiskResult = {
  id: string;
  title: string;
  level: "Low" | "Borderline" | "Intermediate" | "High" | "Critical";
  score: number;
  value?: any;
  why: string[];
  warnings?: string[];
  actions?: string[];
};

export type ResultsData = {
  top3: RiskResult[];
  errors: string[];
  warnings: string[];
};

type AssessmentResultsProps = {
  results: ResultsData;
  onReset: () => void;
  originalFormData?: FormData | null;
  onRecompute?: (formData: FormData) => void;
};

/* Muted medical palette: calm green (low), muted amber (medium), muted red (high) */
const levelConfig = {
  Low: {
    label: "Low Risk",
    color: "emerald",
    icon: "✓",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
  },
  Borderline: {
    label: "Borderline",
    color: "amber",
    icon: "⚠",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  Intermediate: {
    label: "Intermediate Risk",
    color: "amber",
    icon: "⚡",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  High: {
    label: "High Risk",
    color: "rose",
    icon: "●",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-600",
    badge: "bg-rose-100 text-rose-600",
  },
  Critical: {
    label: "Critical",
    color: "red",
    icon: "▲",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    badge: "bg-red-100 text-red-600",
  },
};

const riskTypeLabels: Record<string, string> = {
  diabetes: "Diabetes",
  bp_category: "Blood Pressure",
  ascvd_10yr: "ASCVD Risk",
  severe_obesity: "Obesity",
  obesity: "Obesity",
  relative_risk: "Risk Factors",
  diabetes_risk: "Diabetes Risk",
};

export function AssessmentResults({
  results,
  onReset,
  originalFormData,
  onRecompute,
}: AssessmentResultsProps) {
  const [whatIfData, setWhatIfData] = useState<Partial<FormData>>({});
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Ensure results has top3 array
  const safeResults = {
    ...results,
    top3: results.top3 || [],
    errors: results.errors || [],
    warnings: results.warnings || [],
  };

  // Initialize what-if data from original form data
  useEffect(() => {
    if (originalFormData && !isInitialized) {
      setWhatIfData({
        systolicBp: originalFormData.systolicBp,
        smokingStatus: originalFormData.smokingStatus,
        weightKg: originalFormData.weightKg,
        heightCm: originalFormData.heightCm,
      });
      setIsInitialized(true);
    }
  }, [originalFormData, isInitialized]);

  // Debounced recomputation when what-if data changes
  useEffect(() => {
    // Don't recompute until initialized
    if (!onRecompute || !originalFormData || !isInitialized || Object.keys(whatIfData).length === 0) {
      return;
    }

    // Skip if what-if data hasn't actually changed from original
    const hasChanges = 
      whatIfData.systolicBp !== originalFormData.systolicBp ||
      whatIfData.smokingStatus !== originalFormData.smokingStatus ||
      whatIfData.weightKg !== originalFormData.weightKg ||
      whatIfData.heightCm !== originalFormData.heightCm;
    
    if (!hasChanges) {
      setIsRecomputing(false);
      return;
    }

    setIsRecomputing(true);
    const timeoutId = setTimeout(async () => {
      try {
        const mergedData: FormData = {
          ...originalFormData,
          ...whatIfData,
        };
        const newResults = await onRecompute(mergedData);
        // Ensure results have top3 array
        if (newResults && (!newResults.top3 || !Array.isArray(newResults.top3))) {
          console.warn("Invalid results structure:", newResults);
        }
      } catch (error) {
        console.error("Recomputation error:", error);
        // Don't update state on error - keep previous results
      } finally {
        setIsRecomputing(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      // Reset loading state if effect is cleaned up
      setIsRecomputing(false);
    };
  }, [whatIfData, onRecompute, originalFormData, isInitialized]);

  const handleWhatIfChange = (key: keyof FormData, value: string | number) => {
    const updated = { ...whatIfData, [key]: value.toString() };
    
    // Recompute BMI if weight or height changes
    if ((key === "weightKg" || key === "heightCm") && originalFormData) {
      const weight = key === "weightKg" ? parseFloat(value.toString()) : parseFloat(updated.weightKg || originalFormData.weightKg || "0");
      const height = key === "heightCm" ? parseFloat(value.toString()) : parseFloat(updated.heightCm || originalFormData.heightCm || "0");
      if (weight > 0 && height > 0) {
        const heightM = height / 100;
        const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
        updated.bmi = bmi;
      }
    }
    
    setWhatIfData(updated);
  };

  const hasWhatIfData = originalFormData && onRecompute;
  const currentSbp = whatIfData.systolicBp || originalFormData?.systolicBp || "120";
  const currentWeight = whatIfData.weightKg || originalFormData?.weightKg || "70";
  const currentHeight = whatIfData.heightCm || originalFormData?.heightCm || "170";
  const currentSmoking = (whatIfData.smokingStatus || originalFormData?.smokingStatus || "never") as "never" | "former" | "current";

  return (
    <ResultsLayout
      footer={
        <footer className="flex items-center justify-center px-8 py-6 lg:px-12 lg:py-8 no-print">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-8 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
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
            <div>
              <h1 className="text-[length:var(--text-page-title)] font-semibold text-[#1a1a1a] lg:text-[length:var(--text-page-title-lg)]">
                Assessment Results
              </h1>
              <p className="mt-4 text-base text-slate-600 max-w-[680px]">
                Your cardiovascular risk analysis based on validated clinical models
              </p>
            </div>
            <div className="flex gap-3 no-print">
              <PrintButton />
            </div>
          </div>
        </div>

        {/* Warnings */}
        {safeResults.warnings && safeResults.warnings.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-8 py-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-[length:var(--text-section)] font-semibold tabular-nums">
                ⚠
              </div>
              <div className="flex-1">
                <h3 className="text-[length:var(--text-section)] font-semibold text-amber-900 mb-3">Important Notes</h3>
                <ul className="space-y-2 text-base text-amber-800">
                  {safeResults.warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-amber-600 mt-1">•</span>
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
          <div className="rounded-lg border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-8 no-print">
            <div className="mb-6">
              <h2 className="text-[length:var(--text-page-title)] font-semibold text-[#1a1a1a] mb-2 lg:text-[length:var(--text-page-title-lg)]">
                What-If Scenarios
              </h2>
              <p className="text-base text-slate-600">
                Adjust these factors to see how they impact your cardiovascular risk in real-time.
              </p>
            </div>
            
            {isRecomputing && (
              <div className="mb-4 flex items-center gap-2 text-sm text-sky-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-600 border-t-transparent"></div>
                <span>Recalculating risks...</span>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {/* Smoking Toggle */}
              <div className="rounded-lg border border-sky-200 bg-white p-5">
                <label className="text-[length:var(--text-label)] font-medium text-[#1a1a1a] mb-3 block">
                  Smoking Status
                </label>
                <Toggle
                  labelOn="Current Smoker"
                  labelOff="Non-Smoker"
                  value={currentSmoking === "current"}
                  onChange={(isSmoker) =>
                    handleWhatIfChange("smokingStatus", isSmoker ? "current" : "never")
                  }
                />
                <p className="mt-3 text-[length:var(--text-helper)] text-slate-500">
                  Smoking significantly increases cardiovascular risk
                </p>
              </div>

              {/* SBP Slider */}
              <div className="rounded-lg border border-sky-200 bg-white p-5">
                <Slider
                  label="Systolic Blood Pressure"
                  value={parseFloat(currentSbp)}
                  min={80}
                  max={200}
                  step={1}
                  onChange={(value) => handleWhatIfChange("systolicBp", value.toString())}
                  unit="mmHg"
                />
              </div>

              {/* Weight Slider */}
              <div className="rounded-lg border border-sky-200 bg-white p-5">
                <Slider
                  label="Weight"
                  value={parseFloat(currentWeight)}
                  min={40}
                  max={150}
                  step={1}
                  onChange={(value) => handleWhatIfChange("weightKg", value.toString())}
                  unit="kg"
                />
                {whatIfData.bmi && (
                  <p className="mt-2 text-[length:var(--text-helper)] text-slate-500 tabular-nums">
                    BMI: {whatIfData.bmi.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Risks */}
        <div>
          <h2 className="text-[length:var(--text-page-title)] font-semibold text-[#1a1a1a] mb-8 lg:text-[length:var(--text-page-title-lg)]">
            Top 3 Risk Factors
          </h2>
          
          <div className="space-y-6">
            {safeResults.top3 && safeResults.top3.length > 0 ? (
              safeResults.top3.map((risk, index) => {
                const config = levelConfig[risk.level];
                const riskLabel = riskTypeLabels[risk.id] || risk.title;
                
                return (
                  <div
                    key={risk.id}
                    className={`rounded-lg border-2 ${config.border} ${config.bg} overflow-hidden print-break-inside-avoid`}
                  >
                    <div className="p-8">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-6 mb-8">
                        <div className="flex items-start gap-5 flex-1">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white border-2 border-slate-300 font-bold text-[length:var(--text-section)] text-[#1a1a1a] shadow-sm tabular-nums">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <h3 className="text-[length:var(--text-section)] font-semibold text-[#1a1a1a] lg:text-[length:var(--text-section-lg)]">
                                {risk.title}
                              </h3>
                              <span className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${config.badge}`}>
                                <span>{config.icon}</span>
                                {config.label}
                              </span>
                            </div>
                            {risk.value && (
                              <div className="space-y-1">
                                {(risk.value.riskPercent !== undefined && risk.value.validated !== false) && (
                                  <p className="text-[length:var(--text-risk-number)] font-bold text-[#1a1a1a] tabular-nums lg:text-[length:var(--text-risk-number-lg)]">
                                    10-year risk: {risk.value.riskPercent}%
                                  </p>
                                )}
                                {(risk.value.systolic || risk.value.bmi) && (
                                  <p className="text-base text-slate-600 tabular-nums">
                                    {risk.value.systolic && <>SBP: {risk.value.systolic} mmHg</>}
                                    {risk.value.systolic && risk.value.bmi && " • "}
                                    {risk.value.bmi && <>BMI: {risk.value.bmi}</>}
                                  </p>
                                )}
                                {risk.value.riskPercent === undefined && !risk.value.systolic && !risk.value.bmi && riskLabel && (
                                  <p className="text-base text-slate-600">{riskLabel}</p>
                                )}
                                {risk.value.riskPercent !== undefined && risk.value.validated === false && (
                                  <span className="text-amber-700 font-medium">10-year risk not validated for this age group</span>
                                )}
                                {risk.value.note && (
                                  <p className="text-[length:var(--text-helper)] text-slate-500 italic mt-1">
                                    {risk.value.note}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Warnings (if any) */}
                      {risk.warnings && risk.warnings.length > 0 && (
                        <div className="mb-6 rounded-lg border-2 border-orange-200 bg-orange-50/50 p-5">
                          <h4 className="text-[length:var(--text-input)] font-semibold text-amber-900 mb-3 flex items-center gap-2">
                            <span>⚠️</span>
                            Important Note
                          </h4>
                          <ul className="space-y-2">
                            {risk.warnings.map((warning, idx) => (
                              <li key={idx} className="flex items-start gap-3 text-base text-orange-800">
                                <span className="text-orange-500 mt-1.5 text-lg">•</span>
                                <span className="leading-relaxed">{warning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Why we think this (Top 3 drivers) */}
                      <div className="mb-8">
                        <h4 className="text-[length:var(--text-section)] font-semibold text-[#1a1a1a] mb-4">
                          Why we think this
                        </h4>
                        <p className="text-[length:var(--text-helper)] text-slate-600 mb-4">
                          Top {Math.min(risk.why.length, 3)} contributing factors:
                        </p>
                        <ul className="space-y-3">
                          {risk.why.slice(0, 3).map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-base text-slate-700">
                              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed">{reason}</span>
                            </li>
                          ))}
                          {risk.why.length > 3 && (
                            <li className="text-[length:var(--text-helper)] text-slate-500 italic">
                              + {risk.why.length - 3} more factor{risk.why.length - 3 > 1 ? "s" : ""}
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* What would reduce it (2-3 actions) */}
                      {risk.actions && risk.actions.length > 0 && (
                        <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                          <h4 className="text-[length:var(--text-section)] font-semibold text-[#1a1a1a] mb-4">
                            What would reduce it
                          </h4>
                          <p className="text-[length:var(--text-helper)] text-slate-600 mb-4">
                            {risk.actions.length <= 3 
                              ? "Recommended actions:" 
                              : `Top ${Math.min(risk.actions.length, 3)} recommended actions:`}
                          </p>
                          <ul className="space-y-3">
                            {risk.actions.slice(0, 3).map((action, idx) => (
                              <li key={idx} className="flex items-start gap-4 text-base text-slate-700">
                                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold">
                                  ✓
                                </span>
                                <span className="leading-relaxed">{action}</span>
                              </li>
                            ))}
                            {risk.actions.length > 3 && (
                              <li className="text-[length:var(--text-helper)] text-slate-500 italic pl-10">
                                + {risk.actions.length - 3} more action{risk.actions.length - 3 > 1 ? "s" : ""}
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
                    <p className="text-[length:var(--text-helper)] font-semibold text-rose-600 mb-2">Errors:</p>
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

        {/* Disclaimer */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-8 py-6 print-break-inside-avoid">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-base font-semibold">
              i
            </div>
            <div>
              <p className="text-[length:var(--text-input)] font-semibold text-[#1a1a1a] mb-2">Disclaimer</p>
              <p className="text-base text-slate-600 leading-relaxed max-w-[680px]">
                This assessment is for informational purposes only and should not replace professional medical advice. 
                Please consult with a healthcare provider for personalized risk assessment and treatment recommendations.
              </p>
            </div>
          </div>
        </div>
        
        {/* Print footer - only visible when printing */}
        <div className="hidden print-footer mt-8 pt-4 border-t border-slate-300 text-xs text-slate-500">
          <p>Generated on {new Date().toLocaleString()}</p>
          <p className="mt-1">CardioRisk - Cardiovascular Risk Prediction System</p>
        </div>
      </div>
    </ResultsLayout>
  );
}
