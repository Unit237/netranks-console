// Custom hook for content attribution form state and localStorage management
import { useEffect, useState } from "react";
import { questions } from "./constants";

interface UseContentAttributionFormReturn {
  name: string;
  url: string;
  selectedQuestion: string;
  setName: (value: string) => void;
  setUrl: (value: string) => void;
  setSelectedQuestion: (value: string) => void;
  getQuestionText: () => string;
}

const STORAGE_PREFIX = "contentAttribution_";

export const useContentAttributionForm = (): UseContentAttributionFormReturn => {
  // Initialize from localStorage
  const getInitialName = () => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}name`);
    return saved !== null ? saved : "";
  };

  const getInitialUrl = () => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}url`);
    return saved !== null ? saved : "";
  };

  const getInitialSelectedQuestion = () => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}selectedQuestion`);
    return saved !== null ? saved : "";
  };

  const [name, setName] = useState(getInitialName);
  const [url, setUrl] = useState(getInitialUrl);
  const [selectedQuestion, setSelectedQuestion] = useState<string>(
    getInitialSelectedQuestion
  );
  const [isInitialMount, setIsInitialMount] = useState(true);

  // Save to localStorage on change (skip initial mount)
  useEffect(() => {
    if (isInitialMount) {
      setIsInitialMount(false);
      return;
    }
    localStorage.setItem(`${STORAGE_PREFIX}name`, name);
  }, [name, isInitialMount]);

  useEffect(() => {
    if (isInitialMount) return;
    localStorage.setItem(`${STORAGE_PREFIX}url`, url);
  }, [url, isInitialMount]);

  useEffect(() => {
    if (isInitialMount) return;
    localStorage.setItem(`${STORAGE_PREFIX}selectedQuestion`, selectedQuestion);
  }, [selectedQuestion, isInitialMount]);

  // Get question text from selected question or fallback to name
  const getQuestionText = (): string => {
    const selectedQuestionObj = questions.find(
      (q) => q.value === selectedQuestion
    );
    return selectedQuestionObj?.label || name;
  };

  return {
    name,
    url,
    selectedQuestion,
    setName,
    setUrl,
    setSelectedQuestion,
    getQuestionText,
  };
};
