import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAsyncDataOptions<T> {
  enabled?: boolean;
  initialData?: T | null;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  keepPreviousData?: boolean;
}

export interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

/**
 * Custom hook for handling async data fetching with loading, error, and data states.
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const {
    enabled = true,
    initialData = null,
    onSuccess,
    onError,
    keepPreviousData = false,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const isMountedRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  const executeFetch = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    if (!enabled) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (!keepPreviousData) {
        setData(null);
      }

      const result = await fetchFn();

      if (abortController.signal.aborted || !isMountedRef.current) {
        return;
      }

      setData(result);
      setLoading(false);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      if (abortController.signal.aborted || !isMountedRef.current) {
        return;
      }

      const error = err instanceof Error ? err : new Error(String(err));

      setError(error);
      setLoading(false);

      if (onError) {
        onError(error);
      } else {
        console.error("useAsyncData fetch error:", error);
      }

      if (!keepPreviousData) {
        setData(null);
      }
    }
  }, [fetchFn, enabled, keepPreviousData, onSuccess, onError]);

  const refetch = useCallback(async () => {
    await executeFetch();
  }, [executeFetch]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    executeFetch();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeFetch, enabled]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
  };
}
