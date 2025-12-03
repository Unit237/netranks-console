import React from "react";
import { FileText } from "lucide-react";

interface LengthDescriptionProps {
  lengthSuggestions: string[];
}

// Helper function to extract text from an item (string or object)
const extractText = (item: any): string => {
  if (typeof item === 'string') {
    return item;
  }
  if (typeof item === 'object' && item !== null) {
    // Try common property names first
    if (item.text) return item.text;
    if (item.message) return item.message;
    if (item.suggestion) return item.suggestion;
    if (item.value) return item.value;
    if (item.content) return item.content;
    if (item.description) return item.description;
    if (item.title) return item.title;
    
    // If it's an array with one string element, return that
    if (Array.isArray(item) && item.length === 1 && typeof item[0] === 'string') {
      return item[0];
    }
    
    // Try to find any string property
    for (const key in item) {
      if (typeof item[key] === 'string' && item[key]) {
        return item[key];
      }
    }
    
    // Last resort: format as readable string
    return JSON.stringify(item, null, 2);
  }
  return String(item || '');
};

const LengthDescription: React.FC<LengthDescriptionProps> = ({ lengthSuggestions }) => {
  if (!lengthSuggestions || !Array.isArray(lengthSuggestions) || lengthSuggestions.length === 0) return null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-xs font-medium">
          <FileText className="w-3.5 h-3.5" />
          Length
        </div>
      </div>

      <div className="space-y-2">
        {lengthSuggestions.map((item: any, idx: number) => {
          const itemStr = extractText(item);
          return (
            <div
              key={idx}
              className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <span className="text-gray-400 dark:text-gray-500">
                📏
              </span>
              <span>
                {itemStr.replace(/📏|📊|📐/g, "").trim()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LengthDescription;
