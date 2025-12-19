import ProfileTab from "../components/ProfileTab";

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8">
          Settings
        </h1>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <ProfileTab />
        </div>
      </div>
    </div>
  );
};

export default Settings;
