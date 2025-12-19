import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Markdown from "../../../app/shared/ui/Markdown";
import type { AiAnswerSnippet } from "../@types";

interface CarouselItem {
  question: string;
  answer: string;
}

interface CarouselItem {
  question: string;
  answer: string;
}

interface SampleAiAnswerSnippetProps {
  aiAnswer: AiAnswerSnippet[];
}

export default function SampleAiAnswerSnippet({
  aiAnswer,
}: SampleAiAnswerSnippetProps) {
  const snippets = aiAnswer;
  const [items, setItems] = useState<(CarouselItem | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const answers = await Promise.all(
          snippets.map(async (snippet) => {
            const response = await fetch(snippet.AnswerUrl, { mode: "cors" });
            return await response.text();
          })
        );

        const carouselItems: (CarouselItem | null)[] = answers.map(
          (answer, i) => ({
            question: snippets[i].Question,
            answer,
          })
        );

        carouselItems.push(null);
        setItems(carouselItems);
      } catch (error) {
        console.error("Failed to fetch AI answers:", error);
      }
    };

    fetchAnswers();
  }, [snippets]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col gap-2 flex-grow mb-8 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 p-4">
            Actual AI answers for aiAnswer
          </h2>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-[20px] shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-2 py-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 pb-4 pl-4">
          Actual AI answers for aiAnswer
        </h2>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all hover:scale-110"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>

          {/* Content Area */}
          <div className="mx-12 overflow-hidden">
            <div
              className="h-[350px] bg-white rounded-[20px] shadow-sm p-4 transition-opacity duration-300"
              style={{
                overflowY: currentItem ? "auto" : "hidden",
              }}
            >
              {currentItem ? (
                <>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {currentItem.question}
                  </h2>
                  <Markdown content={currentItem.answer} />
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <button
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
                    onClick={() => navigate("/signin")}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-blue-600"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
