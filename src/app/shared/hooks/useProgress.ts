import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Options for useProgress hook
 */
export interface UseProgressOptions {
  /**
   * Initial progress value (0-100)
   * @default 0
   */
  initialProgress?: number;
  
  /**
   * Estimated total duration in milliseconds for time-based progress calculation
   * @default 5000
   */
  estimatedDuration?: number;
  
  /**
   * Interval in milliseconds for time-based progress updates
   * @default 100
   */
  updateInterval?: number;
  
  /**
   * Maximum progress value before completion (typically 95 to wait for actual completion)
   * @default 95
   */
  maxProgressBeforeComplete?: number;
}

/**
 * Return type for useProgress hook
 */
export interface UseProgressReturn {
  /**
   * Current progress value (0-100)
   */
  progress: number;
  
  /**
   * Update progress to a specific value
   */
  setProgress: (value: number) => void;
  
  /**
   * Start time-based progress estimation (for stages without explicit duration)
   * Starts from a given progress value and gradually increases to a target value
   * based on elapsed time and estimated duration
   * 
   * @param fromProgress - Starting progress value (default: 20)
   * @param toProgress - Target progress value (default: maxProgressBeforeComplete)
   */
  startTimeBasedProgress: (fromProgress?: number, toProgress?: number) => void;
  
  /**
   * Stop time-based progress estimation
   */
  stopTimeBasedProgress: () => void;
  
  /**
   * Complete progress (set to 100)
   */
  complete: () => void;
  
  /**
   * Reset progress to initial value
   */
  reset: () => void;
}

/**
 * Custom hook for tracking progress with stages and time-based estimation.
 * 
 * This hook encapsulates the common pattern of:
 * - Tracking progress through multiple stages (0-100)
 * - Time-based progress estimation during processing
 * - Interval-based updates
 * - Preventing progress from going backwards
 * - Automatic cleanup
 * 
 * @example
 * ```tsx
 * const { progress, setProgress, startTimeBasedProgress, stopTimeBasedProgress, complete } = useProgress({
 *   estimatedDuration: 5000,
 *   maxProgressBeforeComplete: 95
 * });
 * 
 * // Stage 1: Initializing (5%)
 * setProgress(5);
 * await new Promise(resolve => setTimeout(resolve, 50));
 * 
 * // Stage 2: Sending (15%)
 * setProgress(15);
 * await new Promise(resolve => setTimeout(resolve, 100));
 * 
 * // Stage 3: Processing (20-95% with time-based estimation)
 * startTimeBasedProgress(20, 95);
 * // ... do async work
 * stopTimeBasedProgress();
 * 
 * // Stage 4: Receiving (95%)
 * setProgress(95);
 * 
 * // Complete (100%)
 * complete();
 * ```
 * 
 * @param options - Configuration options
 * @returns Object containing progress value and control functions
 */
export function useProgress(
  options: UseProgressOptions = {}
): UseProgressReturn {
  const {
    initialProgress = 0,
    estimatedDuration = 5000,
    updateInterval = 100,
    maxProgressBeforeComplete = 95,
  } = options;

  const [progress, setProgressState] = useState<number>(initialProgress);
  
  // Refs for time-based progress tracking
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const processingProgressRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  // Update progress with backwards prevention (like original implementation)
  const setProgress = useCallback((value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setProgressState(clampedValue);
  }, []);

  // Start time-based progress estimation
  // Matches the original implementation pattern from ReviewAndQuestion.tsx
  const startTimeBasedProgress = useCallback(
    (fromProgress: number = 20, toProgress: number = maxProgressBeforeComplete) => {
      // Stop any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Initialize progress tracking
      startTimeRef.current = Date.now();
      processingProgressRef.current = fromProgress;
      
      // Set initial progress
      setProgress(fromProgress);

      // Start interval for time-based updates (matches original: every 100ms)
      intervalRef.current = setInterval(() => {
        if (!isMountedRef.current || !startTimeRef.current) {
          return;
        }

        const elapsed = Date.now() - startTimeRef.current;
        
        // Calculate progress based on elapsed time (matches original formula)
        // Original: Math.min(20 + (elapsed / estimatedDuration) * 75, 95)
        // Generalized: fromProgress + (elapsed / estimatedDuration) * (toProgress - fromProgress)
        const progressRange = toProgress - fromProgress;
        const timeBasedProgress = Math.min(
          fromProgress + (elapsed / estimatedDuration) * progressRange,
          toProgress
        );
        
        // Use the higher of time-based or current progress to prevent going backwards
        // (matches original: Math.max(processingProgress, timeBasedProgress))
        processingProgressRef.current = Math.max(
          processingProgressRef.current,
          timeBasedProgress
        );
        
        // Update progress (capped at toProgress)
        setProgress(Math.min(processingProgressRef.current, toProgress));
      }, updateInterval);
    },
    [estimatedDuration, updateInterval, maxProgressBeforeComplete, setProgress]
  );

  // Stop time-based progress estimation
  const stopTimeBasedProgress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  // Complete progress (set to 100)
  const complete = useCallback(() => {
    stopTimeBasedProgress();
    setProgress(100);
  }, [stopTimeBasedProgress, setProgress]);

  // Reset progress to initial value
  const reset = useCallback(() => {
    stopTimeBasedProgress();
    setProgressState(initialProgress);
  }, [stopTimeBasedProgress, initialProgress]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    progress,
    setProgress,
    startTimeBasedProgress,
    stopTimeBasedProgress,
    complete,
    reset,
  };
}

