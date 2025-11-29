import { Clock, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import Brand from "../refactor/Brand";
import ContentAttributionAnalyzer from "../refactor/ContentAttribute";

const Prediction: React.FC = () => {
  const [activeTab, setActiveTab] = useState("brand");
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const TabContent = () => {
    if (activeTab === "brand") {
      return <Brand />;
    } else if (activeTab === "content-attribution") {
      return <ContentAttributionAnalyzer />;
    }
    return null;
  };

  return (
    <div
      className={`transition-colors duration-200 ${
        theme === "dark" ? "dark bg-[#141414]" : ""
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
            <Sparkles className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              Prediction Engine
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-[30px] md:text-[35px] font-bold text-[#141414] dark:text-white">
            Get AI-powered predictions and
          </h1>
          <h1 className="text-[30px] md:text-[35px] font-bold">
            <span className="text-[#141414] dark:text-white">actionable </span>
            <span className="text-gray-400 dark:text-[#ffffff]0">
              suggestions to improve your
            </span>
          </h1>
          <h1 className="text-[30px] md:text-[35px] font-bold text-gray-400 dark:text-[#ffffff]0">
            content ranking
          </h1>
        </div>
        <div className="flex items-center justify-center w-full">
          <nav className="flex w-full justify-around gap-6 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm">
            {[
              { key: "brand", label: "Prediction & Suggest", icon: Clock },
              {
                key: "content-attribution",
                label: "Content Attribution",
                icon: Star,
              },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
          relative flex items-center gap-2 px-4 py-2 text-[15px] font-medium
          transition-all duration-300 rounded-md
          ${
            activeTab === key
              ? "text-emerald-500"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          }
        `}
              >
                <Icon className="w-5 h-5" />
                {label}

                {activeTab === key && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full transition-all duration-300"></span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="">
          <TabContent />
        </div>
      </div>
    </div>
  );
};

export default Prediction;
