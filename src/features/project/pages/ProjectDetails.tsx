import { Check, Pause, Plus, Settings2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Project, Survey } from "../../auth/@types";
import { useUser } from "../../auth/context/UserContext";
import { useTabs } from "../../console/context/TabContext";
import { getPlanByPeriod } from "../hooks/utils";
import { getProjectById } from "../services/projectService";

interface ProjectMetrics {
  SpendThisMonth?: {
    Label: string;
    Amount: number;
    Currency: string;
    Display: string;
  };
  ActiveSurveys?: {
    Count: number;
    Delta: number;
    DeltaDirection: string;
  };
}

const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const { user, useActiveProjectId } = useUser();

  const navigate = useNavigate();

  const { addTab } = useTabs();

  const handleCreateNewSurvey = () => {
    addTab({
      name: "New Survey",
      path: `/console/new-survey/${projectId}`,
      headerName: "New Survey",
    });
    navigate(`/console/new-survey/${projectId}`);
  };

  const fetchProduct = useCallback(async () => {
    try {
      if (!user || !user.Projects || user.Projects.length === 0) {
        return;
      }

      const primaryId = Number(projectId);

      let project = primaryId
        ? user.Projects.find((p) => p.Id === primaryId)
        : undefined;

      if (projectId && !project) {
        const fallbackId = Number(useActiveProjectId());
        project = user.Projects.find((p) => p.Id === fallbackId);
      }

      if (!project) return;

      setProject(project);
      return project;
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  }, [projectId, user, useActiveProjectId]);

  const fetchProjectMetrics = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoadingMetrics(true);
      const projectData = await getProjectById(Number(projectId));
      
      // The API returns project data with Metrics property
      if (projectData && (projectData as any).Metrics) {
        setProjectMetrics((projectData as any).Metrics);
      }
    } catch (error) {
      console.error("Failed to fetch project metrics:", error);
    } finally {
      setLoadingMetrics(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (user) {
      fetchProduct();
    }
  }, [user, fetchProduct]);

  useEffect(() => {
    if (projectId && user) {
      fetchProjectMetrics();
    }
  }, [projectId, user, fetchProjectMetrics]);

  if (!project) {
    return <>Loading...</>;
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

  const surveyDetails = (survey: Survey) => {
    addTab({
      name: survey.Name || "Survey Details",
      path: `/console/survey/${survey.Id}`,
      headerName: survey.Name || "Survey Details",
    });
    navigate(`/console/survey/${survey.Id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header with tabs */}
      <div className="">
        <div className="px-6 pt-4">
          <div className="flex items-center gap-3">
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

      <div className="p-4">
        {/* Status cards */}
        <div className="">
          <div className="grid grid-cols-2 gap-4 mb-8 rounded-[20px] border border-gray-200 dark:border-gray-700 max-w-[50%]">
            {/* Spent card */}
            <div className="border-r border-gray-200 dark:border-gray-700 px-4 py-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                {projectMetrics?.SpendThisMonth?.Label || "Spent this month"}
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {loadingMetrics ? (
                  <span className="text-gray-400">Loading...</span>
                ) : (
                  projectMetrics?.SpendThisMonth?.Display || "$0"
                )}
              </div>
            </div>

            {/* Active surveys card */}
            <div className="px-4 py-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Active surveys
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {project.Surveys?.length || 0}
                <span className="text-lg text-gray-400 dark:text-gray-500">
                  + 0
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
            {/* <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
            </div> */}
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
                {(project.Surveys || []).map((survey) => {
                  const plan = getPlanByPeriod(survey.SchedulePeriodHours);
                  return (
                    <tr
                      onClick={() => surveyDetails(survey)}
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
                            {survey.Name ? survey.Name.substring(0, 50) + "..." : "Untitled Survey"}
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
                        {plan?.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                        {survey.LastRun}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {plan?.cost === 0 ? "Free" : `${plan?.cost}/pm`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
