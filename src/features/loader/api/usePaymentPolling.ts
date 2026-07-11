import { useCallback, useEffect, useRef, useState } from 'react';
import { httpClient, withRetry } from 'shared/api';
import { delay } from 'shared/utils/delay';

type PollingStatus = 'polling' | 'success' | 'error';

interface StateResponse {
  action: 'WAIT' | 'SUCCESS';
}
export function usePaymentPolling() {
  const [status, setStatus] = useState<PollingStatus>('polling');
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    const controller = controllerRef.current;
    if (!controller) {
      return;
    }

    while (!controller.signal.aborted) {
      try {
        const response = await withRetry(() =>
          httpClient.get<StateResponse>('/state', controller.signal),
        );

        if (response?.action === 'SUCCESS') {
          setStatus('success');
          return;
        }

        await delay(300);
      } catch {
        if (!controller.signal.aborted) {
          setStatus('error');
        }

        return;
      }
    }
  }, []);

  const retry = useCallback(() => {
    setStatus('polling');
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    run();
  }, [run]);

  useEffect(() => {
    controllerRef.current = new AbortController();

    (async () => {
      await run();
    })();

    return () => controllerRef.current?.abort();
  }, [run]);

  return { status, retry };
}
