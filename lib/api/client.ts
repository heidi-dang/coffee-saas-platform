export class ApiError extends Error {
  status: number;
  issues?: unknown;

  constructor(message: string, status: number, issues?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

export async function apiFetch<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let body: any;
    try {
      body = await res.json();
    } catch {
      body = { error: `Request failed with status ${res.status}` };
    }
    throw new ApiError(
      body.error || `Request failed with status ${res.status}`,
      res.status,
      body.issues
    );
  }

  return res.json();
}
