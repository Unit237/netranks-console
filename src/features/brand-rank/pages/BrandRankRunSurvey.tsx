import { Check, Eye, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { IoShareSocial } from "react-icons/io5";
import { useNavigate, useParams } from "react-router-dom";
import { useTabs } from "../../console/context/TabContext";
import { getSurveyRun } from "../services/brandService";

export default function BrandRankSurveyRun() {
  const navigate = useNavigate();
  const params = useParams();
  const { surveyRunId, p1, p2 } = params;
  const timeoutId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const [brands, setBrands] = useState<any[]>([]);
  const [buffer, setBuffer] = useState(0);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [copied, setCopied] = useState(false);
  const { addTab } = useTabs();

  useEffect(() => {
    tick();
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  const tick = async () => {
    try {
      const surveyRun: any = await getSurveyRun(surveyRunId, p1, p2);

      const p = surveyRun.Progress;
      const total = p.Total - p.Failed;
      setBuffer(100 * (p.Asked / total));
      setProgress(100 * (p.Finished / total));
      setTotal(total);

      setBrands(surveyRun.Brands);

      if (p.Finished < total) {
        timeoutId.current = setTimeout(tick, 1500);
      } else {
        const path = `/console/dashboard/${surveyRunId}/${p1}/${p2}`;
        // Survey is complete, navigate to console dashboard
        navigate(path);

        addTab({
          name: "My First Report",
          path: path,
          headerName: "My First Report",
        });
      }
    } catch (error) {
      console.error("Failed to get survey run progress", error);
      timeoutId.current = setTimeout(tick, 3000);
    }
  };

  const gotoDashboard = () => {
    navigate(`/dashboard/${surveyRunId}/${p1}/${p2}`);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const shareData = {
      title: "NetRanks",
      text: "Hey! Checkout our brand's visibility in AI conversations",
      url: document.URL,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(document.URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard", error);
    }
  };

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
    <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-[55vw] mx-auto transition-all duration-300 ease-in-out">
      {/* Header Section */}
      <div className="mb-8">
        <div className="w-10 h-10 bg-gray-100 dark:bg-[#2c2c2c] rounded-lg flex items-center justify-center mb-6 transition-all duration-300">
          {progress < 100 ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          ) : (
            <Check className="w-5 h-5 text-green-600" />
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-semibold mb-2">
          {progress < 100 ? "we're almost there" : "complete!"}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600">
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
        <div className="mb-8">
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            {/* Buffer (asked questions) */}
            <div
              className="absolute top-0 left-0 h-full bg-gray-600 transition-all duration-500 ease-out"
              style={{ width: `${buffer}%` }}
            />
            {/* Progress (finished questions) */}
            <div
              className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Live Progress Section */}
      <div className="rounded-2xl p-6 sm:p-8 md:p-12 mb-6 transition-all duration-300 bg-gray-100 dark:bg-[#2c2c2c] shadow-sm">
        <h2 className="text-xl font-medium mb-6">Live progress</h2>

        <div className="flex flex-col gap-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step.threshold);
            const Icon = step.icon;

            return (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    status === "complete"
                      ? "bg-green-500"
                      : status === "active"
                      ? "bg-orange-500"
                      : "bg-gray-400"
                  }`}
                >
                  {status === "active" ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : status === "complete" ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Icon className="w-4 h-4 text-gray-500" />
                  )}
                </div>
                <p
                  className={`text-base transition-all duration-300 ${
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

      {/* Go to Dashboard Button */}
      {progress === 100 && brands.length > 0 && (
        <div className="flex justify-center mb-6">
          <button
            onClick={gotoDashboard}
            className="px-6 py-1 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors duration-200 shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {/* Results View */}
      {brands.length > 0 && (
        <div className="w-full bg-gray-100 dark:bg-[#2c2c2c] rounded-xl overflow-hidden mb-6 shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-400 dark:bg-[#1c1b1b]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Rank
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium">
                  Brand
                </th>
                <th className="px-6 py-4 text-right text-sm font-medium">
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
                  <td className="px-6 py-4 align-top">
                    <p className="text-xl font-semibold text-gray-400 dark:text-gray-200">
                      #{i + 1}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                      {x.Name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {x.Description}
                    </p>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <p className="text-xl font-semibold text-gray-900 dark:text-gray-200">
                      {`${Math.round((100 * x.Count) / total)}%`}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {progress === 100 && (
        <div className="flex flex-col items-center gap-4 relative z-10">
          <button
            onClick={handleShare}
            disabled={false}
            className="flex items-center gap-2 px-6 py-3 border-2 border-orange-600 text-white font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200 cursor-pointer z-10 relative"
          >
            {copied ? "Copied!" : "Share your results"}
            <IoShareSocial className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
