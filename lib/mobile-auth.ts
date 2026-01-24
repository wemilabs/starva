import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function getMobileSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session;
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
