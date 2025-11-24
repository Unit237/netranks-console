import {
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Minus,
  Plus,
} from "lucide-react";
import React, { useState } from "react";
import type { BrandData } from "../@types";

interface ConsoleReviewAndRefineProps {
  survey: BrandData;
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
}) => {
  const [surveyName, setSurveyName] = useState(
    survey.BrandName || "New Pricing Plan – Sentiment Analysis"
  );
  const [frequency, setFrequency] = useState("Weekly");
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [showModelsDropdown, setShowModelsDropdown] = useState(false);

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

  const frequencies = ["Daily", "Weekly", "Bi-weekly", "Monthly"];
  const questions = survey.Questions.length || 11;
  const totalIterations = models.reduce(
    (sum, m) => sum + (m.enabled ? m.iterations : 0),
    0
  );
  const runsPerMonth = survey.runsPerMonth || 4;

  // Calculate costs
  const costPerPrompt =
    models.reduce(
      (sum, m) => sum + (m.enabled ? m.costPerPrompt * m.iterations : 0),
      0
    ) / totalIterations;

  const monthlyCost =
    questions * totalIterations * runsPerMonth * costPerPrompt;

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

  const handleSubmit = () => {
    const selectedData = {
      surveyName,
      frequency,
      questions,
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
    console.log("Selected Data:", selectedData);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-semibold mb-8">Review & refine</h1>

        {/* Survey Name */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">
            Survey name
          </label>
          <input
            type="text"
            value={surveyName}
            onChange={(e) => setSurveyName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cost Summary - Collapsed View */}
        {!showModelsDropdown && (
          <div className="mb-6 border border-orange-200 bg-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs">
                  ⚙️
                </div>
                <span className="text-gray-700 font-medium">Custom run:</span>
                <span className="text-xl font-semibold">
                  ${monthlyCost.toFixed(0)}
                </span>
                <span className="text-gray-600">/ month</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Live cost</span>
              </div>
            </div>
            <div className="text-gray-600 text-sm">
              ${costPerPrompt.toFixed(2)} / prompt
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {questions} questions × {totalIterations} total iterations ×{" "}
              {runsPerMonth} runs/month
            </div>
          </div>
        )}

        {/* Cost Summary - Expanded View */}
        {showModelsDropdown && (
          <div className="mb-6 border border-orange-200 bg-orange-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs">
                  📅
                </div>
                <span className="text-gray-700 font-medium">Weekly run:</span>
                <span className="text-xl font-semibold">
                  ${monthlyCost.toFixed(0)}
                </span>
                <span className="text-gray-600">/ month</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Live cost</span>
              </div>
            </div>
          </div>
        )}

        {/* Frequency and Models Row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Frequency Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFrequencyDropdown(!showFrequencyDropdown);
                setShowModelsDropdown(false);
              }}
              className="w-full px-4 py-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors flex items-center justify-between bg-white"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">{frequency}</div>
                  <div className="text-sm text-gray-500">Survey frequency</div>
                </div>
              </div>
              {showFrequencyDropdown ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showFrequencyDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                {frequencies.map((freq) => (
                  <button
                    key={freq}
                    onClick={() => {
                      setFrequency(freq);
                      setShowFrequencyDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      freq === frequency
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {freq}
                  </button>
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
              className="w-full px-4 py-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors flex items-center justify-between bg-white"
            >
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-gray-400" />
                <div className="text-left">
                  <div className="font-medium text-gray-900">
                    {enabledModelsCount} different model
                    {enabledModelsCount !== 1 ? "s" : ""}
                  </div>
                  <div className="text-sm text-gray-500">Used for queries</div>
                </div>
              </div>
              {showModelsDropdown ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showModelsDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-4">
                <div className="mb-4">
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

                <div className="space-y-3">
                  {models.map((model) => (
                    <div
                      key={model.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={model.enabled}
                          onChange={() => toggleModel(model.id)}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
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

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateModelIterations(model.id, -1)}
                          disabled={model.iterations === 0}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">
                          {model.iterations}
                        </span>
                        <button
                          onClick={() => updateModelIterations(model.id, 1)}
                          className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50"
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

        {/* Footer Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium flex items-center gap-2">
            ← Go back
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-medium flex items-center gap-2"
          >
            Finish & save →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsoleReviewAndRefine;
