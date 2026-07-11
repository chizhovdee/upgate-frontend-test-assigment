import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';

const CatalogPage = lazy(() =>
  import('features/catalog').then((module) => ({ default: module.CatalogPage })),
);

const CheckoutPage = lazy(() =>
  import('features/checkout').then((module) => ({ default: module.CheckoutPage })),
);

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
}

export const routes = [
  { path: '/', element: withSuspense(<CatalogPage />) },
  { path: '/checkout', element: withSuspense(<CheckoutPage />) },
] satisfies RouteObject[];

export const router = createBrowserRouter(routes);
