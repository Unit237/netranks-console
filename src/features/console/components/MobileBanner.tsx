import { X } from "lucide-react";
import { useState, useEffect } from "react";

const STORAGE_KEY = "console_mobile_banner_dismissed";

const MobileBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="md:hidden bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-3 flex items-start justify-between gap-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
          💻 Better Experience on Desktop
        </p>
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
          For the best user experience and to avoid any mistakes, we recommend accessing the console section on a desktop device.
        </p>
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 rounded-md text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-800/50 transition-colors"
        aria-label="Close banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MobileBanner;

