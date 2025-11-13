import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { BrandOption } from "../@types";

interface BrandContextType {
  selectedBrand: BrandOption | null;
  setSelectedBrand: (brand: BrandOption | null) => void;
  query: string;
  setQuery: (query: string) => void;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<BrandOption | null>(null);
  const [query, setQuery] = useState<string>("");

  return (
    <BrandContext.Provider
      value={{
        selectedBrand,
        setSelectedBrand,
        query,
        setQuery,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error("useBrand must be used within a BrandProvider");
  }
  return context;
};
