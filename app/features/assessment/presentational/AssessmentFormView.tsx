"use client";

/**
 * Presentational component for Assessment Form.
 * Pure UI rendering; receives props from container.
 */

import type { FormData } from "@/app/types/assessment";
import type { ValidationErrors } from "@/app/utils/validation";
import { AssessmentLayout } from "@/app/components/layouts/AssessmentLayout";
import { SectionCard } from "@/app/components/layouts/SectionCard";
import { SectionDemographics } from "../sections/SectionDemographics";
import { SectionVitals } from "../sections/SectionVitals";
import { SectionLipids } from "../sections/SectionLipids";
import { SectionMetabolic } from "../sections/SectionMetabolic";
import { SectionSmoking } from "../sections/SectionSmoking";
import { SectionBodyComposition } from "../sections/SectionBodyComposition";
import { SectionFamilyHistory } from "../sections/SectionFamilyHistory";
import { SectionLifestyle } from "../sections/SectionLifestyle";
import { Toggle } from "@/app/components/ui/Toggle";

export interface AssessmentFormViewProps {
  step: number;
  data: FormData;
  errors: ValidationErrors;
  isAdvancedMode: boolean;
  visibleSteps: number[];
  currentProgress: number;
  currentTotalSteps: number;
  isPending: boolean;
  onStepChange: (step: number) => void;
  onDataChange: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
  onModeChange: (isAdvanced: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  onLoadSample: () => void;
}

export function AssessmentFormView({
  step,
  data,
  errors,
  isAdvancedMode,
  visibleSteps,
  currentProgress,
  currentTotalSteps,
  isPending,
  onDataChange,
  onModeChange,
  onNext,
  onBack,
  onFinish,
  onLoadSample,
}: AssessmentFormViewProps) {
  return (
    <AssessmentLayout
      currentStep={visibleSteps.indexOf(step) + 1}
      progress={currentProgress}
      totalSteps={currentTotalSteps}
      visibleSteps={visibleSteps}
      headerActions={
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            📋 Load Sample Patient
          </button>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2">
            <span className="text-[length:var(--text-label)] font-medium text-[#1a1a1a]">Mode:</span>
            <Toggle
              labelOn="Advanced"
              labelOff="Basic"
              value={isAdvancedMode}
              onChange={onModeChange}
            />
            <span className="text-[length:var(--text-helper)] text-slate-500">
              {isAdvancedMode ? "All fields" : "8 required fields"}
            </span>
          </div>
        </div>
      }
      footer={
        <footer className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 py-6 lg:flex-row lg:items-center lg:justify-between lg:py-8">
          <button
            type="button"
            onClick={onBack}
            disabled={step === 1}
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-base font-medium text-slate-600 transition hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            <span aria-hidden="true" className="text-lg">←</span>
            Back
          </button>
          <div className="flex flex-col items-center gap-2 text-sm text-slate-500 lg:flex-row lg:gap-4">
            <span>Fields marked with *</span>
            <span>Draft only – calculations not yet implemented.</span>
          </div>
          <button
            type="button"
            onClick={step === visibleSteps[visibleSteps.length - 1] ? onFinish : onNext}
            disabled={isPending}
            className="ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:cursor-not-allowed disabled:bg-sky-300 lg:ml-0"
          >
            {isPending
              ? "Processing..."
              : step === visibleSteps[visibleSteps.length - 1]
                ? "Finish Assessment"
                : "Continue"}
            {step !== visibleSteps[visibleSteps.length - 1] && !isPending && (
              <span aria-hidden="true" className="text-lg">→</span>
            )}
          </button>
        </footer>
      }
    >
      {step === 1 && (
        <SectionCard
          index={1}
          title="Demographics"
          subtitle="These are used in almost all validated CVD models."
          errors={errors}
        >
          <SectionDemographics data={data} onChange={onDataChange} errors={errors} />
        </SectionCard>
      )}
      {step === 2 && (
        <SectionCard
          index={2}
          title="Vital Signs"
          subtitle="Based on ACC/AHA and ASCVD equations."
          errors={errors}
        >
          <SectionVitals data={data} onChange={onDataChange} errors={errors} />
        </SectionCard>
      )}
      {step === 3 && (
        <SectionCard
          index={3}
          title="Lipid Panel (Cholesterol)"
          subtitle="Used in ASCVD, Framingham, and WHO lab-based models."
          errors={errors}
        >
          <SectionLipids data={data} onChange={onDataChange} errors={errors} />
        </SectionCard>
      )}
      {step === 4 && (
        <SectionCard
          index={4}
          title="Metabolic Health"
          subtitle="Used in CVD and diabetes risk prediction."
          errors={errors}
        >
          <SectionMetabolic data={data} onChange={onDataChange} errors={errors} />
        </SectionCard>
      )}
      {step === 5 && (
        <SectionCard
          index={5}
          title="Smoking Status"
          subtitle="Crucial risk factor in every major model."
          errors={errors}
        >
          <SectionSmoking data={data} onChange={onDataChange} errors={errors} />
        </SectionCard>
      )}
      {isAdvancedMode && step === 6 && (
        <SectionCard
          index={6}
          title="Body Composition"
          subtitle="Used in diabetes risk and non-lab CVD models."
          errors={{}}
        >
          <SectionBodyComposition data={data} onChange={onDataChange} />
        </SectionCard>
      )}
      {isAdvancedMode && step === 7 && (
        <SectionCard
          index={7}
          title="Family History"
          subtitle="Optional but clinically strong."
          errors={{}}
        >
          <SectionFamilyHistory data={data} onChange={onDataChange} />
        </SectionCard>
      )}
      {isAdvancedMode && step === 8 && (
        <SectionCard
          index={8}
          title="Lifestyle"
          subtitle="Optional but improves interpretability."
          errors={{}}
        >
          <SectionLifestyle data={data} onChange={onDataChange} />
        </SectionCard>
      )}
    </AssessmentLayout>
  );
}
