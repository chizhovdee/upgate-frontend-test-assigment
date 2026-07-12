import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { usePaymentPolling } from './usePaymentPolling';

function LoaderProbe() {
  const { status, retry } = usePaymentPolling();
  return (
    <div>
      <div data-testid="status">{status}</div>
      <button onClick={retry}>retry</button>
    </div>
  );
}

// A single big vi.advanceTimersByTimeAsync(ms) call isn't enough here: each
// fetch -> response.json() -> setState hop is its own microtask/scheduler
// tick, and one advance only drains part of that chain. Stepping forward in
// small increments gives every hop a chance to flush, while still running
// in milliseconds since no real time is ever waited on.
async function advanceInSteps(totalMs: number, step = 25) {
  for (let elapsed = 0; elapsed < totalMs; elapsed += step) {
    await vi.advanceTimersByTimeAsync(step);
  }
}

describe('usePaymentPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps polling on WAIT and settles on SUCCESS', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ action: 'WAIT' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ action: 'WAIT' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ action: 'SUCCESS' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<LoaderProbe />);

    expect(screen.getByTestId('status').textContent).toBe('polling');

    // Two 300ms polling delays sit between the three fetches (usePaymentPolling.ts's `delay(300)`).
    await advanceInSteps(900);

    expect(screen.getByTestId('status').textContent).toBe('success');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('retries through a 503 without surfacing an error', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => '' })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ action: 'SUCCESS' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<LoaderProbe />);

    // withRetry's backoff after a 503 is baseDelay*1 plus up to baseDelay of jitter (200-400ms).
    await advanceInSteps(600);

    expect(screen.getByTestId('status').textContent).toBe('success');
  });

  it('surfaces an error after a non-retryable failure, and retry() restarts polling', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 404, text: async () => '' })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ action: 'SUCCESS' }),
      });
    vi.stubGlobal('fetch', fetchMock);

    render(<LoaderProbe />);

    await advanceInSteps(100);
    expect(screen.getByTestId('status').textContent).toBe('error');

    fireEvent.click(screen.getByText('retry'));
    await advanceInSteps(100);

    expect(screen.getByTestId('status').textContent).toBe('success');
  });
});
