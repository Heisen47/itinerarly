// Lightweight error utilities for API routes
export type ErrorPayload = { code: string; message: string };

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Normalize unknown errors to HTTP status + standardized payload
export function toHttpError(err: unknown): { status: number; payload: ErrorPayload } {
  if (err instanceof ApiError) {
    return { status: err.status, payload: { code: err.code, message: err.message } };
  }

  const anyErr = err as any;
  const statusCandidate = anyErr?.response?.status ?? anyErr?.status;
  const status = Number.isInteger(statusCandidate) ? Number(statusCandidate) : 500;
  const message =
    anyErr?.response?.data?.message || anyErr?.message || 'Unexpected error';

  let code = 'INTERNAL_ERROR';
  if (status === 429) code = 'RATE_LIMITED';
  else if (status >= 500) code = 'UPSTREAM_ERROR';
  else if (status >= 400) code = 'BAD_REQUEST';

  return { status, payload: { code, message } };
}
