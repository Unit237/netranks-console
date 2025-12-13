import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AppLogo() {
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <Link to="/" className="flex items-center no-underline cursor-pointer">
      <img
        src={isDark ? "/logo-dark.svg" : "/logo-light.svg"}
        alt="NetRanks Logo"
        className="md:h-auto w-auto md:max-h-[32px] h-[25px] object-contain"
      />
    </Link>
  );
}
