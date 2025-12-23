import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BrandOption } from "../../brand-rank/@types";
import type { Project } from "../../auth/@types";
import { useUser } from "../../auth/context/UserContext";
import AutocompleteBrand from "../../brand-rank/components/AutocompleteBrand";
import { useBrand } from "../../brand-rank/context/BrandContext";
import { useParams } from "../context/TabRouteParamsContext";
import { useTabs } from "../context/TabContext";

const NewSurvey = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { setSelectedBrand, setQuery } = useBrand();
  const { activeTabId, replaceTab } = useTabs();
  const { user, useActiveProjectId } = useUser();
  const [project, setProject] = useState<Project | null>(null);

  const moveToTab = () => {
    const newPath = `/console/review-questions/${projectId}`;
    replaceTab(activeTabId, {
      name: "Review Questions",
      path: newPath,
      headerName: "Review Questions",
    });
    // Update URL without causing reload - use replace to stay in same tab
    navigate(newPath, { replace: true });
  };

  const fetchProject = useCallback(async () => {
    try {
      if (!user || !user.Projects || user.Projects.length === 0) {
        return;
      }

      const primaryId = Number(projectId);

      let foundProject = primaryId
        ? user.Projects.find((p) => p.Id === primaryId)
        : undefined;

      if (projectId && !foundProject) {
        const fallbackId = Number(useActiveProjectId());
        foundProject = user.Projects.find((p) => p.Id === fallbackId);
      }

      if (!foundProject) return;

      setProject(foundProject);
      return foundProject;
    } catch (error) {
      console.error("Failed to fetch project:", error);
    }
  }, [projectId, user, useActiveProjectId]);

  useEffect(() => {
    if (user) {
      fetchProject();
    }
  }, [user, fetchProject]);

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

  const projectName = project?.Name || "Untitled project";
  const projectInitial = projectName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container flex flex-col items-start justify-center max-w-3xl mx-auto py-12 px-4">
        <div className="items-start px-20 mb-4 w-full">
          <h1 className="text-[13px] font-medium mb-2 text-gray-900 dark:text-gray-100">
            <span className="bg-gray-200 rounded-sm px-1">{projectInitial}</span> {projectName}
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
