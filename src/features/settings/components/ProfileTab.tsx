import { useState, useEffect, useRef } from "react";
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
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Store original values to track changes
  const originalValues = useRef({
    name: "",
    email: "",
    emailNotifications: false,
    inAppNotifications: true,
    notificationFrequency: "immediate" as "immediate" | "daily",
  });

  // Initialize with user data when available
  useEffect(() => {
    if (user) {
      const userName = user.Name || "";
      const userEmail = user.EMail || "";
      setName(userName);
      setEmail(userEmail);
      
      // Store original values
      originalValues.current = {
        name: userName,
        email: userEmail,
        emailNotifications: false,
        inAppNotifications: true,
        notificationFrequency: "immediate",
      };
    }
  }, [user]);

  // Check if there are unsaved changes
  const hasChanges =
    name !== originalValues.current.name ||
    email !== originalValues.current.email ||
    emailNotifications !== originalValues.current.emailNotifications ||
    inAppNotifications !== originalValues.current.inAppNotifications ||
    notificationFrequency !== originalValues.current.notificationFrequency;

  // Handle save changes
  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveError(null);

    try {
      // Prepare the update payload
      const updateData = {
        Name: name,
        EMail: email,
        // Note: Notification preferences are stored client-side for now
        // In the future, these can be added to the backend User model
      };

      // Make API call to update user profile
      await apiClient.patch(`api/UpdateUser`, updateData);

      // Refresh user data from server
      await refreshUser();
      
      // Update original values after successful save
      originalValues.current = {
        name,
        email,
        emailNotifications,
        inAppNotifications,
        notificationFrequency,
      };
    } catch (error) {
      console.error("Failed to save changes:", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "Failed to save changes. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel - revert to original values
  const handleCancel = () => {
    setName(originalValues.current.name);
    setEmail(originalValues.current.email);
    setEmailNotifications(originalValues.current.emailNotifications);
    setInAppNotifications(originalValues.current.inAppNotifications);
    setNotificationFrequency(originalValues.current.notificationFrequency);
  };

  return (
    <div className="space-y-6">
      {/* Account Section - Separate white card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@example.com"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section - Separate white card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
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
                    ? "bg-gray-900 dark:bg-gray-100"
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
                    ? "bg-gray-900 dark:bg-gray-100"
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
                  px-4 py-2 text-sm font-medium rounded-full transition-colors
                  ${
                    notificationFrequency === "immediate"
                      ? "border border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                `}
              >
                Immediate
              </button>
              <button
                type="button"
                onClick={() => setNotificationFrequency("daily")}
                className={`
                  px-4 py-2 text-sm font-medium rounded-full transition-colors
                  ${
                    notificationFrequency === "daily"
                      ? "border border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }
                `}
              >
                Daily digest
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save/Cancel Buttons - Only show when there are changes */}
      {hasChanges && (
        <div className="space-y-2">
          {saveError && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {saveError}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileTab;

