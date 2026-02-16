"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormData } from "@/app/types/assessment";
import { TOTAL_STEPS, initialFormState } from "@/app/constants/assessment";
import { AssessmentLayout } from "@/app/components/layouts/AssessmentLayout";
import { SectionCard } from "@/app/components/layouts/SectionCard";
import { SectionDemographics } from "./sections/SectionDemographics";
import { SectionVitals } from "./sections/SectionVitals";
import { SectionLipids } from "./sections/SectionLipids";
import { SectionMetabolic } from "./sections/SectionMetabolic";
import { SectionSmoking } from "./sections/SectionSmoking";
import { SectionBodyComposition } from "./sections/SectionBodyComposition";
import { SectionFamilyHistory } from "./sections/SectionFamilyHistory";
import { SectionLifestyle } from "./sections/SectionLifestyle";
import {
  validateStep,
  isStepValid,
  type ValidationErrors,
} from "@/app/utils/validation";
import { useSubmitAssessment } from "@/app/hooks/useAssessment";
import { useRouter } from "next/navigation";
import { convertCholesterol } from "@/app/lib/unit-conversion";
import { samplePatientData } from "@/app/constants/sample-patient";
import { Toggle } from "@/app/components/ui/Toggle";

export function AssessmentForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isAdvancedMode, setIsAdvancedMode] = useState(true); // Default to Advanced mode
  const { mutate: submitAssessment, isPending } = useSubmitAssessment();

  const progress = useMemo(
    () => Math.round((step / TOTAL_STEPS) * 100),
    [step]
  );

  // Clear errors when data changes
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [data]);

  const handleChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((prev) => {
      const next = { ...prev, [key]: value };

      // Handle unit conversion for cholesterol values
      if (key === "cholesterolUnit" && prev.cholesterolUnit !== value) {
        const fromUnit = prev.cholesterolUnit || "mgdL";
        const toUnit = value as "mgdL" | "mmolL";
        
        // Convert all cholesterol values synchronously
        if (prev.totalCholesterol) {
          next.totalCholesterol = convertCholesterol(prev.totalCholesterol, fromUnit, toUnit);
        }
        if (prev.hdlCholesterol) {
          next.hdlCholesterol = convertCholesterol(prev.hdlCholesterol, fromUnit, toUnit);
        }
        if (prev.ldlCholesterol) {
          next.ldlCholesterol = convertCholesterol(prev.ldlCholesterol, fromUnit, toUnit);
        }
        if (prev.triglycerides) {
          next.triglycerides = convertCholesterol(prev.triglycerides, fromUnit, toUnit);
        }
      }

      // Derive BMI whenever height/weight change
      if (key === "heightCm" || key === "weightKg") {
        const h = key === "heightCm" ? (value as string) : next.heightCm;
        const w = key === "weightKg" ? (value as string) : next.weightKg;
        const height = parseFloat(h || "");
        const weight = parseFloat(w || "");
        if (height > 0 && weight > 0) {
          const heightM = height / 100;
          next.bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
        } else {
          next.bmi = null;
        }
      }

      return next;
    });
  };

  const goNext = () => {
    // Validate current step before proceeding
    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    // Clear errors and proceed to next visible step
    setErrors({});
    const currentIndex = visibleSteps.indexOf(step);
    if (currentIndex < visibleSteps.length - 1) {
      setStep(visibleSteps[currentIndex + 1]);
    }
  };

  const goBack = () => {
    setErrors({});
    const currentIndex = visibleSteps.indexOf(step);
    if (currentIndex > 0) {
      setStep(visibleSteps[currentIndex - 1]);
    }
  };

  const handleFinish = () => {
    // Validate final step
    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    // Submit to API
    submitAssessment(data, {
      onSuccess: (results) => {
        // Encode results and navigate to results page
        if (results && results.top3 && results.top3.length > 0) {
          const encoded = encodeURIComponent(JSON.stringify(results));
          const formDataEncoded = encodeURIComponent(JSON.stringify(data));
          router.push(`/results?data=${encoded}&formData=${formDataEncoded}`);
        } else {
          alert("Assessment completed but no results were returned.");
        }
      },
      onError: (error) => {
        console.error("Submission error:", error);
        alert(`Failed to submit assessment: ${error.message || "Please try again."}`);
      },
    });
  };

  const handleLoadSample = () => {
    if (confirm("Load sample patient data? This will replace your current entries.")) {
      setData(samplePatientData);
      setErrors({});
    }
  };

  // Determine which steps to show based on mode
  const BASIC_STEPS = [1, 2, 3, 4, 5]; // Demographics, Vitals, Lipids, Metabolic, Smoking
  const ADVANCED_STEPS = [6, 7, 8]; // Body Composition, Family History, Lifestyle
  
  const visibleSteps = isAdvancedMode 
    ? [...BASIC_STEPS, ...ADVANCED_STEPS]
    : BASIC_STEPS;
  
  // If current step is not in visible steps (e.g., switching from advanced to basic while on step 6),
  // redirect to the last visible step
  useEffect(() => {
    if (!visibleSteps.includes(step)) {
      const lastVisibleStep = visibleSteps[visibleSteps.length - 1];
      setStep(lastVisibleStep);
    }
  }, [isAdvancedMode, visibleSteps, step]);
  
  const currentTotalSteps = visibleSteps.length;
  const currentProgress = useMemo(
    () => Math.round((visibleSteps.indexOf(step) + 1) / currentTotalSteps * 100),
    [step, visibleSteps, currentTotalSteps]
  );

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
            onClick={handleLoadSample}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            📋 Load Sample Patient
          </button>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2">
            <span className="text-sm font-medium text-slate-700">Mode:</span>
            <Toggle
              labelOn="Advanced"
              labelOff="Basic"
              value={isAdvancedMode}
              onChange={setIsAdvancedMode}
            />
            <span className="text-xs text-slate-500">
              {isAdvancedMode ? "All fields" : "8 required fields"}
            </span>
          </div>
        </div>
      }
      footer={
        <footer className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50 py-6 lg:flex-row lg:items-center lg:justify-between lg:py-8">
          <button
            type="button"
            onClick={goBack}
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
            onClick={step === visibleSteps[visibleSteps.length - 1] ? handleFinish : goNext}
            disabled={isPending}
            className="ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm shadow-sky-200 transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 disabled:cursor-not-allowed disabled:bg-sky-300 lg:ml-0"
          >
            {isPending
              ? "Processing..."
              : step === visibleSteps[visibleSteps.length - 1]
                ? "Finish Assessment"
                : "Continue"}
            {step !== visibleSteps[visibleSteps.length - 1] && !isPending && (
              <span aria-hidden="true" className="text-lg">
                →
              </span>
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
          <SectionDemographics
            data={data}
            onChange={handleChange}
            errors={errors}
          />
        </SectionCard>
      )}
      {step === 2 && (
        <SectionCard
          index={2}
          title="Vital Signs"
          subtitle="Based on ACC/AHA and ASCVD equations."
          errors={errors}
        >
          <SectionVitals data={data} onChange={handleChange} errors={errors} />
        </SectionCard>
      )}
      {step === 3 && (
        <SectionCard
          index={3}
          title="Lipid Panel (Cholesterol)"
          subtitle="Used in ASCVD, Framingham, and WHO lab-based models."
          errors={errors}
        >
          <SectionLipids data={data} onChange={handleChange} errors={errors} />
        </SectionCard>
      )}
      {step === 4 && (
        <SectionCard
          index={4}
          title="Metabolic Health"
          subtitle="Used in CVD and diabetes risk prediction."
          errors={errors}
        >
          <SectionMetabolic
            data={data}
            onChange={handleChange}
            errors={errors}
          />
        </SectionCard>
      )}
      {step === 5 && (
        <SectionCard
          index={5}
          title="Smoking Status"
          subtitle="Crucial risk factor in every major model."
          errors={errors}
        >
          <SectionSmoking data={data} onChange={handleChange} errors={errors} />
        </SectionCard>
      )}
      {isAdvancedMode && step === 6 && (
        <SectionCard
          index={6}
          title="Body Composition"
          subtitle="Used in diabetes risk and non-lab CVD models."
          errors={{}}
        >
          <SectionBodyComposition data={data} onChange={handleChange} />
        </SectionCard>
      )}
      {isAdvancedMode && step === 7 && (
        <SectionCard
          index={7}
          title="Family History"
          subtitle="Optional but clinically strong."
          errors={{}}
        >
          <SectionFamilyHistory data={data} onChange={handleChange} />
        </SectionCard>
      )}
      {isAdvancedMode && step === 8 && (
        <SectionCard
          index={8}
          title="Lifestyle"
          subtitle="Optional but improves interpretability."
          errors={{}}
        >
          <SectionLifestyle data={data} onChange={handleChange} />
        </SectionCard>
      )}
    </AssessmentLayout>
  );
}
