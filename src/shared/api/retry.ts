import { delay } from 'shared/utils/delay';
import { HttpError } from './HttpError';

type RetryOptions = {
  retries?: number;
  baseDelay?: number;
};

const DEFAULT_RETRIES = 5;
const DEFAULT_BASE_DELAY = 200;

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}) {
  const { retries = DEFAULT_RETRIES, baseDelay = DEFAULT_BASE_DELAY } = options;

  for (let i = 1; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      const isRetryable = e instanceof HttpError && e.status === 503;

      if (!isRetryable) {
        throw e;
      }

      const jitter = Math.random() * baseDelay;
      await delay(baseDelay * i + jitter);
    }
  }
}
