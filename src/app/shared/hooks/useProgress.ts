import { useCallback, useEffect, useRef, useState } from "react";

export interface UseProgressOptions {
  initialProgress?: number;
  estimatedDuration?: number;
  updateInterval?: number;
  maxProgressBeforeComplete?: number;
}

export interface UseProgressReturn {
  progress: number;
  setProgress: (value: number) => void;
  startTimeBasedProgress: (fromProgress?: number, toProgress?: number) => void;
  stopTimeBasedProgress: () => void;
  complete: () => void;
  reset: () => void;
}

/**
 * Custom hook for tracking progress with stages and time-based estimation.
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
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const processingProgressRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const setProgress = useCallback((value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setProgressState(clampedValue);
  }, []);

  const startTimeBasedProgress = useCallback(
    (fromProgress: number = 20, toProgress: number = maxProgressBeforeComplete) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      startTimeRef.current = Date.now();
      processingProgressRef.current = fromProgress;
      setProgress(fromProgress);

      intervalRef.current = setInterval(() => {
        if (!isMountedRef.current || !startTimeRef.current) {
          return;
        }

        const elapsed = Date.now() - startTimeRef.current;
        const progressRange = toProgress - fromProgress;
        const timeBasedProgress = Math.min(
          fromProgress + (elapsed / estimatedDuration) * progressRange,
          toProgress
        );
        
        processingProgressRef.current = Math.max(
          processingProgressRef.current,
          timeBasedProgress
        );
        
        setProgress(Math.min(processingProgressRef.current, toProgress));
      }, updateInterval);
    },
    [estimatedDuration, updateInterval, maxProgressBeforeComplete, setProgress]
  );

  const stopTimeBasedProgress = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  const complete = useCallback(() => {
    stopTimeBasedProgress();
    setProgress(100);
  }, [stopTimeBasedProgress, setProgress]);

  const reset = useCallback(() => {
    stopTimeBasedProgress();
    setProgressState(initialProgress);
  }, [stopTimeBasedProgress, initialProgress]);

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
