import { useEffect, useState, type DependencyList } from 'react';
import { ApiError, type ApiErrorReason } from './api';

export type ApiDataState<T> =
  | { status: 'loading' }
  | { status: 'error'; reason: ApiErrorReason }
  | { status: 'ready'; data: T };

/** Fetches via `loader`, exposing a small loading/error/ready state machine. Re-fetches when `deps` change. */
export function useApiData<T>(loader: () => Promise<T>, deps: DependencyList = []): ApiDataState<T> {
  const [state, setState] = useState<ApiDataState<T>>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setState({ status: 'loading' });
    loader()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', data });
      })
      .catch((err) => {
        if (cancelled) return;
        const reason = err instanceof ApiError ? err.reason : 'unknown';
        setState({ status: 'error', reason });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
