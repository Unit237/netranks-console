import { useState, useEffect, useMemo } from "react";
import { User, Mail } from "lucide-react";
import { useUser } from "../../auth/context/UserContext";
import { apiClient } from "../../../app/lib/api";

const ProfileTab = () => {
  const { user, refreshUser } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [notificationFrequency, setNotificationFrequency] = useState<"immediate" | "daily">("immediate");
  
  // Store original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    name: "",
    email: "",
    emailNotifications: false,
    inAppNotifications: true,
    notificationFrequency: "immediate" as "immediate" | "daily",
  });
  
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Initialize with user data when available
  useEffect(() => {
    if (user) {
      const userName = user.Name || "";
      const userEmail = user.EMail || "";
      setName(userName);
      setEmail(userEmail);
      
      // Store original values
      setOriginalValues({
        name: userName,
        email: userEmail,
        emailNotifications: false,
        inAppNotifications: true,
        notificationFrequency: "immediate",
      });
    }
  }, [user]);
  
  // Check if there are any changes (track all fields, but only Name and Email are saved to backend)
  const hasChanges = useMemo(() => {
    const nameChanged = (name || "") !== (originalValues.name || "");
    const emailChanged = (email || "") !== (originalValues.email || "");
    const emailNotificationsChanged = emailNotifications !== originalValues.emailNotifications;
    const inAppNotificationsChanged = inAppNotifications !== originalValues.inAppNotifications;
    const frequencyChanged = notificationFrequency !== originalValues.notificationFrequency;
    
    return nameChanged || emailChanged || emailNotificationsChanged || inAppNotificationsChanged || frequencyChanged;
  }, [
    name, 
    email, 
    emailNotifications, 
    inAppNotifications, 
    notificationFrequency,
    originalValues.name, 
    originalValues.email,
    originalValues.emailNotifications,
    originalValues.inAppNotifications,
    originalValues.notificationFrequency
  ]);
  
  const handleSave = async () => {
    if (!hasChanges || !user) return;
    
    try {
      setSaving(true);
      setSaveError(null);
      
      // Update user via API
      await apiClient.patch("api/UpdateUser", {
        Name: name,
        EMail: email,
      });
      
      // Refresh user data to get updated values
      await refreshUser();
      
      // Update original values to reflect saved state
      setOriginalValues({
        name,
        email,
        emailNotifications,
        inAppNotifications,
        notificationFrequency,
      });
    } catch (error: any) {
      console.error("Failed to save profile changes:", error);
      setSaveError("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (user) {
      setName(user.Name || "");
      setEmail(user.EMail || "");
      setEmailNotifications(originalValues.emailNotifications);
      setInAppNotifications(originalValues.inAppNotifications);
      setNotificationFrequency(originalValues.notificationFrequency);
    }
    setSaveError(null);
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
                  ${
                    emailNotifications ? "translate-x-5" : "translate-x-0"
                  }
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
                  ${
                    inAppNotifications ? "translate-x-5" : "translate-x-0"
                  }
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
            onClick={handleSave}
            type="button"
            disabled={saving}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${
                saving
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200"
              }
            `}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;

