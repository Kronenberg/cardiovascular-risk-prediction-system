/**
 * Custom API error classes for better error handling
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code: string = "VALIDATION_ERROR"
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

export class RiskCalculationError extends Error {
  constructor(
    message: string,
    public code: string = "RISK_CALCULATION_ERROR"
  ) {
    super(message);
    this.name = "RiskCalculationError";
  }
}

export class DataNormalizationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code: string = "DATA_NORMALIZATION_ERROR"
  ) {
    super(message);
    this.name = "DataNormalizationError";
  }
}

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    details?: any;
  };
};

export function createErrorResponse(
  error: Error,
  statusCode: number = 500
): { response: ApiErrorResponse; status: number } {
  if (error instanceof ValidationError) {
    return {
      response: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          field: error.field,
        },
      },
      status: 400,
    };
  }

  if (error instanceof RiskCalculationError) {
    return {
      response: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      },
      status: 500,
    };
  }

  if (error instanceof DataNormalizationError) {
    return {
      response: {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          field: error.field,
        },
      },
      status: 400,
    };
  }

  // Generic error
  return {
    response: {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: error.message || "An unexpected error occurred",
      },
    },
    status: statusCode,
  };
}
