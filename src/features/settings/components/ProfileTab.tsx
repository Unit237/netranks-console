import { useState, useEffect, useMemo } from "react";
import { Mail, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../auth/context/UserContext";
import { apiClient } from "../../../app/lib/api";
import token from "../../../app/utils/token";
import { useTabs } from "../../console/context/TabContext";

const ProfileTab = () => {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();
  const { closeAllTabs } = useTabs();
  const [email, setEmail] = useState("");
  
  // Store original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    email: "",
  });
  
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize with user data when available
  useEffect(() => {
    if (user) {
      const userEmail = user.EMail || "";
      setEmail(userEmail);
      
      // Store original values
      setOriginalValues({
        email: userEmail,
      });
    }
  }, [user]);
  
  // Check if there are any changes
  const hasChanges = useMemo(() => {
    const emailChanged = (email || "") !== (originalValues.email || "");
    return emailChanged;
  }, [
    email, 
    originalValues.email,
  ]);
  
  const handleSave = async () => {
    if (!hasChanges || !user) {
      console.log("Save prevented:", { hasChanges, user: !!user });
      return;
    }
    
    try {
      setSaving(true);
      setSaveError(null);
      
      console.log("Saving profile changes:", { EMail: email });
      
      // Update user via API
      const result = await apiClient.patch("api/UpdateUser", {
        EMail: email,
      });
      
      console.log("UpdateUser API response:", result);
      
      // Refresh user data to get updated values
      await refreshUser();
      
      // Update original values to reflect saved state
      setOriginalValues({
        email,
      });
      
      console.log("Profile changes saved successfully");
    } catch (error: any) {
      console.error("Failed to save profile changes:", error);
      console.error("Error details:", {
        message: error?.message,
        status: error?.status,
        response: error?.response,
      });
      setSaveError(error?.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (user) {
      setEmail(user.EMail || "");
    }
    setSaveError(null);
  };

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
      
      {/* Save Changes and Cancel Buttons - Shows when there are changes */}
      {hasChanges && (
        <div className="flex items-center justify-end gap-3 pt-6 mt-8 border-t border-gray-200 dark:border-gray-700">
          {saveError && (
            <p className="text-sm text-red-600 dark:text-red-400 mr-auto">
              {saveError}
            </p>
          )}
          <button
            onClick={handleCancel}
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Save button clicked", { hasChanges, user: !!user, email });
              handleSave();
            }}
            type="button"
            disabled={saving || !hasChanges}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${
                saving || !hasChanges
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
              }
            `}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}

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

