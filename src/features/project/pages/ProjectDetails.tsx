import { Check, Edit2, Pause, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoadingSpinner from "../../../app/components/LoadingSpinner";
import { canCreateSurveys } from "../../../app/utils/userRole";
import type { Project, Survey } from "../../auth/@types";
import { useUser } from "../../auth/context/UserContext";
import { useTabs } from "../../console/context/TabContext";
import { getPlanByPeriod } from "../hooks/utils";
import { renameProject } from "../services/projectService";
import { calculateLastRunAt } from "../utils/calculateLastRunAt";
import { formatLastRun } from "../utils/formatLastRun";
import { sanitizeSurveyName } from "../utils/sanitizeSurveyName";


const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const { user, useActiveProjectId, setUser } = useUser();

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

  const fetchProject = useCallback(async () => {
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

  useEffect(() => {
    if (user) {
      fetchProject();
    }
  }, [user, fetchProject]);

  useEffect(() => {
    if (project) {
      setEditedName(project.Name || "");
    }
  }, [project]);

  const handleStartEdit = () => {
    setIsEditingName(true);
    setEditedName(project?.Name || "");
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName(project?.Name || "");
  };

  const handleSaveName = async () => {
    if (!project || !projectId || !user) return;
    
    const trimmedName = editedName.trim();
    if (!trimmedName) {
      alert("Project name cannot be empty");
      return;
    }

    if (trimmedName === project.Name) {
      setIsEditingName(false);
      return;
    }

    setIsSaving(true);
    try {
      await renameProject(Number(projectId), trimmedName);
      
      // Update local project state immediately
      const updatedProject = { ...project, Name: trimmedName };
      setProject(updatedProject);
      
      // Update user context without full refresh
      if (user.Projects) {
        const updatedProjects = user.Projects.map((p) =>
          p.Id === project.Id ? { ...p, Name: trimmedName } : p
        );
        setUser({ ...user, Projects: updatedProjects });
      }
      
      setIsEditingName(false);
    } catch (error) {
      console.error("Failed to rename project:", error);
      alert("Failed to rename project. Please try again.");
      setEditedName(project.Name || "");
    } finally {
      setIsSaving(false);
    }
  };

  if (!project) {
    return <LoadingSpinner message="Loading" fullScreen />;
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
    const cleanedName = sanitizeSurveyName(survey.Name) || "Survey Details";
    addTab({
      name: cleanedName,
      path: `/console/survey/${survey.Id}`,
      headerName: cleanedName,
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
              {isEditingName ? (
                <>
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveName();
                      } else if (e.key === "Escape") {
                        handleCancelEdit();
                      }
                    }}
                    className="text-xl font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-orange-500 focus:outline-none focus:border-orange-600 px-1"
                    autoFocus
                    disabled={isSaving}
                  />
                  <button
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                    title="Save"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {project?.Name || "Untitled project"}
                  </span>
                  <button
                    onClick={handleStartEdit}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Rename project"
                  >
                    <Edit2 size={18} />
                  </button>
                </>
              )}
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
                Spent this month
              </div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                $0
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
          {canCreateSurveys(user, projectId ? parseInt(projectId, 10) : null) && (
            <button
              onClick={handleCreateNewSurvey}
              className="flex items-center border rounded-xl py-1 px-2 gap-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <Plus size={16} />
              New survey
            </button>
          )}
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
                  <th className="w-12 px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-700">
                    #
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
                {(project.Surveys || []).map((survey, index) => {
                  const plan = getPlanByPeriod(survey.SchedulePeriodHours || 0);

                  // Calculate Status from SchedulePeriodHours
                  const status =
                    (survey.SchedulePeriodHours || 0) > 0 ? "Active" : "Paused";

                  // Calculate LastRunAt from NextRunAt - SchedulePeriodHours
                  const calculatedLastRunAt = calculateLastRunAt(
                    survey.NextRunAt,
                    survey.SchedulePeriodHours || 0
                  );

                  // Format LastRunAt for display
                  const lastRunDisplay = formatLastRun(calculatedLastRunAt);

                  return (
                    <tr
                      onClick={() => surveyDetails(survey)}
                      key={survey.Id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    >
                      <td className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          {survey.HasIndicator && (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {(() => {
                              const cleanedName = sanitizeSurveyName(survey.Name);
                              return cleanedName
                                ? cleanedName.substring(0, 50) + (cleanedName.length > 50 ? "..." : "")
                                : "Untitled Survey";
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-r border-gray-200 dark:border-gray-700">
                        <div
                          className={`flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-300`}
                        >
                          <span className={getStatusStyles(status)}>
                            {getStatusIcon(status)}
                          </span>
                          <span>{status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                        {plan?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700">
                        {lastRunDisplay}
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
