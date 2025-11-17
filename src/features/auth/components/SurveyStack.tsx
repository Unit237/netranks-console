import React from "react";
import { BiQuestionMark } from "react-icons/bi";
import Hand2 from "../../../assets/hand.svg";

export interface SurveyItem {
  title: string;
  questions: number;
  color?: string;
  icon?: React.ReactNode;
}

const DEFAULT_HEIGHT = 250;
const CARD_HEIGHT = 110;

const surveys: SurveyItem[] = [
  {
    icon: <img src={Hand2} style={{ height: 22, width: 22 }} alt="Hand" />,
    title: "Initial Brand Analysis for baked.design",
    questions: 10,
    color: "#E8F5E9",
  },
  {
    icon: <BiQuestionMark style={{ height: 15, width: 15 }} />,
    title: '"Best headphones for sleep" query',
    questions: 8,
    color: "#b627cc",
  },
  {
    icon: <BiQuestionMark style={{ height: 15, width: 15 }} />,
    title: '"Best places in Italy" query',
    questions: 9,
    color: "#db931f",
  },
];

const SurveyStack: React.FC = () => {
  const rotations = ["rotate(0deg)", "rotate(-3deg)", "rotate(0deg)"];
  const offsets = [0, 80, 170];
  const widths = ["100%", "90%", "80%"];

  return (
    <div
      aria-label="survey-stack"
      className="flex-1 relative overflow-y-auto"
      style={{ height: DEFAULT_HEIGHT }}
    >
      {surveys.map((survey, index) => {
        const rot = rotations[index] ?? rotations[rotations.length - 1];
        const top = offsets[index] ?? offsets[offsets.length - 1];
        const width = widths[index] ?? widths[widths.length - 1];
        const zIndex = Math.max(surveys.length - index, 0);

        const badgeBg = survey.color ?? "#6b7280";

        return (
          <div
            key={index}
            role="article"
            className="absolute left-0 right-0 mx-auto rounded-xl bg-white dark:bg-[#202020] transition-all duration-300 cursor-pointer hover:shadow-xl shadow-md"
            style={{
              top,
              width,
              height: CARD_HEIGHT,
              transform: rot,
              borderRadius: 12,
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              zIndex,
            }}
          >
            <div className="h-full px-3 py-2 flex flex-col items-start gap-3">
              {/* Badge / Icon */}
              <div
                aria-hidden
                className="flex items-center justify-center rounded-sm text-white"
                style={{
                  backgroundColor: badgeBg,
                  width: 40,
                  height: 40,
                  borderRadius: 8,
                  flexShrink: 0,
                }}
              >
                {/* Render icon if provided; else show first letter */}
                {survey.icon ? (
                  <div className="w-full h-full flex items-center justify-center">
                    {survey.icon}
                  </div>
                ) : (
                  <span className="text-sm font-semibold select-none">
                    {survey.title?.charAt(0)?.toUpperCase() ?? "S"}
                  </span>
                )}
              </div>

              {/* Title & meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {survey.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {survey.questions} question{survey.questions === 1 ? "" : "s"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SurveyStack;
