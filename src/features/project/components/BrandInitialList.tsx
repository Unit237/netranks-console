import type { BrandMention } from "../@types";

interface BrandInitialsListProps {
  items: BrandMention[];
}

export default function BrandInitialsList({ items }: BrandInitialsListProps) {
  const visible = items.slice(0, 3);
  const remaining = items.length - 3;

  return (
    <div className="flex items-center gap-2">
      {visible.map((item) => (
        <div
          key={item.Id}
          className="w-6 h-6 rounded flex items-center justify-center text-[13px] font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
        >
          {item.Name?.charAt(0).toUpperCase()}
        </div>
      ))}

      {remaining > 0 && (
        <div className="text-[13px] text-gray-800 dark:text-gray-200">
          +{remaining}
        </div>
      )}
    </div>
  );
}
