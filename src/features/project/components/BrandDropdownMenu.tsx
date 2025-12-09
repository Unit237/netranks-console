import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Brand, CreateSearchPayload } from "../@types/optimization";
import { getDashboardFilterFields } from "../services/optimizeService";

interface BrandDropdownMenuProps {
  surveyId: number;
  selectedBrandName?: string | null;
  onBrandSelect: (searchPayload: CreateSearchPayload) => void;
}

const BrandDropdownMenu: React.FC<BrandDropdownMenuProps> = ({
  surveyId,
  selectedBrandName,
  onBrandSelect,
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update selectedBrand when selectedBrandName prop changes
  useEffect(() => {
    if (selectedBrandName && brands.length > 0) {
      const brand = brands.find((b) => b.Name === selectedBrandName);
      if (brand) {
        setSelectedBrand(brand);
      } else {
        // If brand not found in list, create a temporary brand object to display the name
        setSelectedBrand({ Id: 0, Name: selectedBrandName } as Brand);
      }
    } else if (!selectedBrandName) {
      setSelectedBrand(null);
    }
  }, [selectedBrandName, brands]);

  const fetchFilterData = async () => {
    // Don't fetch if surveyId is undefined or invalid
    if (!surveyId || surveyId === undefined || isNaN(surveyId)) {
      return;
    }

    try {
      const res = await getDashboardFilterFields(surveyId);
      setBrands(res.Brands);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFilterData();
  }, [surveyId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBrandSelect = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsOpen(false);

    const searchPayload: CreateSearchPayload = {
      StartDate: undefined,
      EndDate: undefined,
      QuestionIds: [],
      BrandId: brand.Id,
      BrandName: brand.Name,
      ModelIds: [],
    };

    onBrandSelect(searchPayload);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 flex items-center justify-between"
      >
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {selectedBrandName || selectedBrand?.Name || "Select a brand"}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && brands.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {brands.map((brand) => {
            const isSelected = selectedBrand?.Id === brand.Id;
            return (
              <button
                key={brand.Id}
                type="button"
                onClick={() => handleBrandSelect(brand)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                  isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div className={`text-sm font-medium ${
                  isSelected 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-900 dark:text-white"
                }`}>
                  {brand.Name}
                  {isSelected && (
                    <span className="ml-2 text-xs">✓</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrandDropdownMenu;
