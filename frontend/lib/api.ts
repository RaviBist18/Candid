/**
 * Helper for calling the FastAPI backend with the user's Supabase session
 * token attached. Use this instead of raw fetch() for any protected
 * backend endpoint (everything except /health).
 */
import { createClient } from "./supabase-browser";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${session.access_token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    let message = `Request failed: ${response.status}`;
    if (typeof body.detail === "string") {
      message = body.detail;
    } else if (Array.isArray(body.detail)) {
      message = body.detail
        .map((e: any) => `${e.loc?.slice(-1)[0] ?? "field"}: ${e.msg}`)
        .join("; ");
    }
    throw new Error(message);
  }

  return response.json();
}
