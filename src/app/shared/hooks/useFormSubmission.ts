import { useCallback, useEffect, useRef, useState } from "react";

export interface UseFormSubmissionOptions<TData, TResult> {
  onSuccess?: (result: TResult, data: TData) => void;
  onError?: (error: Error, data: TData) => void;
  preventDoubleSubmit?: boolean;
  formatError?: (error: unknown) => string;
}

export interface UseFormSubmissionReturn<TData, TResult> {
  submitting: boolean;
  error: string | null;
  handleSubmit: (data: TData) => Promise<TResult | undefined>;
  reset: () => void;
}

/**
 * Custom hook for handling form submission with loading and error states.
 */
export function useFormSubmission<TData, TResult = void>(
  submitFn: (data: TData) => Promise<TResult>,
  options: UseFormSubmissionOptions<TData, TResult> = {}
): UseFormSubmissionReturn<TData, TResult> {
  const {
    onSuccess,
    onError,
    preventDoubleSubmit = true,
    formatError,
  } = options;

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const isMountedRef = useRef<boolean>(true);

  const reset = useCallback(() => {
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (data: TData): Promise<TResult | undefined> => {
      if (preventDoubleSubmit && submitting) {
        return undefined;
      }

      try {
        setSubmitting(true);
        setError(null);

        const result = await submitFn(data);

        if (!isMountedRef.current) {
          return result;
        }

        setSubmitting(false);

        if (onSuccess) {
          onSuccess(result, data);
        }

        return result;
      } catch (err) {
        if (!isMountedRef.current) {
          return undefined;
        }

        const errorObj = err instanceof Error ? err : new Error(String(err));
        const errorMessage = formatError
          ? formatError(err)
          : errorObj.message || "An error occurred during submission";

        setError(errorMessage);
        setSubmitting(false);

        if (onError) {
          onError(errorObj, data);
        } else {
          console.error("useFormSubmission error:", errorObj);
        }

        return undefined;
      }
    },
    [submitFn, onSuccess, onError, preventDoubleSubmit, formatError, submitting]
  );

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    submitting,
    error,
    handleSubmit,
    reset,
  };
}
