import { LogOut, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../app/lib/api";
import token from "../../../app/utils/token";
import { useUser } from "../../auth/context/UserContext";
import { useTabs } from "../../console/context/TabContext";

const ProfileTab = () => {
  const { user } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState<
    "immediate" | "daily"
  >("immediate");

  const navigate = useNavigate();
  const { closeAllTabs } = useTabs();

  // Initialize with user data when available
  useEffect(() => {
    if (user) {
      setName(user.Name || "");
      setEmail(user.EMail || "");
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      // Call logout API
      await apiClient.get("api/Logout");
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error);
    } finally {
      // Clear all tokens
      token.clear();

      // Close all tabs
      closeAllTabs();

      // Navigate to sign in page
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Account Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Account
        </h2>
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Your name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="your.email@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Notifications
        </h2>
        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Email notifications
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive alerts via email
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  emailNotifications
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-600"
                }
              `}
              role="switch"
              aria-checked={emailNotifications}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${emailNotifications ? "translate-x-5" : "translate-x-0"}
                `}
              />
            </button>
          </div>

          {/* In-app Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                In-app notifications
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive alerts directly in this app
              </p>
            </div>
            <button
              type="button"
              onClick={() => setInAppNotifications(!inAppNotifications)}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  inAppNotifications
                    ? "bg-blue-600"
                    : "bg-gray-200 dark:bg-gray-600"
                }
              `}
              role="switch"
              aria-checked={inAppNotifications}
            >
              <span
                className={`
                  pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                  ${inAppNotifications ? "translate-x-5" : "translate-x-0"}
                `}
              />
            </button>
          </div>

          {/* Notification Frequency */}
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Notification frequency
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setNotificationFrequency("immediate")}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md border transition-colors
                  ${
                    notificationFrequency === "immediate"
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  }
                `}
              >
                Immediate
              </button>
              <button
                type="button"
                onClick={() => setNotificationFrequency("daily")}
                className={`
                  px-4 py-2 text-sm font-medium rounded-md border transition-colors
                  ${
                    notificationFrequency === "daily"
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  }
                `}
              >
                Daily digest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Section */}
      <div className="pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileTab;
