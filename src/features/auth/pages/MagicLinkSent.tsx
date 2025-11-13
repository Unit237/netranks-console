import { Forward } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../app/localization/language";
import AppLogo from "../../../app/shared/ui/AppLogo";

function MagicLinkSent() {
  const navigate = useNavigate();
  const l = useLanguage().pages.magicLinkSent;

  return (
    <div className="relative min-h-screen flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-[hsl(210,100%,97%)] to-white dark:from-[hsla(210,100%,16%,0.5)] dark:to-[hsl(220,30%,5%)] transition-colors duration-300">
      {/* Floating Theme Toggle Placeholder */}
      <div className="fixed top-4 right-4">
        {/* You can add your ColorModeSelect component here if needed */}
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-[450px] mx-auto p-8 sm:p-10 rounded-xl bg-white/70 dark:bg-neutral-900/70 shadow-[0_5px_15px_rgba(0,0,0,0.05),0_15px_35px_-5px_rgba(0,0,0,0.05)] dark:shadow-[0_5px_15px_rgba(0,0,0,0.5),0_15px_35px_-5px_rgba(0,0,0,0.08)] backdrop-blur-md transition-shadow duration-300">
        {/* App Icon */}
        <AppLogo />

        <div className="flex flex-col items-center text-center mt-6">
          {/* Mail Icon */}
          <Forward className="w-14 h-14 text-gray-700 dark:text-gray-200" />

          {/* Title */}
          <h1 className="text-3xl sm:text-[2.15rem] font-semibold mt-4 text-gray-900 dark:text-gray-100">
            {l.title}
          </h1>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-4 leading-relaxed">
            {l.description1}
            <br />
            {l.description2}
          </p>

          {/* Go Back Link */}
          <button
            onClick={() => navigate("/signin")}
            className="mt-6 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
          >
            {l.goBack}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MagicLinkSent;
