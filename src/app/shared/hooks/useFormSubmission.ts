import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Options for useFormSubmission hook
 */
export interface UseFormSubmissionOptions<TData, TResult> {
  /**
   * Callback called when submission is successful
   */
  onSuccess?: (result: TResult, data: TData) => void;
  
  /**
   * Callback called when submission fails
   */
  onError?: (error: Error, data: TData) => void;
  
  /**
   * Whether to prevent double submission (default: true)
   * If true, the submit function will not execute if already submitting
   */
  preventDoubleSubmit?: boolean;
  
  /**
   * Custom error message formatter
   */
  formatError?: (error: unknown) => string;
}

/**
 * Return type for useFormSubmission hook
 */
export interface UseFormSubmissionReturn<TData, TResult> {
  /**
   * Whether the form is currently being submitted
   */
  submitting: boolean;
  
  /**
   * Error message if submission failed, or null if no error
   */
  error: string | null;
  
  /**
   * Submit handler function. Call this with your form data.
   */
  handleSubmit: (data: TData) => Promise<TResult | undefined>;
  
  /**
   * Reset the submission state (clear error)
   */
  reset: () => void;
}

/**
 * Custom hook for handling form submission with loading and error states.
 * 
 * This hook encapsulates the common pattern of:
 * - Setting submitting state to true before submission
 * - Clearing error state
 * - Handling errors in catch block
 * - Setting submitting state to false in finally block
 * 
 * @example
 * ```tsx
 * const submitForm = useCallback(async (data: FormData) => {
 *   const response = await api.post('/submit', data);
 *   return response.data;
 * }, []);
 * 
 * const { submitting, error, handleSubmit, reset } = useFormSubmission(submitForm, {
 *   onSuccess: (result) => {
 *     console.log('Success!', result);
 *     navigate('/success');
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 * 
 * <form onSubmit={(e) => {
 *   e.preventDefault();
 *   handleSubmit(formData);
 * }}>
 *   {error && <ErrorMessage>{error}</ErrorMessage>}
 *   <button disabled={submitting}>
 *     {submitting ? 'Submitting...' : 'Submit'}
 *   </button>
 * </form>
 * ```
 * 
 * @template TData - The type of data being submitted
 * @template TResult - The type of result returned from the submission
 * @param submitFn - Async function that performs the submission and returns a result
 * @param options - Optional configuration options
 * @returns Object containing submitting state, error state, handleSubmit function, and reset function
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
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef<boolean>(true);

  // Reset function to clear error
  const reset = useCallback(() => {
    setError(null);
  }, []);

  // Submit handler
  const handleSubmit = useCallback(
    async (data: TData): Promise<TResult | undefined> => {
      // Prevent double submission if enabled
      if (preventDoubleSubmit && submitting) {
        return undefined;
      }

      try {
        setSubmitting(true);
        setError(null);

        const result = await submitFn(data);

        // Check if component is still mounted
        if (!isMountedRef.current) {
          return result;
        }

        setSubmitting(false);

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(result, data);
        }

        return result;
      } catch (err) {
        // Check if component is still mounted
        if (!isMountedRef.current) {
          return undefined;
        }

        // Convert error to Error object if it isn't already
        const errorObj = err instanceof Error ? err : new Error(String(err));
        
        // Format error message
        const errorMessage = formatError
          ? formatError(err)
          : errorObj.message || "An error occurred during submission";

        setError(errorMessage);
        setSubmitting(false);

        // Call onError callback if provided
        if (onError) {
          onError(errorObj, data);
        } else {
          // Default error logging
          console.error("useFormSubmission error:", errorObj);
        }

        return undefined;
      }
    },
    [submitFn, onSuccess, onError, preventDoubleSubmit, formatError, submitting]
  );

  // Cleanup on unmount
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

