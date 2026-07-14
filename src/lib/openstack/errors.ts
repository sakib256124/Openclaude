export type NormalizedErrorCode =
  | "VALIDATION_FAILED"
  | "AUTH_EXPIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "OPENSTACK_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "NETWORK_TIMEOUT"
  | "TLS_ERROR"
  | "MISSING_ENDPOINT"
  | "TELEMETRY_UNAVAILABLE";

export class OpenCloudError extends Error {
  constructor(
    public readonly code: NormalizedErrorCode,
    message: string,
    public readonly statusCode = 500,
    public readonly openStackRequestId?: string
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
      requestId: error.openStackRequestId ?? null
    };
  }

  return {
    code: "OPENSTACK_ERROR" satisfies NormalizedErrorCode,
    message: "The request could not be completed.",
    requestId: null
  };
}
