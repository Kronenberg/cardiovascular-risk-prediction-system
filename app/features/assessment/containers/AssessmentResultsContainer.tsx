"use client";

/**
 * Container component for Assessment Results.
 * Handles: Data fetching from sessionStorage, state management, what-if scenarios, recomputation logic.
 */

import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import type { FormData } from "@/app/types/assessment";
import { AssessmentResultsView } from "@/app/features/assessment/presentational/AssessmentResultsView";
import type { ResultsData } from "../types";

const ASSESSMENT_RESULTS_KEY = "assessment-results";
const ASSESSMENT_FORMDATA_KEY = "assessment-formData";

export function AssessmentResultsContainer() {
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [whatIfData, setWhatIfData] = useState<Partial<FormData>>({});
  const [isRecomputing, setIsRecomputing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load results and form data from sessionStorage
    try {
      const resultsData = sessionStorage.getItem(ASSESSMENT_RESULTS_KEY);
      const formDataStr = sessionStorage.getItem(ASSESSMENT_FORMDATA_KEY);

      if (resultsData) {
        const parsed = JSON.parse(resultsData);
        setResults(parsed);

        if (formDataStr) {
          const formParsed = JSON.parse(formDataStr);
          setOriginalFormData(formParsed);
        }
      } else {
        // No results found, redirect to home
        router.push("/");
      }
    } catch (error) {
      console.error("Error loading assessment data:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

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

  const handleRecompute = useCallback(async (updatedFormData: FormData): Promise<ResultsData> => {
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage =
          result.error?.message ||
          result.errors?.[0] ||
          "Failed to recompute risks";
        throw new Error(errorMessage);
      }

      const newResults = result.data || result;
      setResults(newResults);
      
      // Update sessionStorage with new results
      try {
        sessionStorage.setItem(ASSESSMENT_RESULTS_KEY, JSON.stringify(newResults));
      } catch (error) {
        console.error("Error updating session storage:", error);
      }
      
      return newResults;
    } catch (error) {
      console.error("Error recomputing risks:", error);
      throw error;
    }
  }, []);

  // Debounced recomputation when what-if data changes
  useEffect(() => {
    if (!originalFormData || !isInitialized || Object.keys(whatIfData).length === 0) {
      return;
    }

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
        await handleRecompute(mergedData);
      } catch (error) {
        console.error("Recomputation error:", error);
      } finally {
        setIsRecomputing(false);
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      setIsRecomputing(false);
    };
  }, [whatIfData, handleRecompute, originalFormData, isInitialized]);

  const handleWhatIfChange = (key: keyof FormData, value: string | number) => {
    const updated = { ...whatIfData, [key]: value.toString() };

    // Recompute BMI if weight or height changes
    if ((key === "weightKg" || key === "heightCm") && originalFormData) {
      const weight =
        key === "weightKg"
          ? parseFloat(value.toString())
          : parseFloat(updated.weightKg || originalFormData.weightKg || "0");
      const height =
        key === "heightCm"
          ? parseFloat(value.toString())
          : parseFloat(updated.heightCm || originalFormData.heightCm || "0");
      if (weight > 0 && height > 0) {
        const heightM = height / 100;
        const bmi = parseFloat((weight / (heightM * heightM)).toFixed(1));
        updated.bmi = bmi;
      }
    }

    setWhatIfData(updated);
  };

  const handleReset = () => {
    // Clear sessionStorage and redirect
    try {
      sessionStorage.removeItem(ASSESSMENT_RESULTS_KEY);
      sessionStorage.removeItem(ASSESSMENT_FORMDATA_KEY);
    } catch (error) {
      console.error("Error clearing session storage:", error);
    }
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-sky-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const hasWhatIfData = originalFormData != null;
  const currentSbp = whatIfData.systolicBp || originalFormData?.systolicBp || "120";
  const currentWeight = whatIfData.weightKg || originalFormData?.weightKg || "70";
  const currentHeight = whatIfData.heightCm || originalFormData?.heightCm || "170";
  const currentSmoking = (whatIfData.smokingStatus ||
    originalFormData?.smokingStatus ||
    "never") as "never" | "former" | "current";

  return (
    <AssessmentResultsView
      results={results}
      onReset={handleReset}
      hasWhatIfData={hasWhatIfData}
      isRecomputing={isRecomputing}
      whatIfBmi={whatIfData.bmi}
      currentSbp={currentSbp}
      currentWeight={currentWeight}
      currentHeight={currentHeight}
      currentSmoking={currentSmoking}
      onWhatIfChange={handleWhatIfChange}
    />
  );
}
