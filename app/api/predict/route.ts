import { NextRequest, NextResponse } from "next/server";
import {
  normalizeAndValidate,
  evaluateRisks,
  rankTop3,
} from "@/app/lib/risk-calculations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Step 1: Normalize and validate
    const { patient, validation } = normalizeAndValidate(body);

    if (!patient) {
      return NextResponse.json(
        {
          top3: [],
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    // Step 2: Evaluate risks
    const candidates = evaluateRisks(patient);

    // Step 3: Rank top 3
    const top3 = rankTop3(candidates);

    // Step 4: Return structured response
    return NextResponse.json({
      top3,
      errors: validation.errors,
      warnings: validation.warnings,
    });
  } catch (error) {
    console.error("Prediction API error:", error);
    return NextResponse.json(
      {
        top3: [],
        errors: [
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        ],
        warnings: [],
      },
      { status: 500 }
    );
  }
}
