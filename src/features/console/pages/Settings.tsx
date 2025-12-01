import { LogOut, Mail, Shield, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import token from "../../../app/utils/token";
import { useUser } from "../../auth/context/UserContext";
import { useTabs } from "../context/TabContext";

const Settings = () => {
  const { user } = useUser();
  const { closeAllTabs } = useTabs();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all tokens
    token.clear();

    // Close all tabs
    closeAllTabs();

    // Navigate to sign in page
    navigate("/", { replace: true });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Account Information Section */}
      <div className="mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-[20px] border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Account Information
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Name
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.Name || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Email Address
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.EMail || "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <Shield className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  User ID
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user?.Id || "Not available"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone Section */}
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-[20px] border border-red-200 dark:border-red-900/30 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Danger Zone
            </h2>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Sign Out
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sign out of your account and clear all session data
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

