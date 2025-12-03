import type { Segment } from "./SegmentDetailModal";

interface SegmentCardProps {
  segment: Segment;
  rank: number;
  type: "helping" | "hurting";
  onClick: (segment: Segment) => void;
}

const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  rank,
  type,
  onClick,
}) => {
  const bgColor =
    type === "helping"
      ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
      : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";

  return (
    <div
      onClick={() => onClick(segment)}
      className={`${bgColor} border rounded-lg p-4 cursor-pointer transition-transform hover:scale-[1.02]`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
          #{rank}
        </span>
        <span className="text-sm font-bold text-slate-900 dark:text-white">
          Hybrid: {segment.hybrid_score.toFixed(3)}
        </span>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
        {segment.text}
      </p>
      <div className="flex flex-wrap gap-2 mb-2">
        {segment.tfidf_score !== undefined && (
          <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
            Uniqueness: {segment.tfidf_score.toFixed(3)}
          </span>
        )}
        {segment.ablation_score !== undefined && (
          <span className="px-2 py-1 bg-white dark:bg-slate-800 rounded text-xs font-medium text-slate-700 dark:text-slate-300">
            Preservation: {segment.ablation_score.toFixed(3)}
          </span>
        )}
      </div>
      {segment.top_keywords && segment.top_keywords.length > 0 && (
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <strong>Keywords:</strong> {segment.top_keywords.join(", ")}
        </div>
      )}
    </div>
  );
};

export default SegmentCard;
