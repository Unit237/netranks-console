import { useNavigate } from "react-router-dom";
import type { BrandOption } from "../@types";
import AutocompleteBrand from "../components/AutocompleteBrand";
import { useBrand } from "../context/BrandContext";

const BrandRank = () => {
  const navigate = useNavigate();
  const { setSelectedBrand, setQuery } = useBrand();

  const onSelect = (brand: BrandOption | string) => {
    if (typeof brand === "string") {
      setQuery(brand);

      setSelectedBrand(null);
    } else {
      setQuery("");

      setSelectedBrand(brand);
    }

    // Navigate to questions page
    navigate("/questions");
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 lg:py-0 py-8">
      <div className="container flex flex-col items-start justify-center w-full max-w-3xl mx-auto py-8 sm:py-12">
        <div className="text-center mb-4 sm:mb-6 w-full px-2">
          <h1 className="text-lg sm:text-xl md:text-2xl font-medium mb-2 text-gray-900 dark:text-gray-100">
            See your brand ranks in AI conversations
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            See how leading AI models view your brand in different contexts
          </p>
        </div>

        <AutocompleteBrand onSelect={onSelect} />
      </div>
    </div>
  );
};

export default BrandRank;
