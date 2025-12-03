import { formatNumberOrNA } from "../../hooks/utils";

const ShapSection: React.FC<{ shap: any }> = ({ shap }) => {
  if (!shap) return null;

  const pos = shap.top_positive_contributors || [];
  const neg = shap.top_negative_contributors || [];

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded border">
      <div className="font-semibold mb-2">🔍 SHAP Prediction Explanation</div>
      <div className="text-sm mb-3">
        <div>Predicted Rank: {formatNumberOrNA(shap.prediction, 3)}</div>
        <div>Base Value (avg): {formatNumberOrNA(shap.base_value, 3)}</div>
      </div>

      {!pos.length && !neg.length ? (
        <div className="text-sm text-yellow-700 bg-yellow-50 p-3 rounded">
          ⚠️ No significant feature contributions found. Check console for
          debugging.
        </div>
      ) : null}

      {pos.length ? (
        <div className="mb-3">
          <div className="font-medium text-sm">
            🔵 Top Features Improving Your Rank
          </div>
          <div className="mt-2 space-y-2">
            {pos.slice(0, 5).map((c: any, i: number) => (
              <div
                key={i}
                className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
              >
                <div className="font-medium">{c.feature_name}</div>
                <div className="text-xs">
                  {(c.shap_value > 0 ? "+" : "") +
                    (c.shap_value ?? 0).toFixed(4)}{" "}
                  — value: {(c.feature_value ?? 0).toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {neg.length ? (
        <div>
          <div className="font-medium text-sm">
            🔴 Top Features Hurting Your Rank
          </div>
          <div className="mt-2 space-y-2">
            {neg.slice(0, 5).map((c: any, i: number) => (
              <div
                key={i}
                className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm"
              >
                <div className="font-medium">{c.feature_name}</div>
                <div className="text-xs">
                  {(c.shap_value > 0 ? "+" : "") +
                    (c.shap_value ?? 0).toFixed(4)}{" "}
                  — value: {(c.feature_value ?? 0).toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ShapSection;
