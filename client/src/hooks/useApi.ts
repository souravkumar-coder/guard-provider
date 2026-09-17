import { useCallback, useEffect, useRef, useState } from 'react';

export interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
  /** Optimistically replace the fetched data (e.g. after a local update). */
  setData: (updater: T | ((current: T | null) => T | null)) => void;
}

/**
 * Minimal data-fetching hook (a tiny stand-in for react-query):
 * handles loading/error state, cancellation on unmount and manual refetch.
 * `deps` controls when the request re-runs, like useEffect.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[]): ApiState<T> {
  const [data, setDataState] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  // Keep the latest fetcher without touching refs during render.
  const fetcherRef = useRef<() => Promise<T>>(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let active = true;
    // The microtask boundary keeps state updates out of the effect body.
    void Promise.resolve()
      .then(() => {
        if (active) {
          setLoading(true);
          setError(null);
        }
        return fetcherRef.current();
      })
      .then((result) => {
        if (active) setDataState(result);
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : 'Something went wrong');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const refetch = useCallback(() => setTick((t) => t + 1), []);
  const setData = useCallback(
    (updater: T | ((current: T | null) => T | null)) =>
      setDataState((current) =>
        typeof updater === 'function' ? (updater as (c: T | null) => T | null)(current) : updater,
      ),
    [],
  );
  return { data, error, loading, refetch, setData };
}
