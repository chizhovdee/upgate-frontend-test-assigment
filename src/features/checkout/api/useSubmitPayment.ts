import { useMutation } from '@tanstack/react-query';
import { httpClient, withRetry } from 'shared/api';

export interface SubmitPaymentPayload {
  cardNumber: string;
  email: string;
  cvv: string;
  expire: string;
  productIds: number[];
}

export function useSubmitPayment() {
  return useMutation({
    mutationFn: (payload: SubmitPaymentPayload) =>
      withRetry(() => httpClient.post<{ ok: true }>('/submit', payload)),
  });
}
