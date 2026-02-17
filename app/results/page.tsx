"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { AssessmentResults } from "@/app/features/assessment/AssessmentResults";
import type { FormData } from "@/app/types/assessment";

type RiskResult = {
  id: string;
  title: string;
  level: "Low" | "Borderline" | "Intermediate" | "High" | "Critical";
  score: number;
  value?: any;
  why: string[];
  warnings?: string[];
  actions?: string[];
};

type ResultsData = {
  top3: RiskResult[];
  allRisks?: RiskResult[];
  errors: string[];
  warnings: string[];
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [originalFormData, setOriginalFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get results from URL params (encoded JSON)
    const resultsParam = searchParams.get("data");
    const formDataParam = searchParams.get("formData");
    
    if (resultsParam) {
      try {
        const decoded = decodeURIComponent(resultsParam);
        const parsed = JSON.parse(decoded);
        setResults(parsed);
        
        // Also get original form data if available
        if (formDataParam) {
          const formDecoded = decodeURIComponent(formDataParam);
          const formParsed = JSON.parse(formDecoded);
          setOriginalFormData(formParsed);
        }
      } catch (error) {
        console.error("Error parsing results:", error);
        // Redirect back if invalid
        router.push("/");
      }
    } else {
      // No results data, redirect back
      router.push("/");
    }
    setLoading(false);
  }, [searchParams, router]);

  const handleReset = () => {
    router.push("/");
  };

  const handleRecompute = useCallback(async (updatedFormData: FormData) => {
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
      
      // Extract data from wrapped response
      const newResults = result.data || result;
      setResults(newResults);
      return newResults;
    } catch (error) {
      console.error("Error recomputing risks:", error);
      throw error; // Re-throw so the component can handle it
    }
  }, []);

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

  return (
    <AssessmentResults
      results={results}
      onReset={handleReset}
      originalFormData={originalFormData}
      onRecompute={handleRecompute}
    />
  );
}
