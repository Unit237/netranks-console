import { useEffect, useState } from "react";

const ToggleTheme = () => {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  useEffect(() => {
    const el = document.documentElement;
    if (isDark) el.classList.add("dark");
    else el.classList.remove("dark");
  }, [isDark]);
  return (
    <button
      onClick={() => setIsDark((v) => !v)}
      className="py-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-pressed={isDark}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
};

export default ToggleTheme;
