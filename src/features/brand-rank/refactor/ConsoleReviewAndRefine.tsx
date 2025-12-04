import {
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Minus,
  Plus,
} from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTabs } from "../../console/context/TabContext";
import {
  changeSurveySchedule,
  createSurvey,
} from "../../project/services/projectService";
import type { BrandData } from "../@types";

interface ConsoleReviewAndRefineProps {
  survey: BrandData;
  questionCount: number;
  questions: string[];
}

interface Model {
  id: string;
  name: string;
  icon: string;
  costPerPrompt: number;
  iterations: number;
  enabled: boolean;
}

const ConsoleReviewAndRefine: React.FC<ConsoleReviewAndRefineProps> = ({
  survey,
  questionCount,
  questions,
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [surveyName, setSurveyName] = useState(
    survey.DescriptionOfTheBrandShort || "New Pricing Plan – Sentiment Analysis"
  );
  const [frequency, setFrequency] = useState("single-run");
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [showModelsDropdown, setShowModelsDropdown] = useState(false);

  const navigate = useNavigate();
  const { activeTabId, replaceTab, navigateToTab, addTab } = useTabs();

  const [models, setModels] = useState<Model[]>([
    {
      id: "gpt5",
      name: "Open AI GPT 5",
      icon: "🤖",
      costPerPrompt: 0.1,
      iterations: 2,
      enabled: true,
    },
    {
      id: "claude",
      name: "Claude 4 Sonnet",
      icon: "AI",
      costPerPrompt: 0.15,
      iterations: 4,
      enabled: true,
    },
    {
      id: "perplexity",
      name: "Perplexity Sonar",
      icon: "🔮",
      costPerPrompt: 0.05,
      iterations: 0,
      enabled: false,
    },
    {
      id: "gemini",
      name: "Gemini 2.5 Pro",
      icon: "G",
      costPerPrompt: 0.07,
      iterations: 0,
      enabled: false,
    },
  ]);

  const frequencies = [
    {
      id: "single-run",
      name: "Single Run",
      price: 0,
      desc: "5 free runs.",
      duration: undefined,
      numberOfRuns: 5,
      period: 24 * 0,
    },
    {
      id: "weekly-run",
      name: "Run weekly",
      price: 200,
      desc: "Runs automatically every Monday",
      duration: "weekly",
      numberOfRuns: 4,
      period: 24 * 7,
    },
    {
      id: "daily-run",
      name: "Run daily",
      price: 1200,
      desc: "Runs automatically every day",
      duration: "monthly",
      numberOfRuns: 30,
      period: 24 * 1,
    },
  ];

  const questionCountValue = questionCount || survey.Questions.length || 11;
  const totalIterations = models.reduce(
    (sum, m) => sum + (m.enabled ? m.iterations : 0),
    0
  );

  // Get runsPerMonth from selected frequency, fallback to survey data
  const selectedFrequencyData =
    frequencies.find((f) => f.id === frequency) || frequencies[0];
  const runsPerMonth =
    selectedFrequencyData?.numberOfRuns || survey.runsPerMonth || 4;

  // Calculate costs
  const costPerPrompt =
    models.reduce(
      (sum, m) => sum + (m.enabled ? m.costPerPrompt * m.iterations : 0),
      0
    ) / totalIterations;

  const monthlyCost =
    questionCountValue * totalIterations * runsPerMonth * costPerPrompt;

  const enabledModelsCount = models.filter((m) => m.enabled).length;

  const updateModelIterations = (id: string, delta: number) => {
    setModels(
      models.map((m) => {
        if (m.id === id) {
          const newIterations = Math.max(0, m.iterations + delta);
          return {
            ...m,
            iterations: newIterations,
            enabled: newIterations > 0,
          };
        }
        return m;
      })
    );
  };

  const toggleModel = (id: string) => {
    setModels(
      models.map((m) => {
        if (m.id === id) {
          const newEnabled = !m.enabled;
          return { ...m, enabled: newEnabled, iterations: newEnabled ? 1 : 0 };
        }
        return m;
      })
    );
  };

  const handleGoBack = () => {
    addTab({
      name: "New Survey",
      path: `/console/new-survey/${projectId}`,
      headerName: "New Survey",
    });
    navigateToTab(`/console/new-survey/${projectId}`);
    navigate(`/console/new-survey/${projectId}`);
  };

  const handleSubmit = async () => {
    const selectedData = {
      surveyName,
      frequency,
      questions: questionCountValue,
      totalIterations,
      runsPerMonth,
      costPerPrompt,
      monthlyCost,
      models: models
        .filter((m) => m.enabled)
        .map((m) => ({
          name: m.name,
          iterations: m.iterations,
          costPerPrompt: m.costPerPrompt,
        })),
    };

    console.log(selectedData);

    if (!projectId) {
      console.error("Project ID not found");
      return;
    }

    try {
      console.log(selectedFrequencyData);
      const schedule = await changeSurveySchedule(
        survey.Id,
        selectedFrequencyData?.period
      );

      if (schedule) {
        console.log("Schedule updated:", schedule);

        // Use the current questions from ConsoleQuestionSection (filtered to exclude deleted ones)
        const questionsToSend =
          questions.length > 0 ? questions : survey.Questions;

        const surveyId = await createSurvey(
          Number(projectId),
          selectedFrequencyData?.period,
          surveyName,
          questionsToSend
        );

        if (surveyId) {
          const surveyPath = `/console/survey/${surveyId}`;

          // Show toast notification with View button at the bottom
          toast.custom(
            (t) => (
              <div
                className={`${
                  t.visible ? "animate-enter" : "animate-leave"
                } fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] max-w-md w-full bg-black shadow-lg rounded-[20px] pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
                style={{
                  animation: t.visible
                    ? "slideInUp 0.3s ease-out"
                    : "slideOutDown 0.2s ease-in",
                }}
              >
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <svg
                            className="h-5 w-5 text-green-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-white">
                          Survey created successfully
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        // Replace current tab with survey tab seamlessly
                        replaceTab(activeTabId, {
                          name: surveyName,
                          path: surveyPath,
                          headerName: surveyName,
                        });
                        // Navigate to the survey page
                        navigate(surveyPath);
                      }}
                      className="ml-4 px-4 py-2 bg-white text-black text-sm font-medium rounded-[20px] hover:bg-gray-100 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ),
            {
              duration: 6000,
              position: "bottom-center",
            }
          );

          // Navigate to project page and ensure tab is set
          navigateToTab(`/console/project/${projectId}`);
          navigate(`/console/project/${projectId}`);
        }
      }
    } catch (error) {}
  };

  return (
    <div className="border border-gray-200 rounded-[20px] p-4">
      <div className="flex flex-col w-[40vw] h-[75vh] mx-auto">
        <div className="">
          <h1 className="text-md font- mb-8">Review & refine</h1>

          {/* Survey Name */}
          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-2">
              Survey name
            </label>
            <input
              type="text"
              value={surveyName}
              onChange={(e) => setSurveyName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Cost Summary - Collapsed View */}
          <div className="mb-6 border border-gray-200 bg-gray-50 rounded-[20px]">
            <div className="flex items-center justify-between mb-3 border border-orange-500 rounded-[20px] bg-red-50 py-2 px-4">
              <div className="flex items-center gap-2">
                {/* <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs">
                  ⚙️
                </div> */}
                <span className="text-gray-700 font-medium">Custom run:</span>
                <span className="text-xl font-semibold">
                  $
                  {(
                    Number(selectedFrequencyData?.price) + Number(monthlyCost)
                  ).toFixed(0)}
                </span>
                <span className="text-gray-600">/month</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-[20px] px-2 py-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Live cost</span>
              </div>
            </div>
            <div className="px-4 py-2">
              <div className="text-gray-600 text-sm">
                ${costPerPrompt.toFixed(2)} / prompt
              </div>
              <div className="text-gray-500 text-sm mt-1">
                {questionCountValue} questions × {totalIterations} total
                iterations × {runsPerMonth} runs/month
              </div>
            </div>
          </div>

          {/* Frequency and Models Row */}
          <div className="grid grid-cols-2 mb-6 bg-gray-100 rounded-[20px]">
            {/* Frequency Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowFrequencyDropdown(!showFrequencyDropdown);
                  setShowModelsDropdown(false);
                }}
                className="w-full px-4 py-4 border border-gray-200 rounded-[20px] hover:border-gray-300 transition-colors flex items-start justify-between bg-white"
              >
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {selectedFrequencyData?.name || frequency}
                    </div>
                    <div className="text-sm text-gray-500">
                      Survey frequency
                    </div>
                  </div>
                </div>
                {showFrequencyDropdown ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showFrequencyDropdown && (
                <div className="absolute top-full mt-2 w-full bg-gray-100 border border-gray-200 rounded-[20px] shadow-lg z-10 overflow-hidden">
                  {frequencies.map((freq) => (
                    <div
                      key={freq.id}
                      onClick={() => {
                        setFrequency(freq.id);
                        setShowFrequencyDropdown(false);
                      }}
                      className={`cursor-pointer border border-gray-100 rounded-[20px] flex items-start gap-4 w-full px-4 py-3 text-left hover:bg-gray-200 transition-colors ${
                        freq.id === frequency
                          ? "bg-gray-100"
                          : "text-gray-700 bg-white"
                      }`}
                    >
                      <div
                        className={`border border-gray-500 rounded-full h-4 w-4 mt-1 ${
                          freq.id === frequency ? "bg-black" : "bg-white"
                        }`}
                      ></div>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2 text-gray-800 text-sm">
                          <div className="">{freq.name}</div>
                          <div
                            className={`border border-gray-300 rounded-full h-1 w-1 bg-gray-300`}
                          ></div>
                          <div className="">${freq.price}</div>
                          {freq.duration && (
                            <div className="text-sm">/ {freq.duration}</div>
                          )}
                        </div>
                        <div className="text-gray-500 text-sm">{freq.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Models Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowModelsDropdown(!showModelsDropdown);
                  setShowFrequencyDropdown(false);
                }}
                className="w-full px-4 py-4 border border-gray-200 rounded-[20px] hover:border-gray-300 transition-colors flex items-center justify-between bg-white"
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-gray-400" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      {enabledModelsCount} different model
                      {enabledModelsCount !== 1 ? "s" : ""}
                    </div>
                    <div className="text-sm text-gray-500">
                      Used for queries
                    </div>
                  </div>
                </div>
                {showModelsDropdown ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              {showModelsDropdown && (
                <div className="absolute top-full right-0 mt-2 w-[22vw] bg-gray-100 border border-gray-200 rounded-[20px] shadow-lg z-10">
                  <div className="mb-4 px-4 pt-2">
                    <div className="font-semibold text-gray-900 mb-1">
                      {totalIterations} Total iterations
                    </div>
                    <div className="text-sm text-gray-600">
                      This directly multiplies your survey cost.{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        Learn more
                      </a>
                    </div>
                  </div>

                  <div className="">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className="flex items-center justify-between bg-white rounded-[20px] border border-gray-100 last:border-0 px-4 py-2"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={model.enabled}
                            onChange={() => toggleModel(model.id)}
                            className="
                              w-4 h-4
                              rounded-[4px]
                              border-black
                              bg-white
                              text-black
                              accent-black
                              focus:ring-black
                              mt-1
                            "
                          />

                          <div className="flex items-start gap-3">
                            <span className="text-lg">{model.icon}</span>
                            <div>
                              <div className="font-medium text-gray-900">
                                {model.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ≈ ${model.costPerPrompt.toFixed(2)} / prompt
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-[20px]">
                          <button
                            onClick={() => updateModelIterations(model.id, -1)}
                            disabled={model.iterations === 0}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">
                            {model.iterations}
                          </span>
                          <button
                            onClick={() => updateModelIterations(model.id, 1)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="mt-auto flex items-center justify-between text-sm">
          <button
            onClick={handleGoBack}
            className="px-6 py-1 border border-gray-200 rounded-lg hover:border-gray-300 text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2"
          >
            ← Go back
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-1 bg-black text-white rounded-lg hover:bg-gray-800 font-medium flex items-center gap-2"
          >
            Finish & save →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsoleReviewAndRefine;
