import { useMutation, useQuery } from "@tanstack/react-query";
import type { FormData } from "@/app/types/assessment";

// Example API functions - replace with your actual API endpoints
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export function useSubmitAssessment() {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0] || "Failed to submit assessment");
      }

      return response.json();
    },
  });
}

export function useGetAssessment(id: string) {
  return useQuery({
    queryKey: ["assessment", id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE_URL}/assessment/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch assessment");
      }

      return response.json();
    },
    enabled: !!id,
  });
}

// Example hook for calculating risk
export function useCalculateRisk() {
  return useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch(`${API_BASE_URL}/assessment/calculate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to calculate risk");
      }

      return response.json();
    },
  });
}
