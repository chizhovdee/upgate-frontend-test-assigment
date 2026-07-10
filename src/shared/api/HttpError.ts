export class HttpError extends Error {
  constructor(readonly status: number, readonly body?: unknown) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
  }
}