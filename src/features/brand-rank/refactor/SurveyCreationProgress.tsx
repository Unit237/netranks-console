import { Check, Eye, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getSurveyRun } from "../services/brandService";

interface SurveyCreationProgressProps {
  surveyRunId: string;
  p1: string;
  p2: string;
  onFinish: () => void;
}

const SurveyCreationProgress: React.FC<SurveyCreationProgressProps> = ({
  surveyRunId,
  p1,
  p2,
  onFinish,
}) => {
  const [brands, setBrands] = useState<any[]>([]);
  const [buffer, setBuffer] = useState(0);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const timeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  useEffect(() => {
    const tick = async () => {
      try {
        const surveyRun: any = await getSurveyRun(surveyRunId, p1, p2);

        const p = surveyRun.Progress;
        const total = p.Total - p.Failed;
        setBuffer(100 * (p.Asked / total));
        setProgress(100 * (p.Finished / total));
        setTotal(total);

        setBrands(surveyRun.Brands || []);

        if (p.Finished < total) {
          timeoutId.current = setTimeout(tick, 1500);
        } else {
          // Survey is complete - set to 100% and stop polling
          setProgress(100);
          setBuffer(100);
        }
      } catch (error) {
        console.error("Failed to get survey run progress", error);
        timeoutId.current = setTimeout(tick, 3000);
      }
    };

    tick();
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [surveyRunId, p1, p2]);

  const steps = [
    { icon: Check, label: "Preparing Survey", threshold: 0 },
    { icon: Loader2, label: "Querying AI Models across the web", threshold: 1 },
    {
      icon: Eye,
      label: "Analyzing Market Position & Sentiment",
      threshold: 50,
    },
    { icon: Sparkles, label: "Generating Your Dashboard", threshold: 90 },
  ];

  const getStepStatus = (threshold: number) => {
    if (progress >= 100) return "complete";
    if (progress > threshold + 10) return "complete";
    if (progress >= threshold) return "active";
    return "pending";
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-auto">
      <div className="min-h-screen p-4 sm:p-6 md:p-8 lg:p-10 w-full mx-auto transition-all duration-300 ease-in-out">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <div className="w-10 h-10 bg-gray-100 dark:bg-[#2c2c2c] rounded-lg flex items-center justify-center mb-4 sm:mb-6 transition-all duration-300">
              {progress < 100 ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
              ) : (
                <Check className="w-5 h-5 text-green-600" />
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-2">
              {progress < 100 ? "we're almost there" : "complete!"}
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              {progress < 100
                ? `Will take about ${
                    buffer === 0
                      ? 20
                      : Math.max(5, Math.round((100 - progress) * 0.2))
                  } more seconds to complete`
                : "All results are ready"}
            </p>
          </div>

          {/* Progress Bar */}
          {buffer > 0 && (
            <div className="mb-6 sm:mb-8">
              <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gray-600 transition-all duration-500 ease-out"
                  style={{ width: `${buffer}%` }}
                />
                <div
                  className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Live Progress Section */}
          <div className="rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 lg:p-12 mb-6 transition-all duration-300 bg-gray-100 dark:bg-[#2c2c2c] shadow-sm">
            <h2 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6">
              Live progress
            </h2>

            <div className="flex flex-col gap-4 sm:gap-6">
              {steps.map((step, index) => {
                const status = getStepStatus(step.threshold);
                const Icon = step.icon;

                return (
                  <div key={index} className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        status === "complete"
                          ? "bg-green-500"
                          : status === "active"
                          ? "bg-orange-500"
                          : "bg-gray-400"
                      }`}
                    >
                      {status === "active" ? (
                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-white" />
                      ) : status === "complete" ? (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                      ) : (
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                      )}
                    </div>
                    <p
                      className={`text-sm sm:text-base transition-all duration-300 ${
                        status === "active" ? "font-semibold" : "font-normal"
                      } ${
                        status === "complete" ? "opacity-100" : "opacity-70"
                      } text-gray-600 dark:text-gray-200`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Brand Ranking Table */}
          {brands.length > 0 && (
            <>
              {/* Mobile View (Card Layout) */}
              <div className="block md:hidden space-y-3 mb-6">
                {brands.map((x, i) => (
                  <div
                    key={x.Id}
                    className="bg-gray-100 dark:bg-[#2c2c2c] rounded-lg p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl font-semibold text-gray-400 dark:text-gray-200">
                          #{i + 1}
                        </span>
                        <div>
                          <p className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                            {x.Name}
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                        {total > 0 ? `${Math.round((100 * x.Count) / total)}%` : "0%"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {x.Description}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tablet/Desktop View (Table Layout) */}
              <div className="hidden md:block w-full bg-gray-100 dark:bg-[#2c2c2c] rounded-xl overflow-hidden mb-6 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-400 dark:bg-[#1c1b1b]">
                      <tr>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium whitespace-nowrap">
                          Rank
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-medium">
                          Brand
                        </th>
                        <th className="px-4 lg:px-6 py-3 lg:py-4 text-right text-sm font-medium whitespace-nowrap">
                          Visibility
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {brands.map((x, i) => (
                        <tr
                          key={x.Id}
                          className="hover:bg-gray-50 hover:dark:bg-[#1e1d1d] border-b border-gray-200 dark:border-gray-600 transition-colors duration-150"
                        >
                          <td className="px-4 lg:px-6 py-3 lg:py-4 align-top">
                            <p className="text-lg lg:text-xl font-semibold text-gray-400 dark:text-gray-200">
                              #{i + 1}
                            </p>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4">
                            <p className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-200">
                              {x.Name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {x.Description}
                            </p>
                          </td>
                          <td className="px-4 lg:px-6 py-3 lg:py-4 align-top text-right">
                            <p className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-200">
                              {total > 0 ? `${Math.round((100 * x.Count) / total)}%` : "0%"}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Finish Button */}
          {progress === 100 && (
            <div className="flex justify-center mb-6">
              <button
                onClick={onFinish}
                className="w-full sm:w-auto px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm"
              >
                Finish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyCreationProgress;

