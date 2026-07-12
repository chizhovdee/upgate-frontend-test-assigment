import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CatalogPage } from './CatalogPage';
import type { Product } from '../model/types';

const products: Product[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Product ${i + 1}`,
  price: 9.99,
  description: 'desc',
  category: 'misc',
  image: 'https://example.com/img.png',
  rating: { rate: 4, count: 10 },
}));

function renderCatalog() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/checkout" element={<div>Checkout stub</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('CatalogPage', () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      value: 600,
    });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      value: 800,
    });
  });

  afterAll(() => {
    // @ts-expect-error test-only cleanup
    delete HTMLElement.prototype.offsetHeight;
    // @ts-expect-error test-only cleanup
    delete HTMLElement.prototype.offsetWidth;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads products, filters by search, selects, adds to cart, and navigates to checkout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => products,
      }),
    );

    renderCatalog();

    expect(screen.getByText('Catalog loading...')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('Product 1')).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText('Search for products'), {
      target: { value: 'Product 15' },
    });

    await waitFor(() => expect(screen.getByText('Product 15')).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText('Select Product 15'));
    fireEvent.click(screen.getByText('Add to Cart (1)'));

    fireEvent.click(screen.getByText('Checkout'));

    expect(screen.getByText('Checkout stub')).toBeInTheDocument();
  });

  it('shows a retryable error state on a non-retryable failure, without waiting for retries', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => JSON.stringify({ error: 'Not Found' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderCatalog();

    await waitFor(() =>
      expect(screen.getByText('Failed to load the catalog.')).toBeInTheDocument(),
    );
    expect(screen.getByText('Repeat')).toBeInTheDocument();
    // A 404 is not retryable (withRetry only retries 503), so fetch was
    // called exactly once — this assertion also guards against the test
    // accidentally waiting through real retry delays.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
