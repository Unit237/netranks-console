import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { BrandOption } from "../../brand-rank/@types";
import AutocompleteBrand from "../../brand-rank/components/AutocompleteBrand";
import { useBrand } from "../../brand-rank/context/BrandContext";
import { useUser } from "../../auth/context/UserContext";
import { useTabs } from "../context/TabContext";

const NewSurvey = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { setSelectedBrand, setQuery } = useBrand();
  const { activeTabId, replaceTab } = useTabs();
  const { user, useActiveProjectId } = useUser();
  const [projectName, setProjectName] = useState<string>("");

  useEffect(() => {
    if (user && user.Projects && projectId) {
      const project = user.Projects.find((p) => p.Id === Number(projectId));
      if (project) {
        setProjectName(project.Name || "Untitled Project");
      } else {
        // Fallback: try to get project name from active project
        const activeProjectId = useActiveProjectId();
        const activeProject = user.Projects.find((p) => p.Id === activeProjectId);
        if (activeProject) {
          setProjectName(activeProject.Name || "Untitled Project");
        } else if (user.Projects.length > 0) {
          // Use first available project as fallback
          setProjectName(user.Projects[0].Name || "Untitled Project");
        }
      }
    }
  }, [user, projectId, useActiveProjectId]);

  const moveToTab = () => {
    replaceTab(activeTabId, {
      name: "Review Questions",
      path: `/console/review-questions/${projectId}`,
      headerName: "Review Questions",
    });

    navigate(`/console/review-questions/${projectId}`);
  };

  const onSelect = (brand: BrandOption | string) => {
    if (typeof brand === "string") {
      setQuery(brand);
      setSelectedBrand(null);
    } else {
      setQuery("");
      setSelectedBrand(brand);
    }

    moveToTab();
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container flex flex-col items-start justify-center max-w-3xl mx-auto py-12 px-4">
        <div className="items-start px-20 mb-4 w-full">
          <h1 className="text-[13px] font-medium mb-2 text-gray-900 dark:text-gray-100">
            {projectName ? (
              <>
                <span className="bg-gray-200 rounded-sm px-1">
                  {projectName.charAt(0).toUpperCase()}
                </span>{" "}
                {projectName}
              </>
            ) : (
              <>
                <span className="bg-gray-200 rounded-sm px-1">P</span> Project
              </>
            )}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            What topic do you want to explore?
          </p>
        </div>

        <AutocompleteBrand onSelect={onSelect} />
      </div>
    </div>
  );
};

export default NewSurvey;
