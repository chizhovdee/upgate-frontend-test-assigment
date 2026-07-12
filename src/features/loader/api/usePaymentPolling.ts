import { useCallback, useEffect, useRef, useState } from 'react';
import { httpClient, withRetry } from 'shared/api';
import { delay } from 'shared/lib/delay';

type PollingStatus = 'polling' | 'success' | 'error';

interface StateResponse {
  action: 'WAIT' | 'SUCCESS';
}
export function usePaymentPolling() {
  const [status, setStatus] = useState<PollingStatus>('polling');
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(async (controller: AbortController) => {
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

  const retry = () => {
    setStatus('polling');

    controllerRef.current?.abort();

    const controller = new AbortController();
    controllerRef.current = controller;

    run(controller);
  };

  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;

    (async () => {
      await run(controller);
    })();

    return () => controller.abort();
  }, [run]);

  return { status, retry };
}
