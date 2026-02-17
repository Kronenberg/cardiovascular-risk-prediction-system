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
 * Wrapper for API route handlers with error handling and request logging
 */
export function createApiHandler<T>(
  handler: (request: NextRequest) => Promise<T>
) {
  return async (request: NextRequest): Promise<NextResponse<ApiResponse<T>>> => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    const url = new URL(request.url);

    // Log request
    console.log(`[${requestId}] ${request.method} ${url.pathname}`, {
      timestamp: new Date().toISOString(),
      query: Object.fromEntries(url.searchParams),
    });

    try {
      const data = await handler(request);
      const duration = Date.now() - startTime;

      // Log success
      console.log(`[${requestId}] Success (${duration}ms)`);

      return NextResponse.json({
        success: true,
        data,
      } as ApiSuccessResponse<T>, {
        headers: {
          "X-Request-ID": requestId,
          "X-Response-Time": `${duration}ms`,
        },
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // Log error
      console.error(`[${requestId}] Error (${duration}ms):`, {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const { response, status } = createErrorResponse(
        error instanceof Error ? error : new Error("Unknown error")
      );

      return NextResponse.json(response, {
        status,
        headers: {
          "X-Request-ID": requestId,
          "X-Response-Time": `${duration}ms`,
        },
      });
    }
  };
}

const MAX_BODY_SIZE = 1024 * 10; // 10KB - reasonable limit for form data

/**
 * Validate request body exists and is within size limits
 */
export function validateRequestBody(body: any): void {
  if (!body || typeof body !== "object") {
    throw new Error("Request body is required");
  }

  // Check body size to prevent DoS attacks
  const bodySize = JSON.stringify(body).length;
  if (bodySize > MAX_BODY_SIZE) {
    throw new Error(
      `Request body too large (${bodySize} bytes, max ${MAX_BODY_SIZE} bytes)`
    );
  }
}
