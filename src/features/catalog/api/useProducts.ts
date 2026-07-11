import { useQuery } from '@tanstack/react-query';
import { httpClient } from 'shared/api';
import { Product } from '../model/types';
import { withRetry } from 'shared/api/retry';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => withRetry(() => httpClient.get<Product[]>('/products')),
    staleTime: Infinity,
    retry: false,
  });
}
