import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Options for useAsyncData hook
 */
export interface UseAsyncDataOptions<T> {
  /**
   * Whether the fetch should be enabled. If false, the fetch won't run.
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Initial data value before the first fetch completes
   * @default null
   */
  initialData?: T | null;
  
  /**
   * Callback called when data is successfully fetched
   */
  onSuccess?: (data: T) => void;
  
  /**
   * Callback called when an error occurs
   */
  onError?: (error: Error) => void;
  
  /**
   * Whether to keep previous data when refetching (prevents flickering)
   * @default false
   */
  keepPreviousData?: boolean;
}

/**
 * Return type for useAsyncData hook
 */
export interface UseAsyncDataReturn<T> {
  /**
   * The fetched data, or null if not yet loaded or if an error occurred
   */
  data: T | null;
  
  /**
   * Whether the data is currently being fetched
   */
  loading: boolean;
  
  /**
   * Error object if the fetch failed, or null if no error
   */
  error: Error | null;
  
  /**
   * Manually trigger a refetch of the data
   */
  refetch: () => Promise<void>;
  
  /**
   * Reset the hook state (clear data and error)
   */
  reset: () => void;
}

/**
 * Custom hook for handling async data fetching with loading, error, and data states.
 * 
 * This hook encapsulates the common pattern of:
 * - Setting loading state to true before fetch
 * - Handling errors in catch block
 * - Setting loading state to false in finally block
 * - Managing data and error states
 * 
 * @example
 * ```tsx
 * // Basic usage - fetchFn should be memoized with useCallback if it uses values from scope
 * const fetchData = useCallback(async () => {
 *   const response = await fetch(`/api/data/${id}`);
 *   return response.json();
 * }, [id]);
 * 
 * const { data, loading, error, refetch } = useAsyncData(fetchData);
 * 
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <DataDisplay data={data} />;
 * ```
 * 
 * @example
 * ```tsx
 * // With conditional fetching
 * const fetchUser = useCallback(async () => fetchUserData(userId), [userId]);
 * const { data, loading, error } = useAsyncData(fetchUser, {
 *   enabled: !!userId
 * });
 * ```
 * 
 * @template T - The type of data being fetched
 * @param fetchFn - Async function that returns the data to fetch. Should be memoized with useCallback if it uses values from component scope.
 * @param options - Optional configuration options
 * @returns Object containing data, loading, error states, and refetch/reset functions
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

  // Use ref to track if component is mounted and to cancel in-flight requests
  const isMountedRef = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Reset function to clear data and error
  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  // Internal fetch function (used by both effect and refetch)
  const executeFetch = useCallback(async () => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Don't fetch if disabled
    if (!enabled) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // If keepPreviousData is false, clear data immediately
      if (!keepPreviousData) {
        setData(null);
      }

      const result = await fetchFn();

      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }

      // Check if component is still mounted
      if (!isMountedRef.current) {
        return;
      }

      setData(result);
      setLoading(false);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      // Check if request was aborted (AbortError is expected)
      if (abortController.signal.aborted) {
        return;
      }

      // Check if component is still mounted
      if (!isMountedRef.current) {
        return;
      }

      // Convert error to Error object if it isn't already
      const error = err instanceof Error ? err : new Error(String(err));

      setError(error);
      setLoading(false);

      // Call onError callback if provided
      if (onError) {
        onError(error);
      } else {
        // Default error logging
        console.error("useAsyncData fetch error:", error);
      }

      // Clear data on error (unless keepPreviousData is true)
      if (!keepPreviousData) {
        setData(null);
      }
    }
  }, [fetchFn, enabled, keepPreviousData, onSuccess, onError]);

  // Refetch function (public API)
  const refetch = useCallback(async () => {
    await executeFetch();
  }, [executeFetch]);

  // Effect to fetch data when fetchFn changes
  useEffect(() => {
    // Only fetch if enabled
    if (!enabled) {
      setLoading(false);
      return;
    }

    executeFetch();

    // Cleanup function to cancel in-flight requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // Note: executeFetch is memoized with useCallback and depends on fetchFn and options.
    // When fetchFn changes (typically because values in component scope changed),
    // executeFetch updates, which triggers this effect to refetch.
    // Users should memoize fetchFn with useCallback if they want to control when it changes.
  }, [executeFetch, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
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
