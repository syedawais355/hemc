import { NextResponse } from "next/server";

export const ok = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);

export const created = <T>(data: T) => NextResponse.json(data, { status: 201 });

export const noContent = () => new NextResponse(null, { status: 204 });

export const fail = (status: number, message: string) =>
  NextResponse.json({ error: message }, { status });

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// Wraps a route handler: maps ApiError to a clean JSON response and hides
// unexpected errors behind a generic 500 (never leak internals to the client).
export function handler<A extends unknown[]>(
  fn: (...args: A) => Promise<NextResponse>,
) {
  return async (...args: A): Promise<NextResponse> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) return fail(err.status, err.message);
      console.error("Unhandled API error:", err);
      return fail(500, "Something went wrong");
    }
  };
}
