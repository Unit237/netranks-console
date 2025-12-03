import { useNavigate, useParams } from "react-router-dom";
import type { BrandOption } from "../../brand-rank/@types";
import AutocompleteBrand from "../../brand-rank/components/AutocompleteBrand";
import { useBrand } from "../../brand-rank/context/BrandContext";
import { useTabs } from "../context/TabContext";

const NewSurvey = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { setSelectedBrand, setQuery } = useBrand();
  const { activeTabId, replaceTab } = useTabs();

  const moveToTab = () => {
    replaceTab(activeTabId, {
      name: "Review Questions",
      path: `/console/review-questions/${projectId}`,
      headerName: "Review Questions",
    });

    navigate(`/console/review-questions/${projectId}`);
  };

  const onSelect = (brand: BrandOption | string) => {
    if (typeof brand === "string") {
      setQuery(brand);
      setSelectedBrand(null);
    } else {
      setQuery("");
      setSelectedBrand(brand);
    }

    moveToTab();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container flex flex-col items-start justify-center max-w-3xl mx-auto py-12 px-4">
        <div className="items-start px-20 mb-4 w-full">
          <h1 className="text-[13px] font-medium mb-2 text-gray-900 dark:text-gray-100">
            <span className="bg-gray-200 rounded-sm px-1">B</span> baked.design
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            What topic do you want to explore?
          </p>
        </div>

        <AutocompleteBrand onSelect={onSelect} />
      </div>
    </div>
  );
};

export default NewSurvey;
