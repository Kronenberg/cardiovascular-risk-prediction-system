/**
 * API request/response handler utilities
 */

import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../errors/api-errors";

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ReturnType<typeof createErrorResponse>["response"];

/**
 * Wrapper for API route handlers with error handling
 */
export function createApiHandler<T>(
  handler: (request: NextRequest) => Promise<T>
) {
  return async (request: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    try {
      const data = await handler(request);
      return NextResponse.json({
        success: true,
        data,
      } as ApiSuccessResponse<T>);
    } catch (error) {
      console.error("API Handler Error:", error);
      const { response, status } = createErrorResponse(
        error instanceof Error ? error : new Error("Unknown error")
      );
      return NextResponse.json(response, { status });
    }
  };
}

/**
 * Validate request body exists
 */
export function validateRequestBody(body: any): void {
  if (!body || typeof body !== "object") {
    throw new Error("Request body is required");
  }
}
