import { callGeminiWithSimpleRetry } from '@/lib/geminiClient';
import { ApiError } from '@/lib/errors';

describe('callGeminiWithSimpleRetry', () => {
  test('returns success on first attempt', async () => {
    const result = await callGeminiWithSimpleRetry(async () => 'ok');
    expect(result).toBe('ok');
  });

  test('retries once on 429 then succeeds', async () => {
    let attempt = 0;
    const result = await callGeminiWithSimpleRetry(async () => {
      attempt++;
      if (attempt === 1) {
        const err: any = new Error('Rate limited');
        err.status = 429;
        throw err;
      }
      return 'ok';
    }, { retryDelayMs: 10 });
    expect(result).toBe('ok');
    expect(attempt).toBe(2);
  });

  test('retries once on network error code and then succeeds', async () => {
    let attempt = 0;
    const result = await callGeminiWithSimpleRetry(async () => {
      attempt++;
      if (attempt === 1) {
        const err: any = new Error('Connection reset');
        err.code = 'ECONNRESET';
        throw err;
      }
      return 'ok';
    }, { retryDelayMs: 10 });
    expect(result).toBe('ok');
    expect(attempt).toBe(2);
  });

  test('non-retryable 400 throws ApiError(400)', async () => {
    await expect(
      callGeminiWithSimpleRetry(async () => {
        const err: any = new Error('Bad request');
        err.status = 400;
        throw err;
      })
    ).rejects.toMatchObject({ status: 400, code: 'BAD_REQUEST' } as ApiError);
  });

  test('persistent 5xx throws ApiError with upstream code', async () => {
    await expect(
      callGeminiWithSimpleRetry(async () => {
        const err: any = new Error('Upstream');
        err.status = 503;
        throw err;
      }, { retryDelayMs: 10 })
    ).rejects.toMatchObject({ status: 503, code: 'UPSTREAM_ERROR' } as ApiError);
  });

  test('timeout results in ApiError(504, TIMEOUT)', async () => {
    await expect(
      callGeminiWithSimpleRetry(
        async () => new Promise<string>(() => { /* never resolves */ }),
        { timeoutMs: 20, retryOnce: false }
      )
    ).rejects.toMatchObject({ status: 504, code: 'TIMEOUT' } as ApiError);
  });
});
