import { AlertCircle } from "lucide-react";

export interface Segment {
  text: string;
  start: number;
  tfidf_score?: number;
  ablation_score?: number;
  shap_score?: number;
  hybrid_score: number;
  top_keywords?: string[];
}

interface SegmentDetailModalProps {
  segment: Segment;
  onClose: () => void;
}

const SegmentDetailModal: React.FC<SegmentDetailModalProps> = ({
  segment,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-indigo-500" />
            Segment Details
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              Text
            </p>
            <p className="text-slate-900 dark:text-white">{segment.text}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {segment.tfidf_score !== undefined && (
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Uniqueness Score
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {segment.tfidf_score.toFixed(3)}
                </p>
              </div>
            )}
            {segment.ablation_score !== undefined && (
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Preservation Score
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {segment.ablation_score.toFixed(3)}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                Hybrid Score
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {segment.hybrid_score.toFixed(3)}
              </p>
            </div>
          </div>

          {segment.top_keywords && segment.top_keywords.length > 0 && (
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Top Keywords
              </p>
              <div className="flex flex-wrap gap-2">
                {segment.top_keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SegmentDetailModal;
