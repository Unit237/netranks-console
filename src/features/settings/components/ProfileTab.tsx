import { LogOut, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../../../app/lib/api";
import AuthManager from "../../../app/auth/AuthManager";
import { useUser } from "../../auth/context/UserContext";
import { useTabs } from "../../console/context/TabContext";

const ProfileTab = () => {
  const { user } = useUser();
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const { closeAllTabs } = useTabs();

  // Initialize with user data when available
  useEffect(() => {
    if (user) {
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
      AuthManager.clearAllTokens();

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
                readOnly
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-not-allowed"
                placeholder="your.email@example.com"
              />
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
