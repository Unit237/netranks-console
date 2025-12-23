import { useEffect, useState } from "react";

/**
 * Hook to detect if the current viewport is mobile-sized
 * Uses Tailwind's md breakpoint (768px) as the threshold
 */
export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      // Tailwind's md breakpoint is 768px
      setIsMobile(window.innerWidth < 768);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
};

