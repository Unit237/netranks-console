import type { ReactNode } from "react";
import { BrandProvider } from "../../features/brand-rank/context/BrandContext";
import { ToastProvider } from "./ToastProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <>
      <ToastProvider>
        <BrandProvider>{children}</BrandProvider>
      </ToastProvider>
    </>
  );
};
