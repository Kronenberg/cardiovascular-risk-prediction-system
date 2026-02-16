"use client";

import { useState, useEffect } from "react";
import { ResultsLayout } from "@/app/components/layouts/ResultsLayout";
import { Slider } from "@/app/components/ui/Slider";
import { Toggle } from "@/app/components/ui/Toggle";
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

const levelConfig = {
  Low: {
    label: "Low Risk",
    color: "emerald",
    icon: "✓",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  Borderline: {
    label: "Borderline",
    color: "yellow",
    icon: "⚠",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700",
  },
  Intermediate: {
    label: "Intermediate Risk",
    color: "orange",
    icon: "⚡",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-700",
  },
  High: {
    label: "High Risk",
    color: "rose",
    icon: "●",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    badge: "bg-rose-100 text-rose-700",
  },
  Critical: {
    label: "Critical",
    color: "red",
    icon: "▲",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
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
        await onRecompute(mergedData);
      } catch (error) {
        console.error("Recomputation error:", error);
        // Error is already handled in handleRecompute
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
        <footer className="flex items-center justify-center px-8 py-6 lg:px-12 lg:py-8">
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
          <h1 className="text-4xl font-bold text-slate-900 lg:text-5xl">
            Assessment Results
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Your cardiovascular risk analysis based on validated clinical models
          </p>
        </div>

        {/* Warnings */}
        {results.warnings && results.warnings.length > 0 && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-8 py-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700 text-xl font-semibold">
                ⚠
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Important Notes</h3>
                <ul className="space-y-2 text-base text-yellow-800">
                  {results.warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-yellow-600 mt-1">•</span>
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
          <div className="rounded-lg border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2 lg:text-3xl">
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
                <label className="text-sm font-semibold text-slate-700 mb-3 block">
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
                <p className="mt-3 text-xs text-slate-500">
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
                  <p className="mt-2 text-xs text-slate-500">
                    BMI: {whatIfData.bmi.toFixed(1)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top 3 Risks */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-8 lg:text-3xl">
            Top 3 Risk Factors
          </h2>
          
          <div className="space-y-6">
            {results.top3.map((risk, index) => {
              const config = levelConfig[risk.level];
              const riskLabel = riskTypeLabels[risk.id] || risk.title;
              
              return (
                <div
                  key={risk.id}
                  className={`rounded-lg border-2 ${config.border} ${config.bg} overflow-hidden`}
                >
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-6 mb-8">
                      <div className="flex items-start gap-5 flex-1">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white border-2 border-slate-300 font-bold text-xl text-slate-700 shadow-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <h3 className="text-2xl font-semibold text-slate-900 lg:text-3xl">
                              {risk.title}
                            </h3>
                            <span className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${config.badge}`}>
                              <span>{config.icon}</span>
                              {config.label}
                            </span>
                          </div>
                          {risk.value && (
                            <p className="text-base text-slate-600">
                              {riskLabel}
                              {risk.value.bmi && ` • BMI: ${risk.value.bmi}`}
                              {risk.value.riskPercent !== undefined && (
                                <>
                                  {risk.value.validated === false && (
                                    <span className="text-orange-600 font-medium"> • 10-year risk not validated for this age group</span>
                                  )}
                                  {risk.value.validated !== false && ` • 10-year risk: ${risk.value.riskPercent}%`}
                                </>
                              )}
                              {risk.value.systolic && ` • SBP: ${risk.value.systolic} mmHg`}
                              {risk.value.note && (
                                <span className="block mt-1 text-sm text-slate-500 italic">
                                  {risk.value.note}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Warnings (if any) */}
                    {risk.warnings && risk.warnings.length > 0 && (
                      <div className="mb-6 rounded-lg border-2 border-orange-200 bg-orange-50/50 p-5">
                        <h4 className="text-base font-semibold text-orange-900 mb-3 flex items-center gap-2">
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
                      <h4 className="text-lg font-semibold text-slate-900 mb-4">
                        Why we think this
                      </h4>
                      <p className="text-sm text-slate-600 mb-4">
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
                          <li className="text-sm text-slate-500 italic">
                            + {risk.why.length - 3} more factor{risk.why.length - 3 > 1 ? "s" : ""}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* What would reduce it (2-3 actions) */}
                    {risk.actions && risk.actions.length > 0 && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                        <h4 className="text-lg font-semibold text-slate-900 mb-4">
                          What would reduce it
                        </h4>
                        <p className="text-sm text-slate-600 mb-4">
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
                            <li className="text-sm text-slate-500 italic pl-10">
                              + {risk.actions.length - 3} more action{risk.actions.length - 3 > 1 ? "s" : ""}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-8 py-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 text-base font-semibold">
              i
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 mb-2">Disclaimer</p>
              <p className="text-base text-slate-700 leading-relaxed">
                This assessment is for informational purposes only and should not replace professional medical advice. 
                Please consult with a healthcare provider for personalized risk assessment and treatment recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ResultsLayout>
  );
}
