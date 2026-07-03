import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth/guards";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function badRequest(error: string, issues?: unknown) {
  const body: Record<string, unknown> = { error };
  if (issues) body.issues = issues;
  return NextResponse.json(body, { status: 400 });
}

export function unauthorized(error = "Unauthorized") {
  return NextResponse.json({ error }, { status: 401 });
}

export function forbidden(error = "Forbidden") {
  return NextResponse.json({ error }, { status: 403 });
}

export function notFound(error = "Not found") {
  return NextResponse.json({ error }, { status: 404 });
}

export function serverError(error?: unknown) {
  console.error("Server error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export function handleAuthError(err: unknown) {
  if (err instanceof AuthError) {
    if (err.status === 403) return forbidden(err.message);
    return unauthorized(err.message);
  }
  return serverError(err);
}
