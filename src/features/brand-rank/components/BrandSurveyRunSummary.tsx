import { useNavigate } from "react-router-dom";
import type { BrandData, BrandOption } from "../@types";
import { useBrand } from "../context/BrandContext";

export function BrandSurveyRunSummary({
  query,
  brand,
  survey,
  handleSubmit,
  startingSurvey,
  deletedQuestions,
}: {
  brand: BrandOption | null;
  query: string | null;
  survey: BrandData | null;
  handleSubmit?: () => void;
  startingSurvey?: boolean;
  deletedQuestions?: Set<number>;
}) {
  const navigate = useNavigate();
  const { setSelectedBrand, setQuery } = useBrand();

  const clearBrand = () => {
    setSelectedBrand(null);
    navigate("/");
  };

  const clearQuery = () => {
    setQuery("");
    navigate("/");
  };

  return (
    <div className="w-full max-w-[800px] p-4">
      {brand && (
        <>
          {/* Brand Badge */}
          <div className="flex items-center gap-2 mb-4">
            {brand.icon ? (
              <img
                src={brand.icon}
                alt={brand.name}
                className="w-9 h-9 mr-2 rounded-md"
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-200 dark:bg-gray-700">
                ✋
              </div>
            )}
          </div>

          {/* Brand Info */}
          <div>
            <h6 className="font-medium text-[15px] text-gray-900 dark:text-gray-100 mb-1">
              {brand.name}
            </h6>
            {survey?.DescriptionOfTheBrandShort && (
              <p className="text-[13px] text-gray-600 dark:text-gray-400">
                {brand.description}
              </p>
            )}
          </div>

          <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-3">
            Review your survey and remove questions you don't like
          </p>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-3">
        {/* Go Back Button */}
        {brand ? (
          <button
            onClick={clearBrand}
            className={`flex items-center gap-1 border text-[12px] rounded-lg px-3 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-white/10`}
          >
            <span>←</span>
            Go back & tweak
          </button>
        ) : (
          <button
            onClick={clearQuery}
            className={`flex items-center gap-1 border text-[12px] rounded-lg px-3 py-1 transition-colors hover:bg-gray-100 dark:hover:bg-white/10`}
          >
            <span>←</span>
            or enter a different question
          </button>
        )}

        {/* Run Survey Button */}
        <button
          onClick={handleSubmit}
          className={`bg-orange-500 text-white flex items-center justify-center gap-2 flex-1 rounded-lg px-3 py-1 text-[12px] font-medium transition-colors`}
          disabled={startingSurvey}
        >
          {startingSurvey ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              <span>Starting the survey</span>
            </>
          ) : (
            <span>
              Run{" "}
              {(survey?.Questions?.length ?? 0) - (deletedQuestions?.size ?? 0)}{" "}
              questions
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
