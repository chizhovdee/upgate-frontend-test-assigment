import { afterEach, describe, expect, it, vi } from 'vitest';
import { useEffect } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { Form } from './Form';
import { useCart } from 'features/catalog/model/useCart';

function LoaderStub() {
  return <div>Loader stub</div>;
}

// cartSlot (features/cart) is a module-level singleton, so its in-memory
// cache is only established once per test file. Writing to
// window.localStorage directly in a test is invisible to it -- seeding the
// cart for a test must go through the real hook API instead.
function CartSeeder({ ids }: { ids: number[] }) {
  const cart = useCart();
  useEffect(() => {
    cart.addMany(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function renderCheckout(initialEntries: string[] = ['/checkout']) {
  const queryClient = new QueryClient();
  const router = createMemoryRouter(
    [
      { path: '/', element: <div>Catalog stub</div> },
      { path: '/checkout', element: <Form /> },
      { path: '/loader', element: <LoaderStub /> },
    ],
    { initialEntries, initialIndex: initialEntries.length - 1 },
  );
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

function fillValid() {
  fireEvent.change(screen.getByLabelText('Card number'), {
    target: { value: '4242 4242 4242 4242' },
  });
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
  fireEvent.change(screen.getByLabelText('CVV'), { target: { value: '123' } });
  fireEvent.change(screen.getByLabelText('Validity period'), { target: { value: '12/26' } });
}

describe('CheckoutForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a trimmed cardNumber and the cart ids, then clears the cart and navigates to /loader', async () => {
    const { unmount } = render(<CartSeeder ids={[12, 25]} />);
    unmount();

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    renderCheckout();
    fillValid();
    fireEvent.click(screen.getByText('Pay'));

    await waitFor(() => expect(screen.getByText('Loader stub')).toBeInTheDocument());

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/submit',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          cardNumber: '4242424242424242',
          email: 'a@b.com',
          cvv: '123',
          expire: '12/26',
          productIds: [12, 25],
        }),
      }),
    );

    function CartProbe() {
      const cart = useCart();
      return <div data-testid="cart-ids">{cart.ids.join(',')}</div>;
    }
    render(<CartProbe />);
    expect(screen.getByTestId('cart-ids').textContent).toBe('');
  });

  it('does not submit an invalid form, and shows validation errors on submit attempt', () => {
    const { unmount } = render(<CartSeeder ids={[12, 25]} />);
    unmount();

    renderCheckout();
    fireEvent.click(screen.getByText('Pay'));

    expect(screen.getByText('The card number must contain 16 digits.')).toBeInTheDocument();
    expect(screen.getByText('Pay')).toBeInTheDocument(); // still on checkout
  });

  it('shows a submit-error banner and stays on checkout when the request fails', async () => {
    const { unmount } = render(<CartSeeder ids={[12, 25]} />);
    unmount();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'nope' }),
      }),
    );

    renderCheckout();
    fillValid();
    fireEvent.click(screen.getByText('Pay'));

    await waitFor(() =>
      expect(
        screen.getByText('Failed to send payment. Check your connection and try again.'),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText('Pay')).toBeInTheDocument();
  });

  it('registers a beforeunload handler once dirty, and removes it after a successful submit', async () => {
    const { unmount } = render(<CartSeeder ids={[12, 25]} />);
    unmount();

    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      }),
    );

    renderCheckout();

    expect(addSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));

    fireEvent.change(screen.getByLabelText('Card number'), { target: { value: '4' } });
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

    fillValid();
    fireEvent.click(screen.getByText('Pay'));

    await waitFor(() => expect(screen.getByText('Loader stub')).toBeInTheDocument());
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('replace-navigates to /loader, so browser back goes straight to the catalog', async () => {
    const { unmount } = render(<CartSeeder ids={[12, 25]} />);
    unmount();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      }),
    );

    // Simulate having arrived at /checkout by pushing from the catalog,
    // the same way CartPanel's "Checkout" button does.
    const router = renderCheckout(['/', '/checkout']);

    fillValid();
    fireEvent.click(screen.getByText('Pay'));

    await waitFor(() => expect(screen.getByText('Loader stub')).toBeInTheDocument());

    router.navigate(-1);

    await waitFor(() => expect(screen.getByText('Catalog stub')).toBeInTheDocument());
  });
});
