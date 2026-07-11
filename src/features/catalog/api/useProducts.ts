import { useQuery } from '@tanstack/react-query';
import { httpClient, withRetry } from 'shared/api';
import { Product } from '../model/types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => withRetry(() => httpClient.get<Product[]>('/products')),
    staleTime: Infinity,
    retry: false,
  });
}
