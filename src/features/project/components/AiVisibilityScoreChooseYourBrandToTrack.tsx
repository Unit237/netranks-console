import config from "../../../app/utils/config";

interface AiVisibilityScoreProps {
  visibilityScore: number;
}

export default function AiVisibilityScoreChooseYourBrandToTrack({
  visibilityScore,
}: AiVisibilityScoreProps) {
  return (
    <div className="flex flex-col gap-2 flex-grow mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">
          AI Visibility Score
        </h2>
        <div className="mb-4">
          {visibilityScore == null ? (
            <p className="text-xs opacity-50 m-0">
              Choose a brand from the filter panel above this page to track
            </p>
          ) : (
            <>
              <h1
                className="text-6xl font-bold m-0 mb-2"
                style={{ color: config.Colors.Blue }}
              >
                {parseInt((visibilityScore * 100).toString())}%
              </h1>
              <p className="text-xs opacity-50 m-0">
                Your average AI visibility score based on the recent surveys.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
