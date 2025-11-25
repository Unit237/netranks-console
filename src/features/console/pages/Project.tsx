import {
  Check,
  LayoutGrid,
  List,
  Pause,
  Plus,
  Search,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../auth/context/UserContext";
import { useTabs } from "../context/TabContext";

const Project = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useUser();

  const navigate = useNavigate();

  const { addTab } = useTabs();

  const handleCreateNewSurvey = () => {
    addTab({
      name: "New Survey",
      path: "/console/new-survey",
      headerName: "New Survey",
    });
    navigate("/console/new-survey");
  };

  if (!user) {
    return <>Loading...</>;
  }

  const project = user?.Projects?.find(
    (p) => p.Id === parseInt(projectId || "0", 10)
  );

  if (!project) {
    return <>Project not found</>;
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-600 dark:text-green-500";
      case "Paused":
        return "text-orange-600 dark:text-orange-500";
      case "Error":
        return "text-red-600 dark:text-red-500";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Active":
        return <Check className="h-4 w-4" />;
      case "Paused":
        return <Pause className="h-4 w-4" />;
      case "Error":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 48 48"
            className="h-4 w-4"
          >
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M24 10a2 2 0 0 1 2 2v18a2 2 0 1 1-4 0V12a2 2 0 0 1 2-2m0 28a2 2 0 1 0 0-4a2 2 0 0 0 0 4"
              clip-rule="evenodd"
            />
          </svg>
        );
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header with tabs */}
      <div className="bg-white dark:bg-gray-800">
        <div className="px-6 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {project?.Name || "Untitled project"}
              </span>
              <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Settings2 size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Status cards */}
        <div className="">
          <div className="grid grid-cols-4 gap-4 mb-8 rounded-[20px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            {/* Health status card */}
            <div className="border-r border-gray-200 dark:border-gray-700 px-5 py-6">
              <div className="flex items-start gap-3 mb-16">
                <div className="h-1 w-16 bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full"></div>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Okay-ish health
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Engagement metrics are steady with a small 12% increase this
                week, and brand sentiment is holding up
              </p>
            </div>

            {/* Spent card */}
            <div className="border-r border-gray-200 dark:border-gray-700 px-5 py-6">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-16">
                Spent in Oct
              </div>
              <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                $450
              </div>
            </div>

            {/* Active surveys card */}
            <div className="border-r border-gray-200 dark:border-gray-700 px-5 py-6">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-16">
                Active surveys
              </div>
              <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                6{" "}
                <span className="text-xl text-gray-400 dark:text-gray-500">
                  + 4
                </span>
              </div>
            </div>

            {/* Competitors card - moved to right side */}
            <div className="border-r border-gray-200 dark:border-gray-700 px-5 py-6">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-16">
                Competitors
              </div>
              <div className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                12{" "}
                <span className="text-xl text-gray-400 dark:text-gray-500">
                  + 2
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Surveys section */}

        {/* Header */}
        <div className="py-4 flex items-center justify-between">
          <button
            onClick={handleCreateNewSurvey}
            className="flex items-center border rounded-xl py-1 px-2 gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <Plus size={16} />
            New survey
          </button>
          <div className="flex items-center gap-3">
            <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <List size={18} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <LayoutGrid size={18} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <SlidersHorizontal size={18} />
            </button>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search surveys..."
                className="pl-9 pr-4 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-[20px] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-[20px] border border-gray-200 dark:border-gray-700">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="w-8 px-6 py-3 border-r border-gray-200 dark:border-gray-700">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                    Survey Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                    Last Run
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {project.Surveys.map((survey) => (
                  <tr
                    key={survey.Id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        {survey.HasIndicator && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                        <span className="text-sm text-gray-900 dark:text-gray-100">
                          {survey.Name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700">
                      <div
                        className={`flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300`}
                      >
                        <span className={getStatusStyles(survey.Status)}>
                          {getStatusIcon(survey.Status)}
                        </span>
                        <span>{survey.Status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      {survey.Schedule}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                      {survey.LastRun}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {survey.Cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Project;
