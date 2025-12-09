import {
  AlertCircle,
  Edit3,
  FileText,
  Hash,
  Menu,
  Tag,
  TrendingUp,
} from "lucide-react";
import React from "react";
import type { SurveyDetails } from "../../@types";

interface Task {
  id: string;
  title: string;
  description: string;
  impact: "high" | "normal";
  category: string;
  categoryIcon: React.ReactNode;
  categoryColor: string;
  completed?: boolean;
}

interface OptimizePageTabProps {
  surveyDetails: SurveyDetails;
}

const OptimizePageTab: React.FC<OptimizePageTabProps> = ({ surveyDetails: _surveyDetails }) => {
  const tasks: Task[] = [
    {
      id: "1",
      title: "Optimize description length",
      description:
        "Your description is 3x longer than top performers. Reduce by ~8,000 characters",
      impact: "high",
      category: "Content",
      categoryIcon: <Edit3 className="w-3 h-3" />,
      categoryColor: "text-orange-600",
    },
    {
      id: "2",
      title: "Add keywords",
      description:
        "Missing 3 keywords that appear in 200%+ of top results: 'ping', 'platforms', 'real-time'",
      impact: "high",
      category: "Keywords",
      categoryIcon: <Hash className="w-3 h-3" />,
      categoryColor: "text-blue-600",
    },
    {
      id: "3",
      title: "Mention top-performing brands",
      description:
        "Top content frequently mentions Promptwatch, Atomic AGI. Consider partnerships",
      impact: "normal",
      category: "Brands",
      categoryIcon: <Tag className="w-3 h-3" />,
      categoryColor: "text-purple-600",
    },
    {
      id: "4",
      title: "Cover missing topics",
      description:
        "Top results cover 'citation tracking' and 'api integration'. You're missing both",
      impact: "normal",
      category: "Topics",
      categoryIcon: <FileText className="w-3 h-3" />,
      categoryColor: "text-green-600",
    },
    {
      id: "5",
      title: "Add structured data",
      description:
        "Add tables and bullet points. Top performers average 1.5 tables; you have 0",
      impact: "normal",
      category: "Content",
      categoryIcon: <Edit3 className="w-3 h-3" />,
      categoryColor: "text-orange-600",
    },
    {
      id: "6",
      title: "Use action-oriented language",
      description:
        "Include action words and specific metrics. Top content is 40% more specific.",
      impact: "normal",
      category: "Content",
      categoryIcon: <Edit3 className="w-3 h-3" />,
      categoryColor: "text-orange-600",
    },
    {
      id: "7",
      title: "Mention top-performing brands",
      description:
        "Top content frequently mentions Promptwatch, Atomic AGI. Consider partnerships",
      impact: "normal",
      category: "Brands",
      categoryIcon: <Tag className="w-3 h-3" />,
      categoryColor: "text-purple-600",
    },
    {
      id: "8",
      title: "Cover missing topics",
      description:
        "Top results cover 'citation tracking' and 'api integration'. You're missing both",
      impact: "normal",
      category: "Topics",
      categoryIcon: <FileText className="w-3 h-3" />,
      categoryColor: "text-green-600",
    },
  ];

  return (
    <div className="flex gap-6 p-6 bg-gray-50 min-h-screen">
      {/* Left Column - Rank Card */}
      <div className="w-[30vw] flex-shrink-0">
        <div className="bg-gray-100 rounded-[20px] shadow-sm border border-gray-200">
          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-4">Current rank</div>

            <div className="pt-24 flex items-end justify-between gap-2">
              <div className="text-[19px] font-normal">12.0</div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="font-medium text-green-600">4.7 to 8.3</span>
                <span className="text-gray-400">expected rank this month</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-4">Content quality</div>

            <div className="pt-24 flex items-center justify-between gap-2">
              <div className="flex items-baseline gap-2 mb-2">
                <Menu className="w-4 h-4 text-orange-600" />
                <span className="text-gray-600 text-[19px] font-normal">
                  58
                </span>
                <span className="text-gray-300 text-[19px] font-light">
                  / 100
                </span>
              </div>
              <div className="text-sm text-gray-800">
                8 tasks{" "}
                <span className="text-gray-300">to increase your score</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Tasks */}
      <div className="flex-1">
        <div className="bg-gray-100 rounded-[20px] shadow-sm border border-gray-200">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Your tasks
              </span>
              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                16
              </span>
            </div>
          </div>

          <div className="">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="px-6 py-4 hover:bg-gray-50 transition-colors bg-white rounded-[20px] shadow-sm border border-gray-200"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    className="mt-1 px-3 py-2 text-sm bg-transparent dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-0 focus:ring-white focus:border-transparent"
                  />

                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {task.description}
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {task.impact === "high" ? (
                          <>
                            <AlertCircle className="w-3 h-3 text-red-600" />
                            <span className="text-xs font-medium text-red-600">
                              High impact
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-3 h-3 rounded-full border-2 border-gray-300" />
                            <span className="text-xs text-gray-500">
                              Normal impact
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`${task.categoryColor}`}>
                          {task.categoryIcon}
                        </span>
                        <span
                          className={`text-xs font-medium ${task.categoryColor}`}
                        >
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizePageTab;
