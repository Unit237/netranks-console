import { useNavigate } from "react-router-dom";
import type { BrandOption } from "../@types";
import AutocompleteBrand from "../components/AutocompleteBrand";
import { useBrand } from "../context/BrandContext";

const Brand = () => {
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="container flex flex-col items-start justify-center max-w-3xl mx-auto py-12 px-4">
        <div className="text-center mb-4 w-full">
          <h1 className="text-xl font-medium mb-2 text-gray-900 dark:text-gray-100">
            See how your brand ranks in AI conversations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            See how leading AI models view your brand in different contexts
          </p>
        </div>

        <AutocompleteBrand onSelect={onSelect} />
      </div>
    </div>
  );
};

export default Brand;

