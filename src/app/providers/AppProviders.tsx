import type { ReactNode } from "react";
import { BrandProvider } from "../../features/brand-rank/context/BrandContext";
import { UserProvider } from "../../features/auth/context/UserContext";
import { TabProvider } from "../../features/console/context/TabContext";
import { ToastProvider } from "./ToastProvider";

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <>
      <ToastProvider>
        <UserProvider>
          <TabProvider>
            <BrandProvider>{children}</BrandProvider>
          </TabProvider>
        </UserProvider>
      </ToastProvider>
    </>
  );
};
