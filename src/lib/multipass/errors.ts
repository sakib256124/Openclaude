export type NormalizedErrorCode =
  | "VALIDATION_FAILED"
  | "AUTH_EXPIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "MULTIPASS_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "NETWORK_TIMEOUT"
  | "TLS_ERROR"
  | "MISSING_HOST"
  | "METRICS_UNAVAILABLE"
  | "COMMAND_FAILED";

export class OpenCloudError extends Error {
  constructor(
    public readonly code: NormalizedErrorCode,
    message: string,
    public readonly statusCode = 500,
    public readonly requestId?: string
  ) {
    super(message);
    this.name = "OpenCloudError";
  }
}

export function toSafeErrorResponse(error: unknown) {
  if (error instanceof OpenCloudError) {
    return {
      code: error.code,
      message: error.message,
      requestId: error.requestId ?? null
    };
  }

  return {
    code: "MULTIPASS_ERROR" satisfies NormalizedErrorCode,
    message: "The request could not be completed.",
    requestId: null
  };
}
