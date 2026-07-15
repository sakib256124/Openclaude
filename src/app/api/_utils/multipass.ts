import { NextResponse } from "next/server";
import { OpenCloudError, toSafeErrorResponse } from "@/lib/multipass/errors";

export function multipassErrorResponse(error: unknown) {
  const status = error instanceof OpenCloudError ? error.statusCode : 500;

  return NextResponse.json(
    {
      error: toSafeErrorResponse(error)
    },
    { status }
  );
}
