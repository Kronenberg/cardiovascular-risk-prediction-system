"use client";

/**
 * Container component for Assessment Form.
 * Handles: state management, validation, form submission, navigation.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormData } from "@/app/types/assessment";
import { TOTAL_STEPS, initialFormState } from "@/app/constants/assessment";
import {
  validateStep,
  type ValidationErrors,
} from "@/app/utils/validation";
import { useSubmitAssessment } from "@/app/hooks/useAssessment";
import { convertCholesterol } from "@/app/lib/unit-conversion";
import { samplePatientData } from "@/app/constants/sample-patient";
import { AssessmentFormView } from "../presentational/AssessmentFormView";
import { AssessmentLoader } from "@/app/components/ui/AssessmentLoader";

export function AssessmentFormContainer() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<FormData>(initialFormState);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isAdvancedMode, setIsAdvancedMode] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const { mutate: submitAssessment, isPending } = useSubmitAssessment();

  // Determine which steps to show based on mode
  const BASIC_STEPS = [1, 2, 3, 4, 5];
  const ADVANCED_STEPS = [6, 7, 8];
  const visibleSteps = isAdvancedMode
    ? [...BASIC_STEPS, ...ADVANCED_STEPS]
    : BASIC_STEPS;

  const currentTotalSteps = visibleSteps.length;
  const currentProgress = useMemo(
    () => Math.round(((visibleSteps.indexOf(step) + 1) / currentTotalSteps) * 100),
    [step, visibleSteps, currentTotalSteps]
  );

  // Clear errors when data changes
  useEffect(() => {
    if (errors && Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [data]);

  // Redirect if current step is not in visible steps
  useEffect(() => {
    if (!visibleSteps.includes(step)) {
      const lastVisibleStep = visibleSteps[visibleSteps.length - 1];
      setStep(lastVisibleStep);
    }
  }, [isAdvancedMode, visibleSteps, step]);

  const handleChange = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((prev) => {
      const next = { ...prev, [key]: value };

      // Handle unit conversion for cholesterol values
      if (key === "cholesterolUnit" && prev.cholesterolUnit !== value) {
        const fromUnit = prev.cholesterolUnit || "mgdL";
        const toUnit = value as "mgdL" | "mmolL";

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
    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

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
    const stepErrors = validateStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setShowLoader(true);
    const startTime = Date.now();

    submitAssessment(data, {
      onSuccess: (results) => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 3000 - elapsed);
        setTimeout(() => {
          if (results && results.top3 && results.top3.length > 0) {
            const encoded = encodeURIComponent(JSON.stringify(results));
            const formDataEncoded = encodeURIComponent(JSON.stringify(data));
            router.push(`/results?data=${encoded}&formData=${formDataEncoded}`);
          } else {
            setShowLoader(false);
            alert("Assessment completed but no results were returned.");
          }
        }, remaining);
      },
      onError: (error) => {
        setShowLoader(false);
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

  return (
    <>
      {showLoader && <AssessmentLoader />}
      <AssessmentFormView
        step={step}
        data={data}
        errors={errors}
        isAdvancedMode={isAdvancedMode}
        visibleSteps={visibleSteps}
        currentProgress={currentProgress}
        currentTotalSteps={currentTotalSteps}
        isPending={isPending}
        onStepChange={setStep}
        onDataChange={handleChange}
        onModeChange={setIsAdvancedMode}
        onNext={goNext}
        onBack={goBack}
        onFinish={handleFinish}
        onLoadSample={handleLoadSample}
      />
    </>
  );
}
