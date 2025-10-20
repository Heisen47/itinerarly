import { ApiError } from './errors';

type RetryOpts = {
  retryOnce?: boolean; // default true
  timeoutMs?: number; // default 15000
  retryDelayMs?: number; // default 700
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err: any): boolean {
  const status = err?.response?.status ?? err?.status;
  const code = err?.code; // e.g., ECONNRESET, ETIMEDOUT
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  if (code === 'ECONNRESET' || code === 'ETIMEDOUT' || code === 'ENETUNREACH') return true;
  return false;
}

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new ApiError(504, 'TIMEOUT', `Request exceeded ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

// callFactory should perform the actual Gemini call (e.g., ai.models.generateContent(...))
export async function callGeminiWithSimpleRetry<T>(
  callFactory: () => Promise<T>,
  opts: RetryOpts = {}
): Promise<T> {
  const { retryOnce = true, timeoutMs = 15000, retryDelayMs = 700 } = opts;

  try {
    return await withTimeout(callFactory(), timeoutMs);
  } catch (err: any) {
    // Preserve explicit TIMEOUT errors from withTimeout
    if (err instanceof ApiError && err.code === 'TIMEOUT') {
      throw err;
    }
    if (retryOnce && isRetryable(err)) {
      await sleep(retryDelayMs);
      try {
        return await withTimeout(callFactory(), timeoutMs);
      } catch (err2: any) {
        if (err2 instanceof ApiError && err2.code === 'TIMEOUT') {
          throw err2;
        }
        const status = err2?.response?.status ?? err2?.status ?? 502;
        const message = err2?.response?.data?.message || err2?.message || 'Upstream error';
        throw new ApiError(status, status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_ERROR', message);
      }
    }

    const status = err?.response?.status ?? err?.status ?? 400;
    const message = err?.response?.data?.message || err?.message || 'Request failed';
    if (status === 504) {
      throw new ApiError(504, 'TIMEOUT', message);
    }
    const code = status >= 500 ? 'UPSTREAM_ERROR' : status === 429 ? 'RATE_LIMITED' : 'BAD_REQUEST';
    throw new ApiError(status, code, message);
  }
}
