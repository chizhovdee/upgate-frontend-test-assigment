import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';

const CatalogPage = lazy(() =>
  import('features/catalog').then((module) => ({ default: module.CatalogPage })),
);

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<div>Loading...</div>}>{element}</Suspense>;
}

export const routes = [
  { path: '/', element: withSuspense(<CatalogPage />) },
] satisfies RouteObject[];

export const router = createBrowserRouter(routes);
